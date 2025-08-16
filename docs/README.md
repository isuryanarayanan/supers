# 📚 supers Documentation

> **Welcome to supers** — the personal site and portfolio of Surya Narayanan (Senior Software Engineer, WareIQ). This Next.js application showcases a blend of technical and artistic content through an innovative cell-based content management system.

## 🌟 What is supers?

**supers** is a modern, serverless portfolio website featuring:
- **Cell-based content system** for flexible post creation
- **Next.js 13+ App Router** with TypeScript and Tailwind CSS
- **AWS serverless backend** with DynamoDB and S3
- **Multiple content types**: Blog posts, Projects, News, Papers, and Links
- **Visual post editor** with live preview
- **Responsive design** with mobile-first approach

## 📖 Table of Contents

### 🚀 Getting Started
Start here if you're new to the project or setting up a local development environment.

- **[Complete Setup Guide](./setup.md)** - Step-by-step setup from clone to deploy
- **[Quick Start](./getting-started/QUICK_START.md)** - Fastest way to get running locally
- **[Environment Variables](./getting-started/ENVIRONMENT.md)** - Configuration guide

### 💡 Understanding the Project  
Learn about the architecture, design decisions, and core concepts.

- **[Project Overview](./intro/OVERVIEW.md)** - Architecture and technical stack
- **[Branding & Design](./intro/BRANDING.md)** - Visual identity and design system

### 📝 Content Management
Everything about creating, managing, and organizing content.

- **[Post Types](./content/POST_TYPES.md)** - Blog, Project, News, Paper, and Link posts
- **[Content Workflow](./content/WORKFLOW.md)** - Creating and editing posts
- **[Content Management](./content-management.md)** - Advanced content strategies

### ⚡ AWS & Deployment
Production deployment with AWS serverless infrastructure.

- **[Complete AWS Setup](./deploy/AWS_SETUP.md)** - Infrastructure setup and security
- **[Serverless Functions](./deploy/FUNCTIONS_AWS.md)** - Lambda deployment and API endpoints  
- **[DynamoDB Setup](./deploy/DYNAMODB_SETUP.md)** - Database configuration and management
- **[S3 Storage Setup](./deploy/S3_SETUP.md)** - File storage and CDN configuration
- **[CI/CD Pipeline](./deploy/CICD.md)** - Automated deployment workflows
- **[Deployment Guide](./deployment.md)** - Production deployment strategies

### 🔌 API Reference
Technical documentation for developers integrating with the API.

- **[Posts API](./api/POSTS_API.md)** - CRUD operations for posts and content
- **[Files API](./api/FILES_API.md)** - File upload, storage, and management
- **[API Functions](./api-functions.md)** - Complete API reference

### 📋 Additional Resources
Project management, features, and advanced topics.

- **[Feature Documentation](./features/)** - Detailed feature specifications  
- **[Project Overview](./project-overview.md)** - High-level project information
- **[Setup Instructions](./setup/)** - Alternative setup guides
- **[Versioned Deployments](./VERSIONED_DEPLOYMENTS.md)** - Advanced deployment strategies

---

## 🎯 Quick Navigation

### 👋 **New to the project?**
1. Start with **[Complete Setup Guide](./setup.md)**
2. Read **[Project Overview](./intro/OVERVIEW.md)**  
3. Follow **[Quick Start](./getting-started/QUICK_START.md)**

### 🛠 **Setting up for development?**
1. **[Environment Variables](./getting-started/ENVIRONMENT.md)**
2. **[Complete AWS Setup](./deploy/AWS_SETUP.md)**
3. **[Quick Start](./getting-started/QUICK_START.md)**

### 🚀 **Ready to deploy?**
1. **[Complete AWS Setup](./deploy/AWS_SETUP.md)**
2. **[Serverless Functions](./deploy/FUNCTIONS_AWS.md)**
3. **[CI/CD Pipeline](./deploy/CICD.md)**

### 📝 **Creating content?**
1. **[Post Types](./content/POST_TYPES.md)**
2. **[Content Workflow](./content/WORKFLOW.md)**
3. **[Posts API](./api/POSTS_API.md)**

---

## 🏗 Project Structure Overview

```
supers/
├── app/                    # Next.js App Router pages
├── components/             # React components (UI, layout, editor)
├── functions/aws/          # Serverless Lambda functions
├── aws/                    # AWS configuration and scripts
├── docs/                   # 📚 You are here!
├── data/                   # Static data and posts
└── public/                 # Static assets
```

## 🤝 Contributing

Found an issue with the documentation? Please check the relevant guide or create an issue. This documentation is designed to be comprehensive yet approachable for developers at all levels.

---

> **💡 Tip:** Use Ctrl+F (Cmd+F) to search for specific topics, or browse the folder structure above to find exactly what you need.
