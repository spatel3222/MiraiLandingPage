const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, context = '' } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data and media type
    const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const mediaType = base64Match[1];
    const base64Data = base64Match[2];

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    // Claude prompt for intelligent task extraction
    const prompt = `You are an expert task management assistant that helps extract actionable tasks from handwritten notes and images. 

Analyze the provided image and extract all actionable tasks, to-dos, and reminders. For each task you identify, determine:

1. **Task Title**: Clear, concise title (max 50 characters)
2. **Description**: Brief description if context is available  
3. **Category**: Classify as one of:
   - "day-job": Work-related tasks, meetings, deadlines, professional activities
   - "side-gig": Personal projects, freelance work, entrepreneurial activities, learning
   - "home": Personal life, household tasks, family activities, health, maintenance
4. **Priority**: Based on visual cues (underlines, exclamation marks, urgency words):
   - "high": Urgent deadlines, emphasized text, "ASAP", "urgent", "important"
   - "medium": Regular tasks with some emphasis or deadlines
   - "low": General tasks without specific urgency indicators

Context about the user: ${context || 'General personal task management'}

Please respond with a JSON object in this exact format:
{
  "tasks": [
    {
      "title": "Task title here",
      "description": "Optional description",
      "category": "day-job|side-gig|home",
      "priority": "low|medium|high",
      "confidence": 0.95
    }
  ],
  "analysis": "Brief summary of what you found in the image"
}

Guidelines:
- Extract only clear, actionable tasks (not general notes or ideas)
- Be conservative - only extract tasks you're confident about
- If handwriting is unclear, include lower confidence scores
- Merge related items into single tasks when appropriate
- Ignore non-task content (random notes, doodles, etc.)
- If no clear tasks are found, return empty array

Focus on being practical and accurate rather than extracting everything possible.`;

    // Call Claude API with vision
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
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

    const responseText = response.content[0].text;
    
    // Parse Claude's response
    let result;
    try {
      // Extract JSON from response (Claude sometimes adds explanatory text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse task extraction results',
        rawResponse: responseText
      });
    }

    // Validate and sanitize the response
    if (!result.tasks || !Array.isArray(result.tasks)) {
      return res.status(500).json({ 
        error: 'Invalid response format from Claude',
        result 
      });
    }

    // Sanitize tasks
    const sanitizedTasks = result.tasks
      .filter(task => task.title && task.title.trim().length > 0)
      .map(task => ({
        title: task.title.trim().substring(0, 100),
        description: task.description ? task.description.trim().substring(0, 500) : '',
        category: ['day-job', 'side-gig', 'home'].includes(task.category) ? task.category : 'day-job',
        priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
        confidence: typeof task.confidence === 'number' ? Math.max(0, Math.min(1, task.confidence)) : 0.8
      }))
      .slice(0, 20); // Limit to max 20 tasks

    return res.status(200).json({
      success: true,
      tasks: sanitizedTasks,
      analysis: result.analysis || 'Tasks extracted successfully',
      totalFound: sanitizedTasks.length
    });

  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid Claude API key' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to process image with Claude',
      message: error.message 
    });
  }
};