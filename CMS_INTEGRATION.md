# Ahmadi CMS - Integration Guide

A GitHub-based headless CMS for managing content in your Astro projects.

## Features

| Feature | Description |
|---------|-------------|
| **Content Management** | Create, edit, delete markdown/JSON files in your repo |
| **Folder Support** | Organize content in nested folders |
| **Image Management** | Upload and manage images in `public/files` |
| **GitHub-backed** | All changes committed directly to your GitHub repository |
| **Configurable Paths** | Customize content and media directories |

---

## Configuration

Create a `cms.config.json` file in your repository root:

```json
{
  "collections": [],
  "contentPath": "src/content",
  "imagePath": "public/files"
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `contentPath` | `src/content` | Directory for content files |
| `imagePath` | `public/files` | Directory for uploaded images |

---

## Folder Structure

This CMS expects your Astro project to follow this structure:

```
your-astro-repo/
├── cms.config.json
├── src/
│   └── content/
│       ├── blog/
│       │   ├── post-1.md
│       │   └── post-2.md
│       └── pages/
│           └── about.md
└── public/
    └── files/
        └── image.jpg
```

---

## Content File Format

### Markdown Files

```markdown
---
title: My Post
date: 2024-01-15
description: A brief description
---

# Hello World

Your content here...
```

### JSON Files

```json
{
  "title": "Settings",
  "items": ["item1", "item2"]
}
```

---

## Astro Integration

### 1. Fetching Content

Use GitHub's raw content API or a build-time fetch:

```typescript
// src/lib/content.ts
const GITHUB_OWNER = 'thehadiahmadi-projects';
const GITHUB_REPO = 'your-repo-name';
const CONTENT_PATH = 'src/content';

export async function getContentFiles() {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_PATH}`
  );
  return response.json();
}

export async function getFileContent(path: string) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  );
  const data = await response.json();
  return atob(data.content);
}
```

### 2. Using Astro Content Collections

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
  }),
});

export const collections = { blog };
```

### 3. Listing All Files in a Folder

```typescript
// Fetch all files recursively from a folder
async function getFolderContents(path: string): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  );
  const items = await response.json();
  
  const files: any[] = [];
  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else if (item.type === 'dir') {
      const subFiles = await getFolderContents(item.path);
      files.push(...subFiles);
    }
  }
  
  return files;
}
```

### 4. Image URLs

Uploaded images are accessible at:

```
https://raw.githubusercontent.com/{owner}/{repo}/main/public/files/{filename}
```

Or configure your Astro site to serve from `/files/`.

---

## API Reference

### CMS Endpoints (when self-hosted)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/repos` | GET | List all repositories |
| `/admin/repo/[owner]/[repo]` | GET | List content & images |
| `/admin/repo/[owner]/[repo]/edit/[...path]` | GET/POST | Edit file content |

### GitHub API

```typescript
// Get repository contents
GET /repos/{owner}/{repo}/contents/{path}

// Create/update file
PUT /repos/{owner}/{repo}/contents/{path}

// Delete file
DELETE /repos/{owner}/{repo}/contents/{path}
```

---

## Environment Variables

If self-hosting the CMS:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_ORG=thehadiahmadi-projects
SESSION_SECRET=your_secret
```

---

## Example: Astro Page for Blog Index

```astro
---
// src/pages/blog/index.astro
import { getContentFiles, getFileContent } from '$lib/content';

const files = await getContentFiles();
const blogFiles = files.filter(f => f.name.endsWith('.md'));

const posts = await Promise.all(
  blogFiles.map(async (file) => {
    const content = await getFileContent(file.path);
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
    const metadata = frontmatter ? 
      Object.fromEntries(
        frontmatter[1].split('\n').map(line => {
          const [key, ...value] = line.split(':');
          return [key.trim(), value.join(':').trim()];
        })
      ) : {};
    
    return { path: file.path, ...metadata };
  })
);
---

<h1>Blog</h1>
<ul>
  {posts.map(post => (
    <li>
      <a href={`/blog/${post.path}`}>{post.title}</a>
    </li>
  ))}
</ul>
```
