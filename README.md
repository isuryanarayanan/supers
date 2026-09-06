# Supers

Curiosity about the world often inspires me to explore new ideas and concepts.
Recently, I've been writing many notes—mostly in the style of blog posts—so I
decided to start sharing them here as a blog.

Hoping you enjoy them.

> This app is fully vibe coded, and you can take it and make yours if you need it.

## Agent quick start

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install
cp .env.example .env.local
cp aws/env/.env.example aws/env/.env.dev
pnpm run dev:site
```

Local UI: `http://localhost:3000`.

## Deployment quick links

- Backend functions: `pnpm run deploy:api:prod`
- GitHub Pages via Actions: `.github/workflows/deploy.yml`
- GitHub Pages manual fallback: `pnpm run deploy:pages:branch`

For the manual Pages fallback, set GitHub Pages to `Deploy from a branch`, branch `gh-pages`, folder `/root`.
See `docs/deploy/GITHUB_PAGES.md`.

