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

    try {
      // Call Claude API with vision - using Sonnet 3.5
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `Extract actionable tasks from this handwritten note. For each task, determine:
- title: short task description
- category: "day-job" (work tasks), "side-gig" (personal projects), or "home" (household/personal)
- priority: "high" (urgent), "medium" (normal), or "low" (optional)

Return ONLY a JSON object like this:
{
  "tasks": [
    {"title": "task here", "category": "day-job", "priority": "medium", "description": "optional details"}
  ],
  "analysis": "brief summary"
}`
            }
          ]
        }]
      });

      // Parse response
      const responseText = response.content[0].text;
      let result;
      
      try {
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a simple response
          result = {
            tasks: [{
              title: "Review handwritten notes",
              category: "day-job",
              priority: "medium",
              description: "Claude processed the image but couldn't extract specific tasks"
            }],
            analysis: responseText
          };
        }
      } catch (parseError) {
        // Fallback if parsing fails
        result = {
          tasks: [],
          analysis: "Image processed but couldn't parse tasks. Raw response: " + responseText.substring(0, 200)
        };
      }

      // Ensure tasks have valid structure
      if (result.tasks && Array.isArray(result.tasks)) {
        result.tasks = result.tasks.map(task => ({
          title: task.title || 'Untitled task',
          description: task.description || '',
          category: ['day-job', 'side-gig', 'home'].includes(task.category) ? task.category : 'day-job',
          priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium'
        }));
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
      
      // Check for specific error types
      if (apiError.status === 401) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      
      if (apiError.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      if (apiError.status === 413) {
        return res.status(413).json({ error: 'Image too large. Please use a smaller image.' });
      }
      
      return res.status(500).json({
        error: 'Claude API error',
        message: apiError.message || 'Unknown error',
        details: apiError.error?.message || 'No details available'
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