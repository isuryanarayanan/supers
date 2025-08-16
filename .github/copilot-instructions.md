# GitHub Copilot Instructions

This is a Next.js 13+ project using the App Router, TypeScript, Tailwind CSS, and Shadcn UI components. It's a content-driven portfolio/blog site with a cell-based content system and visual editor.

## Project Overview

### Key Technologies
- Next.js with App Router for routing and server components
- TypeScript for type safety
# Copilot Cheatsheet (answers short, point to files fast)

Next.js App Router + TypeScript + Tailwind + Shadcn. Optional AWS serverless (Lambda + API Gateway + DynamoDB + S3).

## quick find (keyword → path)
- docs hub → `docs/index.md`, `docs/README.md`
- overview/branding → `docs/intro/OVERVIEW.md`, `docs/intro/BRANDING.md`
- setup (full/quick) → `docs/setup.md`, `docs/getting-started/QUICK_START.md`
- env (frontend + functions) → `docs/getting-started/ENVIRONMENT.md`, `aws/env/.env.*`
- AWS setup (E2E) → `docs/deploy/AWS_SETUP.md`
- serverless functions (code) → `functions/aws/`; deploy guide → `docs/deploy/FUNCTIONS_AWS.md`
- DynamoDB schema → `docs/deploy/DYNAMODB_SETUP.md` (table: `Supers-Posts`)
- S3 setup/CORS/policy → `docs/deploy/S3_SETUP.md`, `aws/config/s3-cors-config.json`, `aws/config/s3-bucket-policy.json`
- CI/CD → `docs/deploy/CICD.md`
- IAM (split) → deploy: `aws/iam/deployment.json`, runtime: `aws/iam/functions.json`
- AWS scripts → check: `aws/scripts/check-aws.js`, ddb: `aws/scripts/dynamodb-init.js`, s3: `aws/scripts/s3-init.js`, cleanup: `aws/scripts/cleanup.sh`
- API docs → posts: `docs/api/POSTS_API.md`, files: `docs/api/FILES_API.md`, index: `docs/api/README.md`, `docs/api-functions.md`
- content system → guide: `docs/content-management.md`, types: `docs/content/POST_TYPES.md`, workflow: `docs/content/WORKFLOW.md`
- UI/components → `components/ui/*`
- editor → `components/editor/*`
- post renderers → `components/post/*-cell.tsx`, `components/post/post-card.tsx`, `components/post/post-cell.tsx`
- pages (App Router) → `app/*` (e.g. announcements: `app/(pages)/posts/announcements/page.tsx`)

## core facts
- Content is cell-based. Default static: `data/posts.ts`. Optional API-backed.
- Backend (optional): DynamoDB (`Supers-Posts`) + S3 via Lambda/API Gateway.
- Theme is env-only: `NEXT_PUBLIC_DEFAULT_THEME`.
- GitHub Pages base path: `NEXT_PUBLIC_BASE_PATH`.

## env vars (by intent)
- Frontend: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_DEFAULT_THEME`, `NEXT_PUBLIC_BASE_PATH`
- AWS core: `AWS_REGION`, `DYNAMODB_TABLE_NAME`, `AWS_S3_BUCKET_NAME`
- Auth: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- CORS/uploads: `ALLOWED_ORIGIN`, `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`

## route me to… (common requests)
- “check aws / services up” → `aws/scripts/check-aws.js` (uses `aws/env/.env.dev|.production`)
- “create dynamodb / s3” → `aws/scripts/dynamodb-init.js`, `aws/scripts/s3-init.js`; configs in `aws/config/*`; policies in `aws/iam/*`
- “deploy serverless / functions” → code: `functions/aws/`; how-to: `docs/deploy/FUNCTIONS_AWS.md`
- “update iam permissions” → `aws/iam/deployment.json` (provisioning), `aws/iam/functions.json` (runtime)
- “content types / editor / cells” → `docs/content-management.md`, `docs/content/POST_TYPES.md`, `components/editor/*`, `components/post/*`
- “api endpoints” → `docs/api/POSTS_API.md`, `docs/api/FILES_API.md`
- “env setup” → `docs/getting-started/ENVIRONMENT.md`, files: `aws/env/.env.*`

## mini project map
- app/: layouts/pages (App Router)
- components/: ui/, editor/, post/, layout/
- data/: `posts.ts`
- functions/aws/: serverless handlers/config
- aws/: env/, iam/, scripts/, config/
- docs/: indexes + guides (see quick find)
## Core facts (for quick reasoning)


## Common keywords → env vars


## When asked to… (routing hints)


## Minimal project map
