const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

// Set global options for 2nd Gen functions
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1'
});

// Simple API handler for now - we'll expand this as needed
exports.nextjsFunc2 = onRequest({
  memory: '1GiB',
  timeoutSeconds: 300,
  concurrency: 80
}, async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // For now, return a simple response
  // TODO: Implement actual API logic
  res.status(200).json({ 
    message: 'API endpoint working', 
    path: req.path,
    method: req.method 
  });
}); 