const fs = require('fs-extra')
const path = require('path')

// Paths
const ROOT = path.resolve(__dirname, '..')
const NEXT_STANDALONE = path.join(ROOT, '.next', 'standalone')
const NEXT_STATIC = path.join(ROOT, '.next', 'static')
const FUNCTIONS_DIR = path.join(ROOT, 'functions')
const TARGET_APP_DIR = path.join(FUNCTIONS_DIR, 'nextApp')

async function copyBuild() {
  if (!fs.existsSync(NEXT_STANDALONE)) {
    console.error('❌ Standalone build not found. Run `next build` first.')
    process.exit(1)
  }

  // Clean target directory
  await fs.remove(TARGET_APP_DIR)
  await fs.ensureDir(TARGET_APP_DIR)

  // Copy standalone server (includes server.js and node_modules bundle)
  await fs.copy(NEXT_STANDALONE, TARGET_APP_DIR)

  // Copy static assets so Next can serve them
  const staticTarget = path.join(TARGET_APP_DIR, '.next', 'static')
  await fs.copy(NEXT_STATIC, staticTarget)

  // Copy public directory (if present)
  const PUBLIC_DIR = path.join(ROOT, 'public')
  if (fs.existsSync(PUBLIC_DIR)) {
    await fs.copy(PUBLIC_DIR, path.join(TARGET_APP_DIR, 'public'))
  }

  console.log('✅ Next standalone build copied to Firebase Functions directory')
}

copyBuild().catch((err) => {
  console.error(err)
  process.exit(1)
}) 