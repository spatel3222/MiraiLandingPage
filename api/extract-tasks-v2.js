const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, context = '' } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const mediaType = base64Match[1];
    const base64Data = base64Match[2];

    // Initialize Claude
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Simple prompt
    const prompt = `Extract actionable tasks from this handwritten note. Return a JSON object with this structure:
{
  "tasks": [
    {
      "title": "task title",
      "description": "optional description",
      "category": "day-job" or "side-gig" or "home",
      "priority": "low" or "medium" or "high"
    }
  ],
  "analysis": "brief summary"
}`;

    try {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            }
          ]
        }]
      });

      // Parse response
      const responseText = response.content[0].text;
      let result;
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (e) {
        return res.status(200).json({
          success: true,
          tasks: [],
          analysis: 'Could not parse response, but Claude processed the image',
          rawResponse: responseText
        });
      }

      // Return successful response
      return res.status(200).json({
        success: true,
        tasks: result.tasks || [],
        analysis: result.analysis || 'Tasks extracted',
        totalFound: (result.tasks || []).length
      });

    } catch (apiError) {
      console.error('Claude API error:', apiError);
      return res.status(500).json({
        error: 'Claude API call failed',
        message: apiError.message,
        status: apiError.status,
        type: apiError.error?.type
      });
    }

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};