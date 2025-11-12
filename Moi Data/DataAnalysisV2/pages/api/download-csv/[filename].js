import fs from 'fs'
import path from 'path'

/**
 * API endpoint to download CSV files from outputs folder
 * Usage: GET /api/download-csv/filename.csv
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename } = req.query
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' })
    }

    // Security: Only allow CSV files and prevent directory traversal
    if (!filename.endsWith('.csv') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }

    const outputDir = path.join(process.cwd(), 'outputs')
    const filePath = path.join(outputDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const stats = fs.statSync(filePath)

    // Set appropriate headers for CSV download
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', stats.size)
    res.setHeader('Cache-Control', 'no-cache')

    // Send file content
    res.status(200).send(fileContent)

  } catch (error) {
    console.error('CSV download error:', error)
    res.status(500).json({ 
      error: 'Download failed',
      details: error.message 
    })
  }
}