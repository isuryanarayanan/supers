// Loads runtime environment values for Lambdas based on stage
const path = require('path');

// Determine which env file to load based on stage
const stage = process.env.SLS_STAGE || process.env.STAGE || 'dev';
let envFile = '.env.production'; // default

if (stage === 'dev') {
    envFile = '.env.dev';
} else if (stage === 'prod') {
    envFile = '.env.production';
}

require('dotenv').config({
    path: path.resolve(__dirname, `../../aws/env/${envFile}`),
});

module.exports = {
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
};
