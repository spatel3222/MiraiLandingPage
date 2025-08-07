module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Debug step 1: Check environment
    const debugInfo = {
      method: req.method,
      hasApiKey: !!process.env.CLAUDE_API_KEY,
      apiKeyLength: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      hasImageData: !!(req.body && req.body.imageData),
      nodeVersion: process.version
    };

    // Debug step 2: Try to load Anthropic SDK
    let anthropicLoaded = false;
    let anthropicError = null;
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      anthropicLoaded = true;
      
      // Try to create client
      const client = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY || 'test-key'
      });
      debugInfo.clientCreated = true;
    } catch (e) {
      anthropicError = e.message;
      debugInfo.anthropicError = anthropicError;
    }

    debugInfo.anthropicLoaded = anthropicLoaded;

    // Return debug info
    return res.status(200).json({
      debug: true,
      info: debugInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Debug endpoint error',
      message: error.message,
      stack: error.stack
    });
  }
};