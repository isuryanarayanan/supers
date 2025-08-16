# S3 Setup Guide

Amazon S3 is used for file storage and serving static assets in this project.

## 📦 S3 Configuration

### Bucket Details
- **Bucket Name**: `supers-files-<unique-suffix>` (e.g., `supers-files-prod-2024`)
- **Region**: `ap-south-1` (must match your other AWS resources)
- **Access**: Private with public read access for served files
- **Versioning**: Optional (recommended for production)

## 🚀 Setup Instructions

### Automatic Setup (Recommended)
```bash
# Check if bucket exists and create if needed
node aws/scripts/check-aws.js

# This will:
# 1. Create S3 bucket with unique name
# 2. Configure CORS policy
# 3. Set up bucket permissions
# 4. Test accessibility
```

### Manual Setup via AWS Console

#### 1. Create Bucket
1. **Go to AWS Console** → S3
2. **Click "Create bucket"**
3. **Bucket name**: `supers-files-<your-unique-suffix>`
4. **Region**: Select `ap-south-1` (or your preferred region)
5. **Leave other settings** as default for now
6. **Create bucket**

#### 2. Configure CORS Policy
1. **Go to bucket** → Permissions tab
2. **Scroll to CORS** configuration
3. **Add the following** CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

#### 3. Set Bucket Policy (Optional)
For public read access to served files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
      "Condition": {
        "StringLike": {
          "s3:ExistingObjectTag/public": "true"
        }
      }
    }
  ]
}
```

### Using AWS CLI
```bash
# Create bucket
aws s3 mb s3://supers-files-your-suffix --region ap-south-1

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket supers-files-your-suffix \
  --cors-configuration file://aws/config/s3-cors-config.json

# Set bucket policy (if using public access)
aws s3api put-bucket-policy \
  --bucket supers-files-your-suffix \
  --policy file://aws/config/s3-bucket-policy.json
```

## 🔧 Configuration Files

### Environment Variables
Add to your environment files (`aws/env/.env.dev`, `aws/env/.env.production`):
```env
AWS_S3_BUCKET_NAME=supers-files-your-suffix
AWS_REGION=ap-south-1
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/*,video/*,audio/*,application/pdf,text/*
```

### CORS Configuration
Located at `aws/config/s3-cors-config.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 📁 File Organization

### Directory Structure
```
s3://your-bucket/
├── uploads/              # User uploaded files
│   ├── images/          # Image files
│   ├── documents/       # PDFs, text files
│   └── media/           # Videos, audio
├── static/              # Static assets
└── backups/             # Backup files
```

### File Naming Convention
- **Format**: `{type}/{year}/{month}/{uuid}-{original-filename}`
- **Example**: `images/2024/01/abc123-photo.jpg`

## 🔒 Security Configuration

### IAM Permissions
Lambda functions need these S3 permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### Bucket Security
1. **Block public ACLs** - Keep bucket private by default
2. **Use signed URLs** - For secure file uploads/downloads
3. **Enable versioning** - For data protection
4. **Configure lifecycle rules** - For cost optimization

## 📤 File Upload Process

### Direct Upload (Client to S3)
1. **Client requests** signed URL from API
2. **Lambda generates** presigned POST URL
3. **Client uploads** directly to S3
4. **API receives** confirmation and stores metadata

### Proxy Upload (Through API)
1. **Client sends** file to Lambda
2. **Lambda uploads** to S3
3. **Lambda returns** file metadata
4. **Use for**: Small files, additional processing

### Upload Endpoints
```javascript
// Get presigned URL for direct upload
POST /files/presigned-url
{
  "filename": "image.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000
}

// Direct file upload through API
POST /files/upload
FormData: { file: <file-object> }
```

## 🔍 Monitoring

### CloudWatch Metrics
S3 provides metrics for:
- **Storage usage**: Monitor storage costs
- **Request counts**: Track API usage
- **Error rates**: Identify issues

### Cost Monitoring
```bash
# View S3 costs by bucket
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-02-01 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 🛠 Maintenance

### Lifecycle Rules
Set up lifecycle rules to manage costs:
```json
{
  "Rules": [
    {
      "ID": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    },
    {
      "ID": "ArchiveOldFiles",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### Backup Strategy
```bash
# Sync to backup bucket
aws s3 sync s3://supers-files-prod s3://supers-files-backup --delete

# Create bucket snapshot
aws s3 cp s3://supers-files-prod s3://supers-backups/$(date +%Y%m%d)/ --recursive
```

## 🚨 Troubleshooting

### Common Issues

#### Bucket Access Denied
```
AccessDenied: Access Denied
```
**Solutions**:
- Check IAM permissions for S3 actions
- Verify bucket policy allows required operations
- Ensure bucket exists and region is correct

#### CORS Errors
```
CORS policy doesn't allow this origin
```
**Solutions**:
- Update CORS configuration to include your domain
- Add localhost for development testing
- Check HTTP vs HTTPS in allowed origins

#### File Upload Failures
```
EntityTooLarge: File too large
```
**Solutions**:
- Check file size limits in application
- Verify presigned URL parameters
- Use multipart upload for large files

#### Presigned URL Expired
```
RequestTimeTooSkewed: Request time too skewed
```
**Solutions**:
- Generate new presigned URL
- Check system clock synchronization
- Reduce URL expiration time

### Debugging Commands

#### List Bucket Contents
```bash
aws s3 ls s3://your-bucket-name --recursive
```

#### Check Bucket Policy
```bash
aws s3api get-bucket-policy --bucket your-bucket-name
```

#### Test CORS Configuration
```bash
aws s3api get-bucket-cors --bucket your-bucket-name
```

#### Check Bucket Permissions
```bash
aws s3api get-bucket-acl --bucket your-bucket-name
```

## 📈 Performance Optimization

### Best Practices
1. **Use CloudFront** for content delivery
2. **Enable transfer acceleration** for global uploads
3. **Compress files** before upload when possible
4. **Use appropriate storage class** for different file types
5. **Implement caching** for frequently accessed files

### CloudFront Setup (Optional)
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

## 🔗 Related Documentation
- [AWS Functions Deployment](./FUNCTIONS_AWS.md)
- [Complete AWS Setup](./AWS_SETUP.md)
- [File Upload API](../api/FILES_API.md)
- [Environment Configuration](../getting-started/ENVIRONMENT.md)
