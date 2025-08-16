# 🧭 Project Overview

supers is a modern, content-driven portfolio site built with Next.js, TypeScript, Tailwind CSS, and an optional AWS serverless backend. It showcases technical and artistic work by Surya Narayanan (Senior Software Engineer, WareIQ).

## Highlights
- **Brand**: "supers"
- **Owner**: Surya Narayanan
- **Focus**: Technical + Artistic
- **Content types**: Projects, Blog posts, News, Papers, Links

## Architecture

- **Frontend**: Next.js 13+ App Router, TypeScript, Tailwind CSS, Shadcn UI
- **Backend (optional)**: AWS Lambda (API), API Gateway, DynamoDB (data), S3 (files)
- **Deployment**: Static export (Next.js), Serverless functions (AWS)
- **Editor**: Visual post editor with cell-based content system

## Repository Structure (high level)

```
app/                # Next.js pages and layouts
components/         # UI, layout, editor components
data/               # Static data (posts) + backups
functions/aws/      # Serverless functions (API)
aws/                # AWS scripts, env, IAM
docs/               # Project documentation
```

## Related Docs

- [Quick Start](../getting-started/QUICK_START.md)
- [Complete Setup Guide](../setup.md)
- [Content Types](../content/POST_TYPES.md)
- [AWS Setup](../deploy/AWS_SETUP.md)
