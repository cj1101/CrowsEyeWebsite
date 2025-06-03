const functions = require('firebase-functions');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

exports.nextjsFunc = functions.https.onRequest(async (req, res) => {
  await app.prepare();
  const parsedUrl = parse(req.url, true);
  await handle(req, res, parsedUrl);
});

// Individual API endpoints
exports.marketingPosts = functions.https.onRequest(async (req, res) => {
  // Your marketing posts API logic here
  res.json({ message: 'Marketing posts API' });
});

exports.marketingStats = functions.https.onRequest(async (req, res) => {
  // Your marketing stats API logic here
  res.json({ message: 'Marketing stats API' });
});

exports.marketingMedia = functions.https.onRequest(async (req, res) => {
  // Your marketing media API logic here
  res.json({ message: 'Marketing media API' });
}); 