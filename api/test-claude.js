const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test 1: Check API key
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'CLAUDE_API_KEY not found in environment' });
    }

    // Test 2: Create client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Test 3: Make a simple text-only API call
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Say "Hello, I am working!" in exactly 5 words.'
        }]
      });

      return res.status(200).json({
        success: true,
        claudeResponse: response.content[0].text,
        model: response.model,
        usage: response.usage
      });

    } catch (apiError) {
      // Detailed error information
      return res.status(500).json({
        error: 'Claude API call failed',
        message: apiError.message,
        status: apiError.status || 'unknown',
        type: apiError.error?.type || 'unknown',
        code: apiError.error?.code || 'unknown',
        details: apiError.error?.message || 'No details available'
      });
    }

  } catch (error) {
    return res.status(500).json({
      error: 'General error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};