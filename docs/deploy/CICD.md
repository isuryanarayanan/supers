# 🛠️ CI/CD Pipeline

Basic guidance for automating builds and deployments.

## Frontend (Next.js)
- Build: `npm run build`
- Pre-build steps: `scripts/pre-build.js` checks API availability
- Content sync: `scripts/build-posts.js` fetches posts from API and generates `data/posts.ts`
- Versioned deployments: `scripts/deploy.js` orchestrates full build with manifest

## Functions (Serverless)
- Production deploy: `npm run deploy:api:prod`
- Removal: `npm run remove:api:prod`
- Dev (local): `npm run dev:api`

## Environment Management
- Use `aws/env/.env.production` and `.env.dev` to inject runtime variables into function deploys
- Set sensitive variables in CI secrets (e.g., `JWT_SECRET`, `ADMIN_PASSWORD`)

## Recommendations
- Pin Node.js and package versions for reproducible builds
- Use separate AWS accounts or stages for dev and prod
- Cache `node_modules`/`.pnpm-store` in CI for faster builds
- Run `npm run lint` as part of CI for quality checks

## Related Docs
- [Functions Deployment](./FUNCTIONS_AWS.md)
- [AWS Setup](./AWS_SETUP.md)
- [Environment Variables](../getting-started/ENVIRONMENT.md)
