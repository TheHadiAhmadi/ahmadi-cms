# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript + Svelte type checking
npm run check:watch  # Watch mode type checking
```

## Environment Setup

Requires a `.env` file with:
```
GITHUB_TOKEN=         # GitHub Personal Access Token (repo scope)
GITHUB_ORG=           # Target GitHub organization
ADMIN_USERNAME=       # CMS admin username
ADMIN_PASSWORD=       # CMS admin password
```

## Architecture

This is a **GitHub-backed headless CMS** built with SvelteKit. It manages content in GitHub repositories within a configured organization. The CMS itself stores no content — all data lives as files in target repos.

### Data Flow

```
Browser → SvelteKit Routes → src/lib/server/github.ts (Octokit) → GitHub API → Target Repos
```

Authentication is cookie-based (7-day sessions), enforced in `src/hooks.server.ts`.

### Key Layers

- **`src/hooks.server.ts`** — Route protection middleware
- **`src/lib/server/github.ts`** — Octokit client, initialized with `GITHUB_TOKEN`
- **`src/lib/db.ts`** — IndexedDB wrapper for tracking offline pending changes
- **`src/lib/client/localSave.ts`** — Client-side functions for saving changes to IndexedDB
- **`src/lib/stores/`** — Svelte stores: toast notifications, pending changes state
- **`src/routes/api/publish/+server.ts`** — API endpoint to commit pending changes to GitHub
- **`src/routes/admin/repos/`** — Lists all repos in the GitHub org
- **`src/routes/admin/repo/[repo]/`** — Dashboard per repo (collections, singletons, files, pages)
- **`src/routes/admin/repo/[repo]/collection/[name]/`** — CRUD for collection entries
- **`src/routes/admin/repo/[repo]/settings/`** — Singletons and site settings

### Offline-First Workflow

All changes are saved locally in IndexedDB first, then committed to GitHub when the user clicks "Publish":

1. **Save Locally** — Changes (collections, pages, settings) are stored in IndexedDB via `src/lib/db.ts`
2. **Pending Changes UI** — Cloud icon in header shows pending changes count
3. **Publish** — Clicking "Publish" sends all pending changes to GitHub via `/api/publish`

This prevents unnecessary commits and allows batch publishing.

### Content Structure in Managed Repos

Target repositories must follow this structure:
```
src/content/
  config.json       # Read-only (template dev): collection schemas, singletons, filesPath
  settings.json     # Singleton data (all singletons in one file, keyed by slug)
  pages.json        # Client-editable: pages configuration
  collections/      # Collection entries (one JSON array file per collection)
    posts.json      # All entries for "posts" collection (JSON array)
    [slug].json     # One file per collection, named after collection slug
public/files/       # Uploaded media (path configurable via filesPath)
```

### config.json Schema (in managed repos)

`config.json` is **read-only** — defined by the template developer. It contains collection schemas and singletons definitions.

```json
{
  "filesPath": "public/files",
  "collections": [
    {
      "slug": "posts",
      "label": "Posts",
      "labelSingular": "Post",
      "create": true,
      "fields": [
        { "name": "title", "label": "Title", "type": "text", "required": true },
        { "name": "slug",  "label": "Slug",  "type": "text", "required": true },
        { "name": "date",  "label": "Date",  "type": "date" },
        { "name": "published", "label": "Published", "type": "boolean", "default": false },
        { "name": "content",   "label": "Content",   "type": "markdown" },
        { "name": "image",     "label": "Image",     "type": "image" }
      ]
    }
  ],
  "singletons": [{ "slug": "site", "label": "Site Settings" }],
  "seo": {}
}
```

### pages.json Schema (client-editable)

`pages.json` is **client-editable** — contains pages configuration that CMS users can modify.

```json
[
  { "slug": "about", "label": "About", "path": "src/pages/about.json", "seo": {}, "sections": [] }
]
```

### Collection Entries (`src/content/collections/[slug].json`)

Each collection stores all entries as a single JSON array in `src/content/collections/`.

```json
[
  { "title": "Hello World", "slug": "hello-world", "published": true, "date": "2024-01-01" },
  { "title": "Second Post", "slug": "second-post", "published": false, "date": "2024-01-02" }
]
```

CRUD actions (`createEntry`, `saveEntry`, `deleteEntry`) identify entries by their **array index**. Supported field types: `text`, `textarea`, `markdown`, `boolean`, `date`, `image`, `select`, `number`.

## Tech Stack

- **SvelteKit 2 / Svelte 5** with TypeScript (strict mode)
- **Tailwind CSS 4** for styling
- **Bits UI** for headless UI components
- **Octokit** for GitHub API access
- **Zod** for schema validation
- **js-yaml** for YAML parsing
- **IndexedDB** (via `src/lib/db.ts`) for client-side pending change tracking
