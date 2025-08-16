# DynamoDB Setup

- Table name: Supers-Posts
- Keys: PK (HASH), SK (RANGE)
- GSI: CreatedAtIndex (status, created_at)

# DynamoDB Setup Guide

This project uses Amazon DynamoDB for storing posts and content data.

## 📊 Database Structure

### Main Table
- **Table Name**: `Supers-Posts`
- **Primary Key**: `pk` (String) - Partition Key
- **Sort Key**: `sk` (String) - Sort Key
- **Region**: `ap-south-1` (configurable)

### Item Types

#### Posts
- **pk**: `POST#<post-id>`
- **sk**: `POST#<post-id>`
- **Attributes**: title, excerpt, content, type, status, createdAt, updatedAt, etc.

#### Post Cells
- **pk**: `POST#<post-id>`
- **sk**: `CELL#<cell-id>`
- **Attributes**: type (markdown/image/file/video), content, cellId, order

## 🚀 Setup Instructions

### Automatic Setup (Recommended)
```bash
# Check if table exists and create if needed
node aws/scripts/check-aws.js

# Initialize table with sample data
node database/dynamodb-init.js
```

### Manual Setup via AWS Console
1. **Go to AWS Console** → DynamoDB
2. **Create table** with:
   - Table name: `Supers-Posts`
   - Partition key: `pk` (String)
   - Sort key: `sk` (String)
3. **Use default settings** for billing mode and encryption

### Using AWS CLI
```bash
# Create table
aws dynamodb create-table 
  --table-name Supers-Posts 
  --attribute-definitions 
    AttributeName=pk,AttributeType=S 
    AttributeName=sk,AttributeType=S 
  --key-schema 
    AttributeName=pk,KeyType=HASH 
    AttributeName=sk,KeyType=RANGE 
  --billing-mode PAY_PER_REQUEST 
  --region ap-south-1
```

## 🔧 Configuration

### Environment Variables
Add to your environment files (`aws/env/.env.dev`, `aws/env/.env.production`):
```env
DYNAMODB_TABLE_NAME=Supers-Posts
AWS_REGION=ap-south-1
```

### Local Development
For local DynamoDB development:
```bash
# Install DynamoDB Local
npm install -g dynamodb-local

# Start local DynamoDB
dynamodb-local

# Update environment for local testing
DYNAMODB_ENDPOINT=http://localhost:8000
```

## 📋 Data Operations

### Common Queries

#### Get All Posts
```javascript
const params = {
  TableName: 'Supers-Posts',
  FilterExpression: 'begins_with(sk, :sk)',
  ExpressionAttributeValues: {
    ':sk': 'POST#'
  }
};
```

#### Get Post with Cells
```javascript
const params = {
  TableName: 'Supers-Posts',
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: {
    ':pk': `POST#${postId}`
  }
};
```

#### Create Post
```javascript
const postItem = {
  pk: `POST#${postId}`,
  sk: `POST#${postId}`,
  title: 'Post Title',
  type: 'blog',
  status: 'draft',
  createdAt: new Date().toISOString(),
  // ... other attributes
};
```

### Sample Data
The initialization script creates sample posts:
- **Blog post**: "Getting Started with Serverless"
- **Project post**: "Portfolio Website"
- **News post**: "Latest Updates"

## 🔍 Monitoring

### CloudWatch Metrics
DynamoDB automatically provides metrics for:
- **Read/Write capacity**: Monitor usage patterns
- **Throttled requests**: Identify capacity issues
- **User errors**: Track application errors

### Accessing Metrics
1. **AWS Console** → CloudWatch → Metrics
2. **Search for** DynamoDB metrics
3. **Filter by** table name: `Supers-Posts`

### Common Metrics to Monitor
- `ConsumedReadCapacityUnits`
- `ConsumedWriteCapacityUnits`
- `UserErrors`
- `SystemErrors`
- `ThrottledRequests`

## 🛠 Maintenance

### Backup Strategy
```bash
# Create on-demand backup
aws dynamodb create-backup 
  --table-name Supers-Posts 
  --backup-name "supers-posts-$(date +%Y%m%d)"
```

### Enable Point-in-Time Recovery
```bash
aws dynamodb update-continuous-backups 
  --table-name Supers-Posts 
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Export Data
```bash
# Export table to S3
aws dynamodb export-table-to-point-in-time 
  --table-arn arn:aws:dynamodb:ap-south-1:account:table/Supers-Posts 
  --s3-bucket your-backup-bucket
```

## 🚨 Troubleshooting

### Common Issues

#### Table Not Found
```
ResourceNotFoundException: Table 'Supers-Posts' doesn't exist
```
**Solution**: 
- Run `node aws/scripts/check-aws.js` to create table
- Verify region matches your configuration
- Check table name spelling

#### Access Denied
```
AccessDeniedException: User is not authorized to perform: dynamodb:Query
```
**Solution**:
- Check IAM permissions include DynamoDB access
- Verify Lambda execution role has correct permissions
- See [AWS Setup](./AWS_SETUP.md) for required policies

#### Throttling Issues
```
ProvisionedThroughputExceededException
```
**Solution**:
- Switch to On-Demand billing mode
- Increase provisioned capacity if using provisioned mode
- Implement exponential backoff in application code

#### Item Size Limit
```
ValidationException: Item size has exceeded 400KB
```
**Solution**:
- Move large content to S3 and store references in DynamoDB
- Split large items into multiple smaller items
- Compress data before storing

### Debugging Tips

#### Check Table Status
```bash
aws dynamodb describe-table --table-name Supers-Posts
```

#### List All Items
```bash
aws dynamodb scan --table-name Supers-Posts --max-items 10
```

#### Query Specific Post
```bash
aws dynamodb query 
  --table-name Supers-Posts 
  --key-condition-expression "pk = :pk" 
  --expression-attribute-values '{":pk": {"S": "POST#sample-post"}}'
```

## 📊 Performance Optimization

### Best Practices
1. **Use partition keys effectively** - Distribute load across partitions
2. **Minimize item size** - Keep items under 400KB
3. **Use projection expressions** - Only fetch needed attributes
4. **Implement pagination** - Use LastEvaluatedKey for large datasets
5. **Cache frequently accessed data** - Use ElastiCache or in-memory caching

### Query Patterns
```javascript
// Good: Query with partition key
const goodQuery = {
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: { ':pk': 'POST#123' }
};

// Avoid: Full table scan
const avoidScan = {
  FilterExpression: 'title = :title',
  ExpressionAttributeValues: { ':title': 'Some Title' }
};
```

## 🔗 Related Documentation
- [AWS Functions Deployment](./FUNCTIONS_AWS.md)
- [Complete AWS Setup](./AWS_SETUP.md)
- [Environment Configuration](../getting-started/ENVIRONMENT.md)
- [API Documentation](../api/POSTS_API.md)
