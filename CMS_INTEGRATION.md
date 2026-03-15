# Ahmadi CMS - Integration Guide

A GitHub-based headless CMS for managing content in your projects.

## Features

| Feature | Description |
|---------|-------------|
| **Content Management** | Create, edit, delete markdown/JSON files in your repo |
| **Image/File Management** | Upload and manage files in `public/files` |
| **GitHub-backed** | All changes committed directly to a GitHub repository |
| **Collections** | Define content collections with custom schemas |
| **Settings/Singletons** | Manage site settings, SEO, and global content |
| **Pages** | Configure admin-editable pages |

---

## Configuration

Create a `src/content/config.json` file in your repository:

```json
{
  "filesPath": "public/files",
  "collections": [],
  "singletons": [],
  "pages": [],
  "seo": {}
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `filesPath` | `public/files` | Path to uploaded files (fixed) |
| `collections` | `[]` | Array of collection definitions |
| `singletons` | `[]` | Array of singleton/settings definitions |
| `pages` | `[]` | Array of page configurations |
| `seo` | `{}` | Default SEO settings |

---

## Folder Structure

This CMS expects your project to follow this structure:

```
your-repo/
├── src/
│   └── content/
│       ├── config.json          # CMS configuration
│       ├── settings.json        # Site settings/singletons data
│       └── collections/         # Collection definitions
│           ├── posts.json       # Collection schema definition
│           ├── authors.json
│           └── books.json
└── public/
    └── files/                   # Uploaded files
        └── image.webp
```

---

## Collection Definition

Create a JSON file in `src/content/collections/` for each collection:

```json
{
  "slug": "posts",
  "label": "Posts",
  "labelSingular": "Post",
  "description": "Blog posts collection",
  "folder": "posts",
  "create": true,
  "fields": [
    {
      "name": "title",
      "label": "Title",
      "type": "text",
      "required": true
    },
    {
      "name": "slug",
      "label": "Slug",
      "type": "text",
      "required": true
    },
    {
      "name": "published",
      "label": "Published",
      "type": "boolean",
      "default": false
    },
    {
      "name": "date",
      "label": "Date",
      "type": "date",
      "required": true
    },
    {
      "name": "content",
      "label": "Content",
      "type": "markdown"
    },
    {
      "name": "image",
      "label": "Featured Image",
      "type": "image"
    }
  ]
}
```

| Field Property | Description |
|----------------|-------------|
| `slug` | Unique identifier for the collection |
| `label` | Display name in the admin UI |
| `labelSingular` | Singular form for labels |
| `description` | Collection description |
| `folder` | Folder name where content files are stored |
| `create` | Whether to allow creating new entries |
| `fields` | Array of field definitions |

### Field Types

| Type | Description |
|------|-------------|
| `text` | Single line text input |
| `textarea` | Multi-line text input |
| `markdown` | Markdown editor |
| `boolean` | Toggle switch |
| `date` | Date picker |
| `image` | Image upload |
| `select` | Dropdown selection |
| `number` | Numeric input |

---

## Settings (Singletons)

The `src/content/settings.json` file stores singleton/settings data:

```json
{
  "site": {
    "title": "My Site",
    "description": "",
    "logo": "",
    "favicon": ""
  },
  "social": {
    "twitter": "",
    "facebook": "",
    "instagram": "",
    "linkedin": ""
  },
  "seo": {
    "titleSuffix": " | My Site",
    "defaultImage": "",
    "twitterCard": "summary_large_image",
    "ogImage": ""
  },
  "pages": {}
}
```

---

## CMS Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/repos` | GET | List all repositories |
| `/admin/repo/[repo]` | GET | List content, collections & files |
| `/admin/repo/[repo]/collection/[name]` | GET | List collection entries |
| `/admin/repo/[repo]/edit/[...path]` | GET/POST | Edit file content |
| `/admin/repo/[repo]/images` | GET | Manage uploaded files |
| `/admin/repo/[repo]/settings` | GET/POST | Manage site settings |
| `/admin/repo/[repo]/singleton/[slug]` | GET/POST | Manage singleton content |

---

## Environment Variables

When self-hosting the CMS, configure these variables:

```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_ORG=your_github_organization
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

### Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic) with these scopes:
   - `repo` (full control)
3. Copy the token and add it to your `.env` file

---

## Example: Fetching Content

### Fetch Collection Entries

```typescript
// Fetch all posts from a collection
const response = await fetch('https://api.github.com/repos/your-org/your-repo/contents/src/content/posts', {
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`
  }
});
const files = await response.json();
```

### Fetch Settings

```typescript
// Fetch site settings
const response = await fetch('https://api.github.com/repos/your-org/your-repo/contents/src/content/settings.json', {
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`
  }
});
const settings = JSON.parse(Buffer.from((await response.json()).content, 'base64').toString());
```

---

## Admin UI

Once configured, access the CMS admin panel at `/admin`. You'll see:

- **Dashboard**: Overview of collections, files, and pages
- **Collections**: Manage content entries (blog posts, products, etc.)
- **Files**: Upload and manage images/files in `public/files`
- **Settings**: Edit site settings, SEO, and social links
- **Singletons**: Manage custom singleton content types
