# AWS Infrastructure Setup

This guide covers setting up AWS infrastructure for the supers project with proper security and environment separation.

## 🏗️ Infrastructure Overview

The supers project uses:
- **DynamoDB** for data storage
- **S3** for file storage  
- **Lambda** functions for API
- **API Gateway** for HTTP endpoints
- **CloudFormation** for infrastructure as code

## 🔐 Security Architecture

### IAM Policy Separation
The project uses two distinct IAM policies for security:

#### 1. Deployment Policy (`aws/iam/deployment.json`)
**Purpose**: Infrastructure provisioning and management
- Create/delete AWS resources
- Deploy Lambda functions
- Manage CloudFormation stacks
- Configure IAM roles

#### 2. Functions Policy (`aws/iam/functions.json`)  
**Purpose**: Runtime operations for Lambda functions
- Read/write DynamoDB data
- Read/write S3 objects
- CloudWatch logging

### Recommended Setup
1. **Create two AWS users**:
   - `supers-deployment` (attach deployment policy)
   - `supers-functions` (attach functions policy)
2. **Use deployment user** for infrastructure setup
3. **Use functions user** for runtime operations

## 📂 Environment Structure

```
aws/env/
├── .env.dev                    # Development runtime config
├── .env.production            # Production runtime config  
├── .env.deployment.dev        # Development deployment credentials
└── .env.deployment.prod       # Production deployment credentials
```

## 🚀 Step-by-Step Setup

### 1. Create AWS Users and Policies

#### A. Create Deployment User
1. **AWS Console** → IAM → Users → Create User
2. **User name**: `supers-deployment`
3. **Attach policy**: Create custom policy from `aws/iam/deployment.json`
4. **Generate access keys** and save securely

#### B. Create Functions User (Optional but Recommended)  
1. **AWS Console** → IAM → Users → Create User
2. **User name**: `supers-functions`
3. **Attach policy**: Create custom policy from `aws/iam/functions.json`
4. **Generate access keys** and save securely

### 2. Configure Local Environment

#### A. Set Deployment Credentials
```bash
# Configure AWS CLI with deployment user credentials
aws configure --profile supers-deployment

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-deployment-access-key
export AWS_SECRET_ACCESS_KEY=your-deployment-secret-key
export AWS_REGION=ap-south-1
```

#### B. Update Environment Files
Edit the environment files in `aws/env/` with your credentials:

**aws/env/.env.deployment.prod**:
```env
AWS_ACCESS_KEY_ID=your-deployment-access-key
AWS_SECRET_ACCESS_KEY=your-deployment-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=supers-yourusername-prod  # Must be globally unique
DYNAMODB_TABLE_NAME=Supers-Posts
STAGE=prod
```

### 3. Initialize AWS Resources

#### A. Verify AWS Access
```bash
# Check connectivity and permissions
npm run aws:check:prod
```

#### B. Create DynamoDB Table
```bash
# Create production table
npm run aws:init:dynamodb

# Create development table (optional)
npm run aws:init:dynamodb:dev
```

#### C. Create S3 Bucket
```bash
# Create production bucket
npm run aws:init:s3

# Create development bucket (optional)  
npm run aws:init:s3:dev
```

#### D. Verify Resources
```bash
# Check all resources are created
npm run aws:check:prod
```

### 4. Deploy Lambda Functions

```bash
# Deploy API functions to production
npm run deploy:api:prod

# Check deployment status
npm run aws:check:prod
```

## 📊 Resource Details

### DynamoDB Table
- **Name**: `Supers-Posts`
- **Partition Key**: `PK` (String)
- **Sort Key**: `SK` (String)  
- **GSI**: `CreatedAtIndex` (status → created_at)
- **Capacity**: 10 RCU / 10 WCU (adjustable)

### S3 Bucket  
- **Name**: `supers-{username}-{environment}`
- **Region**: `ap-south-1` (configurable)
- **Public Read**: Enabled for file serving
- **CORS**: Configured for web access

### Lambda Functions
- `supers-files-prod-auth-login`
- `supers-files-prod-auth-verify`  
- `supers-files-prod-files-*` (upload, list, delete)
- `supers-files-prod-posts-*` (CRUD operations)

## 🔧 Advanced Configuration

### Multiple Environments
To set up separate development and production environments:

1. **Update bucket names** to be unique per environment
2. **Use different table names** (optional)
3. **Deploy to different stages**: `dev`, `staging`, `prod`

### Cost Optimization
- **DynamoDB**: Use on-demand billing for low traffic
- **Lambda**: Functions are pay-per-use
- **S3**: Use lifecycle policies for old files
- **CloudWatch**: Set log retention policies

### Security Enhancements
- **Enable MFA** on AWS accounts
- **Use IAM roles** instead of access keys when possible
- **Implement least privilege** principle
- **Regular credential rotation**

## 📋 Available Scripts

### Checking Services
```bash
npm run aws:check          # Check development environment
npm run aws:check:prod     # Check production environment  
```

### Resource Initialization  
```bash
npm run aws:init:dynamodb      # Create DynamoDB table (prod)
npm run aws:init:s3           # Create S3 bucket (prod)
npm run aws:init:dynamodb:dev # Create DynamoDB table (dev)  
npm run aws:init:s3:dev      # Create S3 bucket (dev)
```

### Deployment
```bash
npm run deploy:api:prod    # Deploy functions to production
npm run dev:api           # Run functions locally
npm run remove:api:prod   # Remove production deployment
```

## 🚨 Troubleshooting

### Common Issues

**Permission Denied**
- Check IAM policy is correctly attached
- Verify AWS credentials are active
- Ensure correct region configuration

**Bucket Already Exists**
- S3 bucket names must be globally unique
- Try adding your username or random suffix
- Update bucket name in environment files

**Table Already Exists**
- DynamoDB table may exist from previous setup
- Check AWS Console → DynamoDB → Tables
- Delete existing table or use different name

**CloudFormation Stack Errors**
- Check AWS Console → CloudFormation  
- Look for failed resources and error messages
- Delete stack and redeploy if needed

### Getting Help
1. **Check logs** in terminal output for specific errors
2. **Verify environment files** have correct paths and values
3. **Review AWS Console** for resource status
4. **Check IAM permissions** match policy requirements

## 🔗 Related Documentation
- [Environment Configuration](../getting-started/ENVIRONMENT.md)
- [Function Deployment](./FUNCTIONS_AWS.md)
- [DynamoDB Setup](./DYNAMODB_SETUP.md) 
- [S3 Setup](./S3_SETUP.md)
