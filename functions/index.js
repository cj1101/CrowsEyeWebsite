const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const path = require('path');
const next = require('next');

// Set global options for 2nd Gen functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1'
});

// Location of the standalone build we copy in scripts/prepare-functions.js
const NEXT_APP_DIR = path.join(__dirname, 'nextApp');

// Initialise Next.js app
const nextApp = next({
  dev: false,
  conf: {
    // Tell Next where to find its build output
    distDir: path.join(NEXT_APP_DIR, '.next')
  }
});

const requestHandler = nextApp.getRequestHandler();

exports.nextjsFunc2 = onRequest({
  memory: '1GiB',
  timeoutSeconds: 300,
  concurrency: 80,
  region: 'us-central1'
}, async (req, res) => {
  await nextApp.prepare();
  return requestHandler(req, res);
});

// Export the image generation function
exports.generateImageWithImagen = require('./image-generation').generateImageWithImagen;

// Export the AI tagging function
exports.generateTagsOnUpload = require('./ai-tagging').generateTagsOnUpload; 