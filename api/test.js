module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working',
    env: process.env.CLAUDE_API_KEY ? 'API key is set' : 'API key is missing',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};