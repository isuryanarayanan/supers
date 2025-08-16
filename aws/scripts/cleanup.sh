#!/bin/bash

echo "🧹 Cleaning up old AWS files and structure..."

# Remove old files
echo "Removing old IAM policy..."
rm -f functions/aws/iam.json

echo "Removing old config files..."
rm -f functions/aws/s3-bucket-policy.json
rm -f functions/aws/s3-cors-config.json

# Clean up database directory (now empty)
echo "Checking database directory..."
if [ -d "database" ] && [ ! "$(ls -A database)" ]; then
    echo "Removing empty database directory..."
    rmdir database
else
    echo "Database directory not empty or doesn't exist, skipping..."
fi

echo "✅ Cleanup complete!"
echo ""
echo "📂 New AWS structure:"
echo "  aws/"
echo "  ├── env/           # Environment files"  
echo "  ├── iam/           # IAM policies"
echo "  └── scripts/       # AWS scripts"
echo ""
echo "🔧 Updated npm scripts:"
echo "  npm run aws:check           # Check AWS services (dev)"
echo "  npm run aws:check:prod      # Check AWS services (prod)"
echo "  npm run aws:init:dynamodb   # Initialize DynamoDB (prod)"
echo "  npm run aws:init:s3         # Initialize S3 (prod)"
