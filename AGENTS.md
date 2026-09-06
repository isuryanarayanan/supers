# Agent Notes for supers

## Package manager

Use pnpm through Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install
```

The workspace includes the root app and `functions/aws`.

## Local development

Frontend only:

```bash
cp .env.example .env.local
pnpm run dev:site
```

Backend/functions locally:

```bash
cp aws/env/.env.example aws/env/.env.dev
pnpm run dev:api
```

The local functions currently call real AWS S3/DynamoDB unless code is changed for local endpoints.

## Environment files

Commit only example env files:

- `.env.example`
- `.env.production.local.example`
- `aws/env/.env.example`
- `aws/env/.env.deployment.example`

Do not commit `.env.local`, `aws/env/.env.dev`, `aws/env/.env.production`, or deployment credential files.

## Backend deployment

Deploy Serverless functions:

```bash
pnpm run deploy:api:prod
```

Runtime env is loaded from `aws/env/.env.production` for prod.

## Frontend / GitHub Pages deployment

There are two supported paths. Keep both:

1. GitHub Actions: `.github/workflows/deploy.yml`
2. Manual branch fallback: `pnpm run deploy:pages:branch`

Current manual fallback builds static output and pushes `out/` to the `gh-pages` branch. GitHub Pages should be configured as:

```text
Settings → Pages → Deploy from a branch → gh-pages / root
```

Always build GitHub Pages with:

```env
NEXT_PUBLIC_BASE_PATH=/supers
NEXT_PUBLIC_API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod
NEXT_PUBLIC_MAX_FILE_SIZE=1073741824
```

## Upload limit

Upload limit is 1GB:

- Backend: `MAX_FILE_SIZE=1073741824`
- Frontend: `NEXT_PUBLIC_MAX_FILE_SIZE=1073741824`

Large files use the presigned S3 upload path. The current presigned PUT URL flow validates size when issuing the URL; S3 itself does not enforce a content-length policy for PUT. If strict S3-side size enforcement is needed, switch to presigned POST with a `content-length-range` condition.

## Useful docs

- `docs/getting-started/QUICK_START.md`
- `docs/getting-started/ENVIRONMENT.md`
- `docs/deploy/GITHUB_PAGES.md`
- `docs/deploy/FUNCTIONS_AWS.md`
- `docs/deployment.md`
