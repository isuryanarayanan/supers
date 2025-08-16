# 🚀 Complete Setup Guide

> **Complete step-by-step guide** to set up the supers portfolio website from clone to deployment. Perfect for developers getting started with the project.

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Quick Start](#-quick-start) 
3. [AWS Infrastructure Setup](#️-aws-infrastructure-setup)
4. [Environment Configuration](#-environment-configuration)
5. [Local Development](#-local-development)
6. [Deployment](#-deployment)
7. [Verification & Testing](#-verification--testing)
8. [Troubleshooting](#-troubleshooting)
9. [Next Steps](#-next-steps)

---

## ⚡ Prerequisites

### 🔧 Required Tools
- **Node.js 18.x or higher** (project uses Node 18.x runtime)
- **pnpm** package manager (`npm install -g pnpm`)
- **AWS CLI** installed and configured ([Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **Git** for version control
- **AWS Account** with programmatic access

### 📋 Required Checks
```bash
# Verify installations
node --version    # Should be 18.x+
pnpm --version    # Any recent version
aws --version     # AWS CLI v2 recommended
git --version     # Any recent version
```

### 🛠 Optional Tools  
- **Docker** (for local AWS services testing)
- **VS Code** with recommended extensions
- **AWS Console** access (helpful for debugging)

---

## 🚀 Quick Start

### Step 1: Clone Repository
```bash
git clone https://github.com/isuryanarayanan/supers.git
cd supers
```

### Step 2: Install Dependencies
```bash
# Install all project dependencies
pnpm install

# Also install function dependencies
cd functions/aws
npm install
cd ../..
```

### Step 3: Basic Setup Check
```bash
# Check if basic structure is correct
ls -la aws/env/        # Should show environment files
ls -la functions/aws/  # Should show serverless functions
```

---

## 🏗️ AWS Infrastructure Setup

> **⚠️ Important**: AWS setup is required for full functionality. The site uses DynamoDB for data and S3 for file storage.

### Step 1: AWS Account Preparation

#### A. Create Deployment User
1. **AWS Console** → IAM → Users → Create User
2. **Username**: `supers-deployment`
3. **Attach policies**: Use policies from `aws/iam/deployment.json`
4. **Generate Access Keys** → Save them securely

#### B. Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [your-deployment-access-key]
# AWS Secret Access Key: [your-deployment-secret-key]
# Default region name: ap-south-1
# Default output format: json
```

#### C. Test AWS Connection
```bash
# Test basic AWS connectivity
aws sts get-caller-identity

# Should return your account details
```

### Step 2: Initialize AWS Resources

#### A. Check Current AWS Status
```bash
# Check what resources exist
npm run aws:check

# For production environment
npm run aws:check:prod
```

#### B. Create DynamoDB Table
```bash
# Create table for production
npm run aws:init:dynamodb

# For development environment
npm run aws:init:dynamodb:dev
```

#### C. Create S3 Bucket
```bash
# Create bucket for production  
npm run aws:init:s3

# For development environment
npm run aws:init:s3:dev
```

#### D. Verify Resource Creation
```bash
# Final verification
npm run aws:check:prod

# Should show ✅ for all services
```

---

## 🔧 Environment Configuration

### Environment File Structure
```
aws/env/
├── .env.dev                    # Development runtime config
├── .env.production            # Production runtime config
├── .env.deployment.dev        # Development deployment config
└── .env.deployment.prod       # Production deployment config
```

### Step 1: Review AWS Environment Files
The environment files are pre-configured, but you may need to update:

#### Production Runtime (`aws/env/.env.production`)
```bash
# Edit production config
nano aws/env/.env.production

# Key values to verify/update:
# AWS_S3_BUCKET_NAME=supers-files-your-unique-suffix
# DYNAMODB_TABLE_NAME=Supers-Posts
# JWT_SECRET=your-secure-jwt-secret (64+ characters)
# ADMIN_PASSWORD=your-secure-password
```

#### Development Runtime (`aws/env/.env.dev`)  
```bash
# Edit development config
nano aws/env/.env.dev

# Usually the same as production but with dev resources
```

### Step 2: Frontend Environment (Optional)
```bash
# Create local environment file
touch .env.local

# Add frontend-specific variables
echo 'NEXT_PUBLIC_DEFAULT_THEME="light"' >> .env.local
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/dev' >> .env.local
```

---

## 💻 Local Development

### Step 1: Start API Functions (Backend)
```bash
# Start serverless functions locally
npm run dev:api

# Functions will be available at:
# http://localhost:3001/dev/posts
# http://localhost:3001/dev/files  
# http://localhost:3001/dev/auth
```

### Step 2: Start Frontend (Separate Terminal)
```bash
# Start Next.js development server
npm run dev:site

# Website will be available at:
# http://localhost:3000
```

### Step 3: Verify Local Setup
```bash
# Test API endpoints
curl http://localhost:3001/dev/posts

# Should return JSON array of posts
```

---

## 🚀 Deployment

### Step 1: Deploy API Functions to AWS
```bash
# Deploy serverless functions to production
npm run deploy:api:prod

# This will:
# 1. Package functions with dependencies
# 2. Create CloudFormation stack
# 3. Deploy to AWS Lambda
# 4. Create API Gateway endpoints
# 5. Output API endpoint URL
```

### Step 2: Update Frontend Configuration
```bash
# After successful deployment, update frontend config
echo 'NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod' > .env.local
```

### Step 3: Build and Deploy Frontend
```bash
# Build optimized production site
npm run build

# For GitHub Pages deployment
npm run deploy

# Or deploy to your preferred hosting platform
```

---

## ✅ Verification & Testing

### API Testing
```bash
# Get your API endpoint from deployment output, then test:

# Test posts endpoint
curl https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/posts

# Test authentication
curl -X POST https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

### AWS Resource Verification
```bash
# Check all resources are properly configured
npm run aws:check:prod

# Should show ✅ for:
# - AWS Identity  
# - DynamoDB Table
# - S3 Bucket
# - Lambda Functions (after deployment)
```

### Frontend Testing
1. **Visit your deployed site**
2. **Navigate to different sections** (Blog, Projects, etc.)
3. **Test responsive design** on mobile/tablet
4. **Verify all content loads** properly

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### ❌ AWS Permission Errors
```bash
# Error: AccessDenied or similar
# Solution: Check IAM policies

# Verify your identity
aws sts get-caller-identity

# Check current AWS configuration
aws configure list

# Test basic permissions
npm run aws:check
```

#### ❌ S3 Bucket Name Conflicts  
```
Error: BucketAlreadyExists
```
**Solution**: S3 bucket names are globally unique
```bash
# Edit environment file with unique suffix
nano aws/env/.env.production

# Change: AWS_S3_BUCKET_NAME=supers-files-yourname-2024
# Then recreate bucket
npm run aws:init:s3
```

#### ❌ DynamoDB Connection Issues
```
Error: ResourceNotFoundException
```
**Solution**: Ensure table exists and region matches
```bash
# Recreate table
npm run aws:init:dynamodb

# Verify region in environment files
grep AWS_REGION aws/env/.env.production
```

#### ❌ Function Deployment Failures
```
Error: Stack update failed
```
**Solution**: Check CloudFormation console
1. **AWS Console** → CloudFormation
2. **Find your stack** (likely `supers-files-prod`)
3. **Check Events tab** for detailed errors
4. **Common fixes**:
   - Delete failed stack and redeploy
   - Check IAM permissions
   - Verify environment variables

#### ❌ Local Development Issues
```bash
# Port already in use
pkill -f "next\|serverless"

# Dependencies missing
pnpm install
cd functions/aws && npm install

# Environment files not found
ls -la aws/env/
# Should show 4 .env files
```

### Debug Commands
```bash
# AWS connectivity
aws sts get-caller-identity
aws dynamodb list-tables --region ap-south-1
aws s3 ls

# Local environment
node -e "console.log(process.env)" | grep AWS
npm run aws:check

# Function logs (after deployment)
aws logs tail /aws/lambda/supers-files-prod-posts-list --follow
```

### Getting Help
1. **Check terminal output** for specific error messages
2. **Review AWS Console** for resource status
3. **Verify environment files** have correct values
4. **Test step by step** rather than running everything at once

---

## 📚 Next Steps

### ✅ Successfully set up? Here's what to do next:

#### 🎯 **For Content Creators**
- **[Content Types](./content/POST_TYPES.md)** - Learn about different post types
- **[Content Workflow](./content/WORKFLOW.md)** - How to create and edit posts
- **[Posts API](./api/POSTS_API.md)** - API reference for content management

#### 🛠 **For Developers**  
- **[Project Overview](./intro/OVERVIEW.md)** - Technical architecture deep dive
- **[Environment Variables](./getting-started/ENVIRONMENT.md)** - Advanced configuration
- **[AWS Setup](./deploy/AWS_SETUP.md)** - Detailed AWS infrastructure guide

#### 🚀 **For DevOps/Deployment**
- **[CI/CD Pipeline](./deploy/CICD.md)** - Automated deployment setup
- **[Advanced Deployment](./VERSIONED_DEPLOYMENTS.md)** - Multiple environment strategies

### 🔧 **Customization**
- Update branding in `components/layout/`
- Modify post types in `data/posts.ts` 
- Customize styling in `app/globals.css`
- Add new API endpoints in `functions/aws/`

### 🛡️ **Security & Maintenance**
- **Rotate JWT secrets** regularly
- **Update dependencies** monthly (`pnpm update`)
- **Monitor AWS costs** in AWS Console
- **Backup DynamoDB data** using AWS Backup

---

> **🎉 Congratulations!** You now have a fully functional supers installation. The combination of Next.js frontend and AWS serverless backend provides a scalable, modern web application ready for production use.