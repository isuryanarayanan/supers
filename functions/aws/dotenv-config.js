// Determines which .env file to load based on the stage
const path = require('path');

const stage = process.env.SLS_STAGE || process.env.STAGE || 'dev';

let envFile = '.env.production'; // default

if (stage === 'dev') {
    envFile = '.env.dev';
} else if (stage === 'prod') {
    envFile = '.env.production';
}

module.exports = path.resolve(__dirname, `../../aws/env/${envFile}`);
