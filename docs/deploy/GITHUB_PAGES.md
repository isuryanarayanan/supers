# GitHub Pages Deployment

This project supports two GitHub Pages deployment paths:

1. **GitHub Actions** using `.github/workflows/deploy.yml`.
2. **Manual branch deployment** by building locally and pushing `out/` to `gh-pages`.

Keep both paths available. The manual `gh-pages` branch flow is the current fallback when GitHub Actions cannot run, for example when Actions is blocked by account or billing state.

## Current production settings

```env
NEXT_PUBLIC_BASE_PATH=/supers
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod
NEXT_PUBLIC_MAX_FILE_SIZE=1073741824
API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod
API_STAGE=prod
```

`NEXT_PUBLIC_MAX_FILE_SIZE=1073741824` is the frontend upload validation limit: **1GB**.

## Manual deployment to `gh-pages`

From the repo root:

```bash
pnpm run deploy:pages:branch
```

The script does the following:

1. Builds the static Next.js export into `out/` with the production GitHub Pages env defaults.
2. Ensures `out/.nojekyll` exists.
3. Creates or reuses a local worktree at `/tmp/supers-gh-pages`.
4. Copies `out/` into that worktree.
5. Commits and pushes the result to the `gh-pages` branch.

### Optional overrides

```bash
NEXT_PUBLIC_BASE_PATH=/supers \
NEXT_PUBLIC_DEFAULT_THEME=dark \
NEXT_PUBLIC_API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod \
NEXT_PUBLIC_MAX_FILE_SIZE=1073741824 \
API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod \
API_STAGE=prod \
GH_PAGES_BRANCH=gh-pages \
GH_PAGES_WORKTREE=/tmp/supers-gh-pages \
pnpm run deploy:pages:branch
```

## GitHub repository Pages settings

For manual branch deployment, configure GitHub Pages as:

```text
Settings → Pages → Build and deployment
Source: Deploy from a branch
Branch: gh-pages
Folder: /root
Save
```

Site URL:

```text
https://isuryanarayanan.github.io/supers/
```

## GitHub Actions deployment

The Actions workflow remains in `.github/workflows/deploy.yml` and can still be used when Actions is available.

The workflow builds with:

```env
NEXT_PUBLIC_BASE_PATH=/supers
NEXT_PUBLIC_API_BASE_URL=https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/${environment}
NEXT_PUBLIC_MAX_FILE_SIZE=1073741824
```

Then it uploads `out/` using GitHub's Pages artifact/deploy actions.

## Notes for agents

- Do not delete `.github/workflows/deploy.yml`; it is still a valid deployment path.
- For immediate deployment without Actions, use `pnpm run deploy:pages:branch`.
- The generated `gh-pages` branch intentionally contains only static output, not source code.
- Always build with `NEXT_PUBLIC_BASE_PATH=/supers` for GitHub Pages.
- If changing backend upload limits, update both backend `MAX_FILE_SIZE` and frontend `NEXT_PUBLIC_MAX_FILE_SIZE`.
