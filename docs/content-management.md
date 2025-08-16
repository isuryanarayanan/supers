# 🧰 Content Management Guide

This guide explains how content works in supers and how to create, edit, and manage it.

## Table of Contents

1. Overview
2. Post Types
3. Editor and Cells
4. Data Sources
5. Local vs API-backed Content
6. Tips & Troubleshooting

---

## 1) Overview

supers uses a flexible, cell-based content system. Posts are composed of ordered cells (markdown, image, video, file, etc.). The site works in two modes:

- Static content from `data/posts.ts` (default)
- Dynamic content via the API (optional)

## 2) Post Types

Supported types include Blog, Project, News, Paper, and Link. See details in:
- [Post Types](./content/POST_TYPES.md)

## 3) Editor and Cells

Key components:
- Visual editor: `components/editor/visual-editor.tsx`
- Markdown editor: `components/editor/markdown-editor.tsx`
- Post cell renderer: `components/post/post-cell.tsx`
- Cell types: `components/post/*-cell.tsx` (markdown, image, file, video, thumbnail)

Post editing UI (client):
- `components/editor/edit-post-client.tsx`
- `components/editor/edit-post.tsx`

## 4) Data Sources

- Static: `data/posts.ts` (generated or hand-edited)
- API: AWS Lambda functions in `functions/aws/` expose endpoints for posts and files
- Build: `scripts/build-posts.js` can fetch posts from API and generate `data/posts.ts`

## 5) Local vs API-backed Content

Local only (default):
- No backend required
- Edit `data/posts.ts`
- Run site with `npm run dev:site`

API-backed (optional):
- Start functions: `npm run dev:api`
- Sync posts: `node scripts/build-posts.js`
- Use admin/auth endpoints for protected actions

See:
- [Quick Start](./getting-started/QUICK_START.md)
- [Functions Deployment](./deploy/FUNCTIONS_AWS.md)

## 6) Tips & Troubleshooting

- If posts don’t render correctly, check `components/post/post-cell.tsx` and per-type cell components
- For API sync issues, run `npm run dev:api` and check terminal logs
- Verify environment variables for API usage: `aws/env/.env.dev` and `.env.production`
- Rebuild posts after API changes: `npm run build:posts`

Related:
- [Posts API](./api/POSTS_API.md)
- [Files API](./api/FILES_API.md)
