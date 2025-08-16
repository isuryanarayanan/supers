# Environment Variables Guide

This project uses environment variables for configuration across different components and deployment stages.

## 📁 Environment File Structure

```
aws/env/
├── .env.dev                # Development configuration
├── .env.production         # Production configuration  
└── .env.deployment         # Deployment configuration (optional)
```

## 🎯 Frontend Environment Variables

### Next.js Configuration
These are set in the Next.js project root (`.env.local`, `.env.production`, etc.):

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod

# Theme Configuration  
NEXT_PUBLIC_DEFAULT_THEME=light

# GitHub Pages Deployment (if using)
NEXT_PUBLIC_BASE_PATH=/your-repo-name
```

### Environment-Specific Values

#### Development (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/dev
NEXT_PUBLIC_DEFAULT_THEME=light
```

#### Production (`.env.production`)
```env
NEXT_PUBLIC_API_BASE_URL=https://abc123def456.execute-api.ap-south-1.amazonaws.com/prod
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_BASE_PATH=/supers
```

## ⚡ Functions Environment Variables

### Required Variables
Located in `aws/env/.env.dev` and `aws/env/.env.production`:

```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=supers-files-your-unique-suffix
DYNAMODB_TABLE_NAME=Supers-Posts

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here-64-chars-minimum
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# CORS Configuration
ALLOWED_ORIGIN=https://your-domain.com

# File Upload Settings
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*

# Optional: Local DynamoDB (for development)
# DYNAMODB_ENDPOINT=http://localhost:8000
```

### Variable Descriptions

#### AWS Configuration
- **`AWS_REGION`**: AWS region for all resources (default: `ap-south-1`)
- **`AWS_S3_BUCKET_NAME`**: S3 bucket name for file storage
- **`DYNAMODB_TABLE_NAME`**: DynamoDB table name for posts (default: `Supers-Posts`)

#### Authentication
- **`JWT_SECRET`**: Secret key for JWT token signing (minimum 64 characters)
- **`ADMIN_USERNAME`**: Admin login username
- **`ADMIN_PASSWORD`**: Admin login password (use strong password)

#### CORS & Security
- **`ALLOWED_ORIGIN`**: Frontend domain allowed to access API
- **Multiple origins**: Use comma-separated values for multiple domains

#### File Upload
- **`MAX_FILE_SIZE`**: Maximum file size in bytes (default: 50MB = 52428800)
- **`ALLOWED_FILE_TYPES`**: MIME types allowed for upload (comma-separated)

### Environment-Specific Configurations

#### Development (`aws/env/.env.dev`)
```env
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=supers-files-dev-2024
DYNAMODB_TABLE_NAME=Supers-Posts-Dev
JWT_SECRET=dev-jwt-secret-for-testing-only-not-for-production-use
ADMIN_USERNAME=admin
ADMIN_PASSWORD=devpassword123
ALLOWED_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*

# Optional: Use local DynamoDB
# DYNAMODB_ENDPOINT=http://localhost:8000
```

#### Production (`aws/env/.env.production`)
```env
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=supers-files-prod-2024
DYNAMODB_TABLE_NAME=Supers-Posts
JWT_SECRET=super-secure-production-jwt-secret-with-64-plus-characters-for-maximum-security
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecureProductionPassword123!
ALLOWED_ORIGIN=https://your-production-domain.com,https://your-domain.github.io
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*
```

## 🚀 Deployment Environment Variables

### AWS Credentials
For deployment scripts and AWS CLI operations:

```env
# AWS Access Keys (set in your shell or CI/CD)
AWS_ACCESS_KEY_ID=your-deployment-access-key-id
AWS_SECRET_ACCESS_KEY=your-deployment-secret-access-key
AWS_DEFAULT_REGION=ap-south-1

# Optional: AWS Profile (if using named profiles)
AWS_PROFILE=supers-deployment
```

### CI/CD Environment Variables
For GitHub Actions or other CI/CD platforms:

```yaml
# GitHub Secrets
AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## 🔧 Setup Instructions

### 1. Create Environment Files
```bash
# Create development environment
cp aws/env/.env.example aws/env/.env.dev

# Create production environment  
cp aws/env/.env.example aws/env/.env.production

# Edit with your values
nano aws/env/.env.dev
nano aws/env/.env.production
```

### 2. Generate Secure Values
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate secure password
openssl rand -base64 32
```

### 3. Test Configuration
```bash
# Verify environment files are properly loaded
node aws/scripts/check-aws.js

# Test with development environment
NODE_ENV=development node functions/aws/test-config.js

# Test with production environment  
NODE_ENV=production node functions/aws/test-config.js
```

## 🔍 Environment Validation

### Required Variables Checklist
- [ ] `AWS_REGION` - Valid AWS region
- [ ] `AWS_S3_BUCKET_NAME` - Unique, valid bucket name
- [ ] `DYNAMODB_TABLE_NAME` - Valid table name
- [ ] `JWT_SECRET` - Minimum 64 characters
- [ ] `ADMIN_USERNAME` - Non-empty string
- [ ] `ADMIN_PASSWORD` - Strong password
- [ ] `ALLOWED_ORIGIN` - Valid URL(s)
- [ ] `MAX_FILE_SIZE` - Numeric value
- [ ] `ALLOWED_FILE_TYPES` - Valid MIME types

### Validation Script
Create a validation script to check environment variables:

```javascript
// aws/scripts/validate-env.js
const requiredVars = [
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME', 
  'DYNAMODB_TABLE_NAME',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'ALLOWED_ORIGIN'
];

const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}

console.log('All required environment variables are set ✅');
```

## 🚨 Troubleshooting

### Common Issues

#### Environment File Not Found
```
Error: Cannot find environment file
```
**Solution**: 
- Check file path: `aws/env/.env.dev` or `aws/env/.env.production`
- Verify file permissions are readable
- Ensure file extension is correct (no extra spaces)

#### Invalid JWT Secret
```
JWT Secret must be at least 64 characters
```
**Solution**:
- Generate new secret: `openssl rand -base64 64`
- Update environment file with new secret
- Redeploy functions to pick up new secret

#### CORS Origin Mismatch
```
CORS policy doesn't allow origin
```
**Solution**:
- Add your frontend domain to `ALLOWED_ORIGIN`
- Include both HTTP and HTTPS versions for development
- Use comma-separated values for multiple origins

#### AWS Resource Not Found
```
ResourceNotFoundException: Table 'Supers-Posts' doesn't exist
```
**Solution**:
- Run `node aws/scripts/check-aws.js` to create resources
- Verify AWS region matches environment variable
- Check resource names for typos

### Debugging Environment Issues

#### Check Current Environment
```bash
# Show all environment variables
printenv | grep -E "(AWS|DYNAMODB|JWT|ADMIN)"

# Check specific variable
echo $AWS_S3_BUCKET_NAME
```

#### Test Environment Loading
```bash
# Test development environment
NODE_ENV=development node -e "
require('dotenv').config({ path: 'aws/env/.env.dev' });
console.log('JWT Secret length:', process.env.JWT_SECRET?.length);
console.log('S3 Bucket:', process.env.AWS_S3_BUCKET_NAME);
"
```

## 🔒 Security Best Practices

### Environment Variable Security
1. **Never commit** `.env` files to version control
2. **Use different secrets** for dev/prod environments
3. **Rotate secrets** regularly (especially JWT secrets)
4. **Use strong passwords** with special characters
5. **Limit CORS origins** to only required domains

### AWS Credentials Security
1. **Use IAM roles** instead of access keys when possible
2. **Apply principle of least privilege** to IAM policies
3. **Rotate access keys** regularly
4. **Never hardcode** credentials in code
5. **Use AWS Secrets Manager** for production secrets (advanced)

### Git Security
Add to `.gitignore`:
```gitignore
# Environment files
.env*
aws/env/.env*
functions/aws/.env*

# AWS credentials
.aws/
aws-credentials.*
```

## 📚 Related Documentation
- [Complete AWS Setup](../deploy/AWS_SETUP.md)
- [Function Deployment](../deploy/FUNCTIONS_AWS.md)
- [Quick Start Guide](./QUICK_START.md)
- [Project Setup](../setup.md)
