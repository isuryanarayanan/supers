# AWS Functions Deployment

This project uses Serverless Framework to deploy Lambda functions for the API backend.

## 📁 Project Structure
```
functions/aws/           # Serverless function code
├── serverless.yml      # Serverless configuration
├── package.json        # Function dependencies  
├── auth-*.js          # Authentication functions
├── files-*.js         # File management functions
└── posts-*.js         # Post CRUD functions
```

## 🔧 Configuration

### Service Details
- **Service name**: `supers-files`
- **Default region**: `ap-south-1` (configurable)
- **Runtime**: Node.js 18.x
- **Stages**: `dev`, `prod`

### Environment Files
Functions use environment files from `aws/env/`:
- `aws/env/.env.dev` - Development configuration
- `aws/env/.env.production` - Production configuration

### Required Environment Variables
```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-unique-bucket-name
DYNAMODB_TABLE_NAME=Supers-Posts

# Authentication  
JWT_SECRET=your-secure-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Frontend Configuration
ALLOWED_ORIGIN=https://your-domain.com

# File Upload Settings
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*
```

## 🚀 Deployment

### Prerequisites
1. **AWS credentials** configured with deployment permissions
2. **Resources created**: DynamoDB table and S3 bucket (see [AWS Setup](./AWS_SETUP.md))
3. **Environment files** configured in `aws/env/`

### Deploy Commands
```bash
# Production deployment
npm run deploy:api:prod

# Development deployment (if needed)
npm run dev:api
```

### Deployment Process
1. **Packages** function code and dependencies
2. **Creates CloudFormation stack** with:
   - Lambda functions (11 total)
   - API Gateway REST API
   - IAM roles and policies
   - CloudWatch log groups
3. **Outputs API endpoint** URL

## 📡 API Endpoints

After successful deployment, you'll get an API base URL like:
`https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod`

### Available Endpoints

#### Authentication
- `POST /auth/login` - Admin authentication
- `GET /auth/verify` - Token verification

#### Posts Management  
- `GET /posts` - List all posts
- `GET /posts/{id}` - Get specific post
- `POST /posts` - Create new post
- `PUT /posts/{id}` - Update existing post
- `DELETE /posts/{id}` - Delete post

#### File Management
- `GET /files` - List uploaded files
- `POST /files/upload` - Upload file to S3
- `POST /files/presigned-url` - Get signed URL for upload
- `DELETE /files/{id}` - Delete file from S3

## 🔧 Local Development

### Run Functions Locally
```bash
# Start local serverless offline
npm run dev:api

# Functions available at http://localhost:3001
```

### Testing
```bash
# Test authentication
curl -X POST http://localhost:3001/dev/auth/login 
  -H "Content-Type: application/json" 
  -d '{"username": "admin", "password": "your-password"}'

# Test posts endpoint
curl http://localhost:3001/dev/posts
```

## 🎯 Function Details

### Authentication Functions
- **auth-login**: JWT-based admin authentication
- **auth-verify**: Token validation middleware

### File Functions  
- **files-list**: List S3 bucket contents
- **files-upload**: Direct file upload to S3
- **files-presigned-url**: Generate signed URLs for client-side upload
- **files-delete**: Remove files from S3

### Post Functions
- **posts-list**: Query DynamoDB with pagination
- **posts-get**: Retrieve post with cells
- **posts-create**: Create post and cells
- **posts-update**: Update existing post
- **posts-delete**: Remove post and associated cells

## 🔍 Monitoring

### CloudWatch Logs
Each function creates its own log group:
- `/aws/lambda/supers-files-prod-auth-login`
- `/aws/lambda/supers-files-prod-posts-list`
- etc.

### Viewing Logs
```bash
# View recent logs
aws logs tail /aws/lambda/supers-files-prod-posts-list --follow

# Or use AWS Console → CloudWatch → Logs
```

### Debugging
1. **Check function logs** in CloudWatch
2. **Test locally** with serverless offline
3. **Verify environment variables** are set correctly
4. **Check IAM permissions** for Lambda execution role

## 🚨 Troubleshooting

### Common Deployment Issues

**CloudFormation Stack Failed**
- Check AWS Console → CloudFormation for detailed error
- Ensure IAM user has deployment permissions
- Verify resource names don't conflict

**Environment Variable Errors**
- Check file paths in npm scripts
- Verify environment files exist and have correct values
- Ensure no syntax errors in environment files

**Permission Denied**  
- Verify AWS credentials have Lambda and API Gateway permissions
- Check CloudFormation and IAM permissions
- See [AWS Setup](./AWS_SETUP.md) for required policies

### Function Runtime Issues

**Database Connection Errors**
- Verify DynamoDB table exists and is active
- Check Lambda execution role has DynamoDB permissions
- Validate table name in environment variables

**S3 Access Errors**
- Ensure S3 bucket exists and is accessible
- Check bucket permissions and CORS configuration
- Verify bucket name matches environment variable

## 🔄 Updating Deployment

### Code Changes
```bash
# Redeploy after code changes
npm run deploy:api:prod
```

### Environment Changes
1. **Update environment files** in `aws/env/`
2. **Redeploy functions** to pick up new variables
3. **Verify changes** with test requests

### Rollback
```bash
# Remove deployment if needed
npm run remove:api:prod

# Then redeploy previous version
npm run deploy:api:prod
```

## 📚 Related Documentation
- [Complete AWS Setup](./AWS_SETUP.md)
- [DynamoDB Configuration](./DYNAMODB_SETUP.md)
- [S3 Configuration](./S3_SETUP.md)
- [Environment Variables](../getting-started/ENVIRONMENT.md)
