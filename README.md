# Ahmadi CMS

A GitHub-based headless CMS that manages content in other repositories. Designed to work with Astro-based templates and any other static site generators that use file-based content.

## Overview

This CMS provides a web interface for managing content in GitHub repositories. It uses GitHub's API to read, create, update, and delete files directly in repositories. All content changes are committed to GitHub as proper commits.

## Architecture

### How It Works

1. **Admin Authentication**: Admins log in with username/password (configured in `.env`)
2. **Repository Access**: The CMS uses a GitHub Personal Access Token (PAT) to access repositories
3. **Content Management**: All content is stored as JSON/Markdown files in the repository's `src/content` folder
4. **File Storage**: Uploaded files (images, etc.) are stored in `public/files`
5. **Organization**: The CMS manages repositories under a single GitHub organization (configured via `GITHUB_ORG`)

### Technology Stack

- **Frontend**: Svelte + SvelteKit
- **Backend**: SvelteKit server routes
- **API**: GitHub REST API (via Octokit)
- **Authentication**: Session-based with username/password

---

## Features

### 1. Repository Management
- List all repositories in the configured GitHub organization
- Select any repository to manage its content
- View repository contents (collections, files, images)

### 2. Collections (Content Types)
Collections are content types like "posts", "pages", "products", etc.

**Creating a Collection:**
1. Create a JSON file in `src/content/collections/` (e.g., `posts.json`)
2. Define the collection schema with fields
3. The CMS will automatically show the collection in the admin UI

**Collection Properties:**
- `slug`: Unique identifier (used in URL)
- `label`: Display name in admin UI
- `labelSingular`: Singular form (for "Add new post" buttons)
- `description`: Help text for editors
- `folder`: Folder name where content files are stored
- `create`: Boolean - whether to allow creating new entries
- `fields`: Array of field definitions

### 3. Fields & Field Types

Each field in a collection definition supports:

| Type | Description | Stores |
|------|-------------|--------|
| `text` | Single line input | String |
| `textarea` | Multi-line input | String |
| `markdown` | Markdown editor | Markdown string |
| `boolean` | Toggle switch | Boolean |
| `date` | Date picker | ISO date string |
| `image` | Image upload | File path string |
| `number` | Numeric input | Number |
| `select` | Dropdown | String |

**Field Properties:**
- `name`: Field identifier (used in frontmatter)
- `label`: Display label
- `type`: Field type (see table above)
- `required`: Boolean - whether field is mandatory
- `default`: Default value if not provided

### 4. Singletons (Settings)

Singletons are single-instance content like site settings, theme config, etc.

**Built-in Singleton Categories:**
- `site`: Site title, description, logo, favicon
- `social`: Twitter, Facebook, Instagram, LinkedIn links
- `seo`: Default SEO settings (title suffix, default image, OG settings)
- `pages`: Page-specific content

**Custom Singletons:**
You can add custom singleton sections in `config.json`:
```json
{
  "singletons": [
    { "slug": "header", "label": "Header Settings" }
  ]
}
```

### 5. File/Image Management

- All uploaded files go to `public/files/` (fixed path)
- Images can be referenced in collection fields
- Supports common image formats (jpg, png, gif, webp, svg)
- Files are accessible via GitHub CDN after commit

### 6. Page Management

Pages are defined in `config.json` and allow admins to edit specific pages:

```json
{
  "pages": [
    { "slug": "about", "label": "About Page", "path": "src/pages/about.json" }
  ]
}
```

---

## Content Structure

Each managed repository must have this folder structure:

```
repo/
├── src/
│   └── content/
│       ├── config.json           # CMS configuration
│       ├── settings.json         # Site settings/singletons data
│       └── collections/         # Collection definitions (one JSON per collection)
│           ├── posts.json
│           ├── pages.json
│           └── authors.json
├── public/
│   └── files/                   # Uploaded files (images, documents)
│       ├── images/
│       └── docs/
└── src/
    └── pages/                   # no restrictions here.
        ├── about/
        └── contact/
```

---

## Configuration

### Environment Variables

Create a `.env` file in the CMS project root:

```env
# Required
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxx
GITHUB_ORG=your_organization_name

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

**Getting a GitHub Token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select `repo` scope (full control)
4. Copy the generated token

### config.json Structure

Located at `src/content/config.json` in each managed repository:

```json
{
  "filesPath": "public/files",
  "collections": [],
  "singletons": [],
  "pages": [],
  "seo": {}
}
```

| Property | Type | Description |
|----------|------|-------------|
| `filesPath` | string | Path for uploaded files (default: `public/files`) |
| `collections` | array | Array of collection names (files in `collections/` folder) |
| `singletons` | array | Array of singleton definitions |
| `pages` | array | Array of page configurations |
| `seo` | object | Default SEO settings |

---

## API Routes

### Admin Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/admin` | GET | Redirects to repos list |
| `/admin/repos` | GET | List all accessible repositories |
| `/admin/repo/[repo]` | GET | Dashboard for a repository |
| `/admin/repo/[repo]/collection/[name]` | GET | List collection entries |
| `/admin/repo/[repo]/images` | GET/POST | Manage uploaded files |
| `/admin/repo/[repo]/settings` | GET/POST | Manage site settings |
| `/admin/repo/[repo]/singleton/[slug]` | GET/POST | Manage singleton content |

### GitHub API Integration

The CMS uses these GitHub API endpoints:

- `GET /repos/{owner}/{repo}/contents/{path}` - Read file/folder contents
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create/update file
- `DELETE /repos/{owner}/{repo}/contents/{path}` - Delete file

---

## Edge Cases & Known Limitations

### Authentication
- If GitHub token is invalid/expired, all API calls will fail
- Session expires - user needs to re-login
- Wrong credentials show error but don't reveal which field was wrong (security)

### File Operations
- **Large files**: GitHub has a 100MB file size limit
- **Binary files**: Should be base64 encoded when committing
- **File names**: GitHub filenames are case-sensitive but some systems aren't
- **Concurrent edits**: If two admins edit same file, last one wins (no locking)

### Collection Management
- **Deleting collection definition**: Doesn't delete existing content files
- **Renaming collections**: Requires renaming the folder and updating config
- **Required fields**: Can't save entry if required field is empty

### Images/Files
- **Path references**: When using image field, stores just filename - you need to construct full URL in your app
- **Duplicate names**: If same filename uploaded, GitHub will error (need to generate unique names)
- **File deletion**: Deleting from CMS deletes from GitHub permanently

### GitHub Limits
- Rate limiting: 5000 requests/hour for authenticated requests
- Commit message length: Max 72 characters recommended
- Branch: Currently works only with default branch (usually `main`)

---

## Error Handling

### Common Errors

1. **"Not Found" on repo**
   - Check that repo exists in the organization
   - Verify token has repo access

2. **"Unauthorized" errors**
   - Token may be expired
   - Token may lack required scopes

3. **"File not found" in collection**
   - Check that the folder name in definition matches actual folder
   - Verify the collection JSON definition exists

4. **Upload failures**
   - Check file size limits
   - Verify `public/files` folder exists in repo

---

## Development

### Project Structure

```
src/
├── lib/
│   ├── server/
│   │   └── github.ts        # Octokit client setup
│   └── components/         # Reusable UI components
├── routes/
│   ├── admin/
│   │   └── repo/
│   │       └── [repo]/     # Main admin routes (no [owner])
│   └── login/              # Authentication
└── content/                # CMS's own content (not managed repos)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/server/github.ts` | GitHub API client configuration |
| `src/routes/admin/repo/[repo]/+page.server.ts` | Main dashboard data loading |
| `src/routes/admin/repo/[repo]/collection/[name]/+page.server.ts` | Collection CRUD operations |
| `src/routes/admin/repo/[repo]/settings/+page.server.ts` | Settings management |
| `.env` | Environment configuration |

---

## Security Considerations

1. **Token Security**: GitHub PAT should have minimum required scopes
2. **Admin Password**: Use strong passwords in production
3. **HTTPS**: Always use HTTPS in production
4. **Session Security**: Sessions should use secure cookies in production
5. **Input Validation**: All user inputs are validated before API calls

---

## Future Enhancements

Potential features (not implemented):
- Multiple content branches support
- Draft/Published status for entries
- Media library with grid view
- Collection relationships (author → posts)
- Scheduled publishing
- Webhook notifications on content changes
