# ⚡ Quick Start Guide

> **Get supers running locally in under 5 minutes!** This guide focuses on the fastest path to see the portfolio website in action. For production setup, see the [Complete Setup Guide](../setup.md).

## 📋 Table of Contents

1. [What You'll Get](#-what-youll-get)
2. [Prerequisites](#-prerequisites)  
3. [5-Minute Setup](#️-5-minute-setup)
4. [Optional: API Setup](#-optional-api-setup)
5. [Verification](#-verification)
6. [Common Issues](#-common-issues)
7. [Next Steps](#-next-steps)

---

## 🎯 What You'll Get

After following this guide, you'll have:
- ✅ **Portfolio website** running at `http://localhost:3000`
- ✅ **All static content** (blog posts, projects) working
- ✅ **Responsive design** with light/dark theme
- ✅ **Visual post editor** (read-only without API)
- 📝 **Optional**: Full backend API with file uploads

---

## ⚡ Prerequisites

### 🔧 Required (5 minutes)
```bash
# Check you have these installed:
node --version    # Should be 18.0+
pnpm --version    # Any recent version
git --version     # Any recent version
```

**Don't have these?**
- **Node.js**: [Download here](https://nodejs.org/) (choose LTS version)  
- **pnpm**: `npm install -g pnpm`
- **Git**: [Download here](https://git-scm.com/)

### 🛠 Optional (for full functionality)
- **AWS Account** (for backend API)
- **AWS CLI** configured

---

## ⏱️ 5-Minute Setup

### Step 1: Clone & Install (2 minutes)
```bash
# Clone the repository
git clone https://github.com/isuryanarayanan/supers.git
cd supers

# Install dependencies
pnpm install
```

### Step 2: Environment Setup (1 minute) 
```bash
# Create basic environment file (optional)
echo 'NEXT_PUBLIC_DEFAULT_THEME="light"' > .env.local

# No other configuration needed for basic functionality!
```

### Step 3: Start Development Server (1 minute)
```bash
# Start the website
pnpm run dev:site

# 🎉 Website will open at http://localhost:3000
```

### Step 4: Explore! (1 minute)
Open your browser to `http://localhost:3000` and you'll see:
- **Homepage** with featured content
- **Blog** section with sample posts  
- **Projects** showcase
- **Responsive navigation** 
- **Dark/light theme** (environment controlled)

---

## 🔌 Optional: API Setup

> **Note**: The website works perfectly without the API - it's a static site with sample data. The API adds file uploads, dynamic content management, and admin features.

### Quick API Test (Local Development)
```bash
# In a new terminal, start the API functions
pnpm run dev:api

# API will be available at http://localhost:3001/dev
```

### Test API Endpoints
```bash
# Test posts endpoint
curl http://localhost:3001/dev/posts

# Should return JSON array of posts
```

### For Full API Setup
See the [Complete Setup Guide](../setup.md) for AWS configuration and production deployment.

---

## ✅ Verification  

### Frontend Checklist
- [ ] Website loads at `http://localhost:3000`
- [ ] Navigation works (Blog, Projects, etc.)
- [ ] Sample content displays properly
- [ ] Mobile responsive design works
- [ ] No console errors in browser developer tools

### API Checklist (if enabled)
- [ ] API responds at `http://localhost:3001/dev/posts`
- [ ] Returns valid JSON data
- [ ] No server errors in terminal

### Quick Tests
```bash
# Test the build process
pnpm run build

# Should complete without errors
```

---

## 🚨 Common Issues

### ❌ "Command not found: pnpm"
```bash
# Install pnpm globally
npm install -g pnpm

# Or use npm instead
npm install
npm run dev:site
```

### ❌ "Port 3000 already in use"
```bash
# Kill existing processes
pkill -f "next dev"

# Or use different port
PORT=3001 pnpm run dev:site
```

### ❌ "Module not found" errors
```bash
# Clean install
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install
```

### ❌ API functions won't start
```bash
# Check if AWS environment files exist
ls -la aws/env/

# For API development, you need the complete setup
# See: docs/setup.md
```

### ❌ Build failures
```bash
# Check for TypeScript errors
pnpm run lint

# Clean build
rm -rf .next
pnpm run build
```

---

## 📚 Next Steps

### 🎯 **For Content Creators**
- **[Content Types](../content/POST_TYPES.md)** - Learn about different post types
- **[Content Workflow](../content/WORKFLOW.md)** - How to create and edit posts

### 🛠 **For Developers**
- **[Complete Setup](../setup.md)** - Full AWS setup with backend API  
- **[Project Overview](../intro/OVERVIEW.md)** - Technical architecture
- **[Environment Variables](./ENVIRONMENT.md)** - Advanced configuration

### 🚀 **For Production**
- **[AWS Setup](../deploy/AWS_SETUP.md)** - Production infrastructure
- **[Deployment Guide](../deploy/FUNCTIONS_AWS.md)** - Deploy to AWS
- **[CI/CD](../deploy/CICD.md)** - Automated deployments

### 🎨 **For Customization**
- **Styling**: Edit `app/globals.css` and Tailwind classes
- **Content**: Modify `data/posts.ts` for sample content
- **Components**: Customize `components/` directory
- **Layout**: Update `components/layout/` files

---

## 💡 Development Tips

### Hot Reloading
- **Frontend changes** reload automatically
- **Content changes** in `data/posts.ts` reload automatically  
- **Component changes** reload automatically
- **For API changes**, restart `pnpm run dev:api`

### Useful Commands
```bash
# Development
pnpm run dev:site          # Start frontend only
pnpm run dev:api           # Start API functions (requires AWS setup)

# Building  
pnpm run build             # Build optimized production site
pnpm run build:posts       # Rebuild post data only

# Frontend deployment fallback, bypasses GitHub Actions
pnpm run deploy:pages:branch

# Linting & Quality
pnpm run lint              # Check code quality
```

### File Structure Quick Reference
```
supers/
├── app/                   # Next.js pages and layouts
├── components/            # React components
├── data/posts.ts          # Sample content (edit this!)
├── functions/aws/         # API backend functions
├── aws/env/              # Environment configurations
└── docs/                 # Documentation (you are here!)
```

---

> **🎉 Success!** You now have supers running locally. The site showcases a modern portfolio with blog posts, projects, and a clean design. For full functionality with file uploads and admin features, continue with the [Complete Setup Guide](../setup.md).
