#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import our build scripts
const { buildPosts } = require('./build-posts');
const { preBuild } = require('./pre-build');

// Configuration
const BUILD_TYPE = process.env.BUILD_TYPE || 'development';
const SKIP_API_CHECK = process.env.SKIP_API_CHECK === 'true';

// Execute command with proper error handling
function execCommand(command, cwd = process.cwd()) {
  try {
    console.log(`🔧 Executing: ${command}`);
    const result = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Create deployment summary
function createDeploymentSummary(buildResult) {
  const summary = {
    deploymentId: `deploy-${buildResult.version}`,
    timestamp: new Date().toISOString(),
    buildType: BUILD_TYPE,
    postsVersion: buildResult.version,
    postsCount: buildResult.postsCount,
    status: 'completed',
    nextjsBuild: true,
    apiSync: true
  };
  
  const summaryFile = path.join(__dirname, '..', 'data', 'deployment-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  
  console.log('📋 Deployment Summary:');
  console.log(`   Deployment ID: ${summary.deploymentId}`);
  console.log(`   Posts Version: ${summary.postsVersion}`);
  console.log(`   Posts Count: ${summary.postsCount}`);
  console.log(`   Build Type: ${summary.buildType}`);
  console.log(`   Timestamp: ${summary.timestamp}`);
  
  return summary;
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting versioned deployment process...');
  console.log(`📦 Build Type: ${BUILD_TYPE}`);
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Pre-build checks (only if not skipped)
    if (!SKIP_API_CHECK) {
      console.log('\n📋 Step 1: Pre-build checks');
      const preCheckSuccess = await preBuild();
      if (!preCheckSuccess) {
        throw new Error('Pre-build checks failed');
      }
    } else {
      console.log('\n📋 Step 1: Skipping API checks (SKIP_API_CHECK=true)');
    }
    
    // Step 2: Sync posts from API
    console.log('\n📋 Step 2: Syncing posts from API');
    const buildResult = await buildPosts();
    
    // Step 3: Lint check
    console.log('\n📋 Step 3: Running lint checks');
    const lintSuccess = execCommand('pnpm run lint');
    if (!lintSuccess) {
      console.warn('⚠️  Lint checks failed, continuing anyway...');
    }
    
    // Step 4: Next.js build
    console.log('\n📋 Step 4: Building Next.js application');
    const buildSuccess = execCommand('pnpm run build');
    if (!buildSuccess) {
      throw new Error('Next.js build failed');
    }
    
    // Step 5: Create deployment summary
    console.log('\n📋 Step 5: Creating deployment summary');
    const summary = createDeploymentSummary(buildResult);
    
    // Success!
    console.log('\n' + '='.repeat(50));
    console.log('✅ DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('✅ Posts synchronized from API');
    console.log('✅ Next.js build completed');
    console.log('✅ Versioned deployment ready');
    console.log('=' .repeat(50));
    
    return summary;
    
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ DEPLOYMENT FAILED!');
    console.error(`❌ Error: ${error.message}`);
    console.error('=' .repeat(50));
    process.exit(1);
  }
}

// Handle different deployment modes
async function handleDeployment() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'posts-only':
      console.log('📦 Running posts sync only...');
      await buildPosts();
      break;
      
    case 'build-only':
      console.log('📦 Running Next.js build only...');
      execCommand('pnpm run build');
      break;
      
    case 'full':
    default:
      await deploy();
      break;
  }
}

// Run if this script is executed directly
if (require.main === module) {
  handleDeployment();
}

module.exports = { deploy, createDeploymentSummary };
