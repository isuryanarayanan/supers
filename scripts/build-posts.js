#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const API_STAGE = process.env.API_STAGE || "dev"; // dev or prod
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_DIR = path.join(__dirname, "..", "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate version tag (timestamp-based)
function generateVersionTag() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");

  return `v${year}${month}${day}-${hour}${minute}${second}`;
}

// Make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Process posts to fix escaped content from database
function processStaticPosts(posts) {
  return posts.map((post) => {
    if (!post || !post.cells) return post;

    return {
      ...post,
      cells: post.cells.map((cell) => {
        if (cell.type === "markdown" && typeof cell.content === "string") {
          let content = cell.content;

          // Remove outer quotes if they exist (double JSON encoding issue)
          if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1);
          }

          // Convert escaped characters back to actual characters
          content = content
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"');

          return {
            ...cell,
            content,
          };
        }
        return cell;
      }),
    };
  });
}

// Authenticate with production API if needed
async function authenticateAPI() {
  if (API_STAGE === "dev" || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.log("🔓 Using development API or no auth credentials provided");
    return null;
  }

  try {
    console.log("🔐 Authenticating with production API...");
    const authUrl = `${API_BASE_URL}/auth/login`;
    
    const response = await makeRequest(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      }),
    });

    if (response.statusCode !== 200) {
      throw new Error(`Authentication failed with status ${response.statusCode}`);
    }

    if (!response.data.success || !response.data.token) {
      throw new Error(`Authentication failed: ${response.data.message || "Unknown error"}`);
    }

    console.log("✅ Successfully authenticated with production API");
    return response.data.token;
  } catch (error) {
    console.error("❌ Error authenticating with API:", error.message);
    throw error;
  }
}

// Fetch posts from API
async function fetchPostsFromAPI() {
  try {
    console.log("🔍 Fetching posts from API...");
    
    // Authenticate if using production API
    const authToken = await authenticateAPI();
    
    // Build the correct URL based on environment
    let url;
    if (API_STAGE === "prod") {
      url = `${API_BASE_URL}/posts`;
    } else {
      // Development API uses /dev/posts
      url = `${API_BASE_URL}/dev/posts`;
    }
    
    console.log(`🌐 API URL: ${url} (stage: ${API_STAGE})`);

    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if we have a token
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await makeRequest(url, {
      method: "GET",
      headers,
    });

    if (response.statusCode !== 200) {
      throw new Error(
        `API request failed with status ${response.statusCode}. Is the API server running?`
      );
    }

    if (!response.data.success) {
      throw new Error(`API error: ${response.data.error || "Unknown error"}`);
    }

    const posts = response.data.data || [];
    console.log(`✅ Successfully fetched ${posts.length} posts from API`);

    // Process posts to fix escaped content
    const processedPosts = processStaticPosts(posts);
    console.log(
      `🔧 Processed ${processedPosts.length} posts to fix escaped content`
    );

    return processedPosts;
  } catch (error) {
    console.error("❌ Error fetching posts from API:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.error("");
      console.error("💡 API server appears to be down. Please start it with:");
      if (API_STAGE === "dev") {
        console.error("   npm run dev:api");
        console.error("   or");
        console.error(
          '   cd functions/aws && export $(cat .env | grep -v "^#" | xargs) && npm run dev'
        );
      } else {
        console.error("   Check if production API is deployed and accessible");
        console.error(`   URL: ${API_BASE_URL}/posts`);
      }
      console.error("");
    }

    throw error;
  }
}

// Generate TypeScript file content
function generatePostsFileContent(posts, versionTag) {
  const timestamp = new Date().toISOString();
  const apiEndpoint = API_STAGE === "prod" ? `${API_BASE_URL}/posts` : `${API_BASE_URL}/dev/posts`;

  return `// Auto-generated posts file
// Version: ${versionTag}
// Generated: ${timestamp}
// Source: API (${apiEndpoint} - ${API_STAGE} environment)

import { Post } from "@/types/post";

export const posts: Post[] = ${JSON.stringify(posts, null, 2)};

export const postsMetadata = {
  version: "${versionTag}",
  generatedAt: "${timestamp}",
  source: "api",
  environment: "${API_STAGE}",
  count: ${posts.length}
};
`;
}

// Backup existing posts.ts file
function backupExistingPosts(versionTag) {
  const postsFile = path.join(DATA_DIR, "posts.ts");

  if (fs.existsSync(postsFile)) {
    const backupFile = path.join(BACKUP_DIR, `${versionTag}.posts.ts`);
    fs.copyFileSync(postsFile, backupFile);
    console.log(`📦 Backed up existing posts.ts to ${backupFile}`);
    return true;
  }

  return false;
}

// Write versioned posts file
function writeVersionedPosts(posts, versionTag) {
  // Create main posts.ts file
  const postsFile = path.join(DATA_DIR, "posts.ts");
  const content = generatePostsFileContent(posts, versionTag);
  fs.writeFileSync(postsFile, content, "utf8");

  // Create versioned backup
  const versionedFile = path.join(BACKUP_DIR, `${versionTag}.posts.ts`);
  fs.writeFileSync(versionedFile, content, "utf8");

  console.log(`📝 Generated posts.ts with version ${versionTag}`);
  console.log(`📝 Created versioned backup: ${versionedFile}`);
}

// Create build manifest
function createBuildManifest(versionTag, posts) {
  const apiEndpoint = API_STAGE === "prod" ? `${API_BASE_URL}/posts` : `${API_BASE_URL}/dev/posts`;
  
  const manifest = {
    version: versionTag,
    timestamp: new Date().toISOString(),
    postsCount: posts.length,
    buildType: "api-sync",
    apiEndpoint: apiEndpoint,
    environment: API_STAGE,
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      type: post.type,
      status: post.status,
      featured: post.featured,
      updatedAt: post.updatedAt,
    })),
  };

  const manifestFile = path.join(DATA_DIR, "build-manifest.json");
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), "utf8");

  const versionedManifest = path.join(
    BACKUP_DIR,
    `${versionTag}.build-manifest.json`
  );
  fs.writeFileSync(
    versionedManifest,
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  console.log(`📋 Created build manifest: ${manifestFile}`);
}

// Clean old backups (keep last 10 versions)
function cleanOldBackups() {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.endsWith(".posts.ts"))
      .map((file) => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stat: fs.statSync(path.join(BACKUP_DIR, file)),
      }))
      .sort((a, b) => b.stat.mtime - a.stat.mtime);

    // Keep only the 10 most recent backups
    const filesToDelete = files.slice(10);

    filesToDelete.forEach((file) => {
      fs.unlinkSync(file.path);
      // Also delete corresponding manifest if it exists
      const manifestFile = file.path.replace(
        ".posts.ts",
        ".build-manifest.json"
      );
      if (fs.existsSync(manifestFile)) {
        fs.unlinkSync(manifestFile);
      }
    });

    if (filesToDelete.length > 0) {
      console.log(`🧹 Cleaned ${filesToDelete.length} old backup files`);
    }
  } catch (error) {
    console.warn("⚠️  Warning: Could not clean old backups:", error.message);
  }
}

// Main build function
async function buildPosts() {
  try {
    console.log("🚀 Starting posts build process...");

    const versionTag = generateVersionTag();
    console.log(`🏷️  Build version: ${versionTag}`);

    // Backup existing posts.ts
    backupExistingPosts(versionTag);

    // Fetch posts from API
    const posts = await fetchPostsFromAPI();

    // Write new posts file with version
    writeVersionedPosts(posts, versionTag);

    // Create build manifest
    createBuildManifest(versionTag, posts);

    // Clean old backups
    cleanOldBackups();

    console.log("✅ Posts build completed successfully!");
    console.log(
      `📊 Generated ${posts.length} posts with version ${versionTag}`
    );

    return {
      success: true,
      version: versionTag,
      postsCount: posts.length,
    };
  } catch (error) {
    console.error("❌ Posts build failed:", error.message);
    
    // For static builds, try to use existing posts data as fallback
    console.log("🔄 Attempting to use existing posts data as fallback...");
    
    try {
      const existingPostsFile = path.join(DATA_DIR, "posts.ts");
      if (fs.existsSync(existingPostsFile)) {
        console.log("📂 Found existing posts.ts file, using as fallback");
        
        // Read the existing file to extract posts data
        const existingContent = fs.readFileSync(existingPostsFile, "utf8");
        const match = existingContent.match(/export const posts: Post\[\] = (\[[\s\S]*?\]);/);
        
        if (match && match[1]) {
          const existingPosts = JSON.parse(match[1]);
          if (existingPosts.length > 0) {
            console.log(`✅ Using ${existingPosts.length} existing posts for build`);
            
            // Create build manifest with fallback data
            createBuildManifest(versionTag, existingPosts);
            
            return {
              success: true,
              version: versionTag,
              postsCount: existingPosts.length,
              fallback: true,
            };
          }
        }
      }
      
      // If no existing posts, create minimal fallback
      console.log("🔧 Creating minimal posts file for build compatibility");
      
      // Create a placeholder post to ensure build doesn't fail
      const fallbackPosts = [
        {
          id: "placeholder",
          title: "Placeholder Post",
          type: "blog",
          status: "draft", // Keep as draft so it doesn't appear in production
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cells: [
            {
              id: "placeholder-cell-1",
              type: "markdown",
              content: "This is a placeholder post for build compatibility."
            }
          ]
        }
      ];
      
      writeVersionedPosts(fallbackPosts, versionTag);
      createBuildManifest(versionTag, fallbackPosts);
      
      console.log("⚠️  Build completed with placeholder post data - API was unavailable");
      
      return {
        success: true,
        version: versionTag,
        postsCount: 0, // Report 0 since placeholder doesn't count
        fallback: true,
      };
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
      process.exit(1);
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  buildPosts();
}

module.exports = { buildPosts, generateVersionTag };
