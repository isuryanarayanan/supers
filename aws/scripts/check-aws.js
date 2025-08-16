const { DynamoDBClient, ListTablesCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, ListBucketsCommand, HeadBucketCommand, GetBucketLocationCommand } = require("@aws-sdk/client-s3");
const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

// Default to development environment, can be overridden with ENV variable
const environment = process.env.ENV || 'dev';
require('dotenv').config({ path: `./aws/env/.env.${environment}` });

async function checkAWSCredentials() {
  const region = process.env.AWS_REGION || 'ap-south-1';
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'Supers-Posts';
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'supers';

  console.log('🔐 Checking AWS credentials and service accessibility...');
  console.log(`📍 Region: ${region}`);
  console.log(`🗄️  DynamoDB Table: ${tableName}`);
  console.log(`🪣 S3 Bucket: ${bucketName}`);
  console.log('');

  // Check AWS Identity first
  try {
    await checkAWSIdentity(region);
  } catch (error) {
    console.error('❌ AWS Identity check failed:', error.message);
    return false;
  }

  console.log('');

  let allServicesOk = true;

  // Check DynamoDB
  try {
    await checkDynamoDB(region, tableName);
  } catch (error) {
    console.error('❌ DynamoDB check failed:', error.message);
    allServicesOk = false;
  }

  console.log('');

  // Check S3
  try {
    await checkS3(region, bucketName);
  } catch (error) {
    console.error('❌ S3 check failed:', error.message);
    allServicesOk = false;
  }

  console.log('');

  // Check Lambda (optional - may not be deployed yet)
  try {
    await checkLambda(region);
  } catch (error) {
    console.warn('⚠️  Lambda check failed (this is normal if not deployed yet):', error.message);
  }

  console.log('');

  if (allServicesOk) {
    console.log('🎉 All required AWS services are accessible!');
    return true;
  } else {
    console.error('❌ Some AWS services are not accessible. Please check the configuration.');
    console.error('\n� Setup instructions:');
    console.error('   1. Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    console.error('   2. Configure credentials: aws configure');
    console.error('   3. Ensure your user has the required permissions:');
    console.error('      - DynamoDB: CreateTable, DescribeTable, Query, Scan, PutItem, GetItem, UpdateItem, DeleteItem');
    console.error('      - S3: CreateBucket, ListBuckets, GetObject, PutObject, DeleteObject');
    console.error('      - Lambda: ListFunctions, InvokeFunction (if deployed)');
    return false;
  }
}

async function checkDynamoDB(region, tableName) {
  console.log('📊 Checking DynamoDB...');

  const client = new DynamoDBClient({ region });

  // Check if we can list tables
  const listResult = await client.send(new ListTablesCommand({}));
  console.log(`   ✅ DynamoDB accessible - Found ${listResult.TableNames?.length || 0} tables`);

  // Check if our specific table exists
  const tableExists = listResult.TableNames?.includes(tableName);

  if (tableExists) {
    console.log(`   ✅ Table "${tableName}" exists`);

    // Get table details
    const describeResult = await client.send(new DescribeTableCommand({
      TableName: tableName
    }));

    const table = describeResult.Table;
    console.log(`   📈 Status: ${table?.TableStatus}`);
    console.log(`   📝 Items: ${table?.ItemCount || 'Unknown'}`);

    // Check GSI
    if (table?.GlobalSecondaryIndexes?.length > 0) {
      console.log(`   🔍 Global Secondary Indexes: ${table.GlobalSecondaryIndexes.length}`);
      table.GlobalSecondaryIndexes.forEach(gsi => {
        console.log(`      - ${gsi.IndexName}: ${gsi.IndexStatus}`);
      });
    }
  } else {
    console.log(`   ⚠️  Table "${tableName}" does not exist yet`);
    console.log('   💡 Run "node database/dynamodb-init.js" to create it');
  }
}

async function checkS3(region, bucketName) {
  console.log('🪣 Checking S3...');

  const client = new S3Client({ region });

  // Check if we can list buckets
  const listResult = await client.send(new ListBucketsCommand({}));
  console.log(`   ✅ S3 accessible - Found ${listResult.Buckets?.length || 0} buckets`);

  // Check if our specific bucket exists
  const bucketExists = listResult.Buckets?.some(bucket => bucket.Name === bucketName);

  if (bucketExists) {
    console.log(`   ✅ Bucket "${bucketName}" exists`);

    // Check bucket accessibility
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`   ✅ Bucket "${bucketName}" is accessible`);

      // Get bucket location
      try {
        const locationResult = await client.send(new GetBucketLocationCommand({
          Bucket: bucketName
        }));
        const bucketRegion = locationResult.LocationConstraint || 'us-east-1';
        console.log(`   📍 Bucket region: ${bucketRegion}`);

        if (bucketRegion !== region && bucketRegion !== 'us-east-1') {
          console.warn(`   ⚠️  Bucket region (${bucketRegion}) differs from configured region (${region})`);
        }
      } catch (err) {
        console.log('   ℹ️  Could not determine bucket region');
      }
    } catch (err) {
      throw new Error(`Bucket "${bucketName}" exists but is not accessible: ${err.message}`);
    }
  } else {
    console.log(`   ⚠️  Bucket "${bucketName}" does not exist yet`);
    console.log('   💡 It will be created automatically when you deploy with serverless');
  }
}

async function checkLambda(region) {
  console.log('⚡ Checking Lambda functions...');

  const client = new LambdaClient({ region });

  // List Lambda functions
  const listResult = await client.send(new ListFunctionsCommand({}));
  const functions = listResult.Functions || [];

  console.log(`   ✅ Lambda accessible - Found ${functions.length} functions`);

  // Look for our functions (they have the service prefix)
  const ourFunctions = functions.filter(fn =>
    fn.FunctionName?.startsWith('supers-files-') ||
    fn.FunctionName?.includes('supers')
  );

  if (ourFunctions.length > 0) {
    console.log(`   🎯 Found ${ourFunctions.length} supers-related functions:`);
    ourFunctions.forEach(fn => {
      console.log(`      - ${fn.FunctionName} (${fn.Runtime})`);
    });
  } else {
    console.log('   ℹ️  No supers-related Lambda functions found (not deployed yet)');
    console.log('   💡 Deploy with "cd functions/aws && serverless deploy"');
  }
}

async function checkAWSIdentity(region) {
  console.log('🆔 Checking AWS Identity...');

  const client = new STSClient({ region });
  const result = await client.send(new GetCallerIdentityCommand({}));

  console.log(`   ✅ Authenticated as: ${result.Arn}`);
  console.log(`   🔢 Account ID: ${result.Account}`);
  console.log(`   👤 User ID: ${result.UserId}`);
}

if (require.main === module) {
  checkAWSCredentials()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error.message);

      if (error.name === 'CredentialsProviderError') {
        console.error('   Please configure AWS credentials using: aws configure');
      } else if (error.name === 'UnauthorizedException') {
        console.error('   AWS credentials are configured but lack required permissions');
      } else if (error.code === 'NetworkingError') {
        console.error('   Network connectivity issue - check your internet connection');
      }

      process.exit(1);
    });
}

module.exports = { checkAWSCredentials };
