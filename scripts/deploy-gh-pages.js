#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const repoRoot = path.resolve(__dirname, '..');
const worktreePath = process.env.GH_PAGES_WORKTREE || path.join(os.tmpdir(), 'supers-gh-pages');
const branch = process.env.GH_PAGES_BRANCH || 'gh-pages';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/supers';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://zrzucmu4zl.execute-api.ap-south-1.amazonaws.com/prod';
const apiStage = process.env.API_STAGE || 'prod';
const uploadLimit = process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '1073741824';
const theme = process.env.NEXT_PUBLIC_DEFAULT_THEME || 'dark';

function run(command, options = {}) {
  console.log(`$ ${command}`);
  execSync(command, {
    cwd: options.cwd || repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_DEFAULT_THEME: theme,
      NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
      NEXT_PUBLIC_MAX_FILE_SIZE: uploadLimit,
      API_BASE_URL: process.env.API_BASE_URL || apiBaseUrl,
      API_STAGE: apiStage,
    },
  });
}

function output(command, options = {}) {
  return execSync(command, {
    cwd: options.cwd || repoRoot,
    encoding: 'utf8',
    env: process.env,
  }).trim();
}

function emptyDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.git') continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name);
    const dest = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(src, dest);
    } else if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(src), dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function ensureWorktree() {
  if (fs.existsSync(path.join(worktreePath, '.git'))) {
    run(`git fetch origin ${branch}`, { cwd: worktreePath });
    run(`git pull --ff-only origin ${branch}`, { cwd: worktreePath });
    return;
  }

  fs.rmSync(worktreePath, { recursive: true, force: true });

  let branchExists = false;
  try {
    output(`git ls-remote --exit-code --heads origin ${branch}`);
    branchExists = true;
  } catch {
    branchExists = false;
  }

  if (branchExists) {
    run(`git worktree add ${worktreePath} ${branch}`);
  } else {
    run(`git worktree add -b ${branch} ${worktreePath}`);
  }
}

function main() {
  console.log('🚀 Building static GitHub Pages site');
  console.log(`   basePath: ${basePath}`);
  console.log(`   API: ${apiBaseUrl}`);
  console.log(`   upload limit: ${uploadLimit}`);

  run('pnpm run build');

  const outDir = path.join(repoRoot, 'out');
  if (!fs.existsSync(outDir)) {
    throw new Error('Next.js export output directory not found: out/');
  }
  fs.closeSync(fs.openSync(path.join(outDir, '.nojekyll'), 'w'));

  console.log(`\n📦 Publishing out/ to ${branch} via worktree ${worktreePath}`);
  ensureWorktree();
  emptyDirectory(worktreePath);
  copyDirectory(outDir, worktreePath);

  run('git add -A', { cwd: worktreePath });

  let hasChanges = true;
  try {
    output('git diff --cached --quiet', { cwd: worktreePath });
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('✅ gh-pages already up to date; nothing to commit.');
    return;
  }

  const message = process.env.GH_PAGES_COMMIT_MESSAGE || `Deploy GitHub Pages ${new Date().toISOString()}`;
  run(`git commit -m ${JSON.stringify(message)}`, { cwd: worktreePath });
  run(`git push origin ${branch}`, { cwd: worktreePath });

  console.log('\n✅ GitHub Pages branch deployment complete.');
  console.log('   Configure GitHub Pages: Settings → Pages → Deploy from a branch → gh-pages / root');
}

main();
