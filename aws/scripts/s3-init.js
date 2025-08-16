const { S3Client, CreateBucketCommand, ListBucketsCommand, HeadBucketCommand, PutBucketCorsCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand, GetBucketLocationCommand } = require("@aws-sdk/client-s3");

// Default to production environment for S3 initialization
const environment = process.env.ENV || 'production';
require('dotenv').config({ path: `./aws/env/.env.${environment}` });

// AWS S3 configuration
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'supers';

const client = new S3Client({ region });

// CORS configuration
const corsConfiguration = {
    CORSRules: [
        {
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            AllowedHeaders: ['*'],
            ExposedHeaders: ['ETag', 'x-amz-version-id'],
            MaxAgeSeconds: 86400
        }
    ]
};

// Bucket policy for public read access
const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
        {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`
        }
    ]
};

async function createS3Bucket() {
    try {
        console.log('🪣 Creating S3 bucket in AWS...');
        console.log(`📍 Region: ${region}`);
        console.log(`🗄️  Bucket: ${bucketName}`);

        // First, let's check if bucket exists anywhere
        try {
            const listResult = await client.send(new ListBucketsCommand({}));
            const existingBucket = listResult.Buckets?.find(bucket => bucket.Name === bucketName);

            if (existingBucket) {
                console.log(`📦 Bucket ${bucketName} already exists, checking location...`);

                // Try to get bucket location
                try {
                    const locationResult = await client.send(new GetBucketLocationCommand({
                        Bucket: bucketName
                    }));
                    const bucketRegion = locationResult.LocationConstraint || 'us-east-1';

                    if (bucketRegion !== region) {
                        console.error(`❌ Bucket ${bucketName} exists in region ${bucketRegion}, but you're trying to deploy to ${region}`);
                        console.error('   Solutions:');
                        console.error(`   1. Change AWS_REGION to ${bucketRegion} in your .env.production file`);
                        console.error(`   2. Or use a different bucket name like ${bucketName}-${region}`);
                        process.exit(1);
                    }

                    console.log(`✅ Bucket ${bucketName} exists in correct region (${bucketRegion})`);

                    // Check if we can access the bucket
                    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
                    console.log(`✅ Bucket ${bucketName} is accessible`);

                } catch (locationError) {
                    if (locationError.name === 'NoSuchBucket') {
                        console.log(`📝 Bucket ${bucketName} not found, will create it`);
                    } else {
                        console.error(`❌ Error checking bucket location: ${locationError.message}`);
                        if (locationError.message.includes('eu-west-3')) {
                            console.error(`   The bucket exists in eu-west-3 but you're deploying to ${region}`);
                            console.error('   Either delete the old bucket or use a different name');
                        }
                        process.exit(1);
                    }
                }
            }
        } catch (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            process.exit(1);
        }

        // Try to access the bucket to see if it exists in our region
        let bucketExists = false;
        try {
            await client.send(new HeadBucketCommand({ Bucket: bucketName }));
            bucketExists = true;
            console.log(`✅ Bucket ${bucketName} already exists and is accessible in ${region}`);
        } catch (error) {
            console.log(`🔍 Error checking bucket: ${error.name} - ${error.message}`);
            if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
                console.log(`📝 Bucket ${bucketName} does not exist in ${region}, creating...`);
            } else if (error.message && error.message.includes('PermanentRedirect')) {
                console.error(`❌ Bucket ${bucketName} exists in a different region`);
                console.error('   You need to either:');
                console.error('   1. Delete the bucket from the other region, or');
                console.error('   2. Use a different bucket name');
                process.exit(1);
            } else {
                console.error(`❌ Error accessing bucket: ${error.message}`);
                // Don't exit here, let's try to create it anyway
            }
        }

        // Create bucket if it doesn't exist
        if (!bucketExists) {
            const createParams = {
                Bucket: bucketName
            };

            // For regions other than us-east-1, we need to specify the location constraint
            if (region !== 'us-east-1') {
                createParams.CreateBucketConfiguration = {
                    LocationConstraint: region
                };
            }

            await client.send(new CreateBucketCommand(createParams));
            console.log(`🚀 Bucket ${bucketName} created successfully in ${region}`);
        }

        // Configure CORS
        console.log('🔗 Setting up CORS configuration...');
        await client.send(new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: corsConfiguration
        }));
        console.log('✅ CORS configuration applied');

        // Configure public access block (allow public read)
        console.log('🔓 Configuring public access settings...');
        await client.send(new PutPublicAccessBlockCommand({
            Bucket: bucketName,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                BlockPublicPolicy: false,
                IgnorePublicAcls: false,
                RestrictPublicBuckets: false
            }
        }));
        console.log('✅ Public access settings configured');

        // Apply bucket policy for public read
        console.log('📋 Applying bucket policy...');
        await client.send(new PutBucketPolicyCommand({
            Bucket: bucketName,
            Policy: JSON.stringify(bucketPolicy)
        }));
        console.log('✅ Bucket policy applied');

        console.log(`🎉 S3 bucket ${bucketName} is ready for use!`);

    } catch (error) {
        console.error('❌ Error setting up S3 bucket:', error.message);

        if (error.name === 'BucketAlreadyExists') {
            console.error('   The bucket name is already taken globally. Try a different name.');
        } else if (error.name === 'BucketAlreadyOwnedByYou') {
            console.error('   You already own this bucket in a different region.');
        } else if (error.name === 'CredentialsProviderError') {
            console.error('   Please configure AWS credentials using: aws configure');
        } else if (error.name === 'UnauthorizedException' || error.name === 'AccessDenied') {
            console.error('   AWS credentials lack S3 permissions');
        }

        throw error;
    }
}

// Run initialization
if (require.main === module) {
    createS3Bucket().then(() => {
        console.log('S3 bucket initialization complete');
        process.exit(0);
    }).catch(err => {
        console.error('S3 initialization failed:', err);
        process.exit(1);
    });
}

module.exports = { createS3Bucket, client };
