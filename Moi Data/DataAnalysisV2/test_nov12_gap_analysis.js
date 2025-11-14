const { JuliusV7Engine } = require('./lib/JuliusV7Engine.js');
const fs = require('fs');
const path = require('path');

async function runNov12GapAnalysis() {
  try {
    console.log('🔧 Creating Julius V7 Engine instance...');
    const engine = new JuliusV7Engine();
    
    console.log('📅 Running Julius V7 for Nov 12, 2025...');
    const result = await engine.runAnalytics({
      dateRange: { startDate: '2025-11-12', endDate: '2025-11-12' },
      platforms: ['meta', 'google', 'shopify'],
      options: { fetchFromDatabase: true }
    });
    
    console.log('✅ Julius V7 complete. Result:', {
      success: result.success,
      csvFiles: result.csvFiles ? Object.keys(result.csvFiles) : 'none',
      fileSizes: result.csvFiles ? Object.entries(result.csvFiles).map(([key, file]) => `${key}: ${file.data?.length || 0} bytes`) : 'none'
    });
    
    // Save outputs for comparison
    if (result.csvFiles) {
      const outputDir = './outputs';
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      
      for (const [type, file] of Object.entries(result.csvFiles)) {
        const filename = `${outputDir}/${type}_2025-11-12_julius.csv`;
        fs.writeFileSync(filename, file.data);
        console.log(`💾 Saved ${filename} (${file.data.length} bytes)`);
      }
    }
    
    console.log('🔍 Current files in outputs directory:');
    fs.readdirSync('./outputs').forEach(file => {
      if (file.includes('2025-11-12')) {
        const stats = fs.statSync(`./outputs/${file}`);
        console.log(`  ${file}: ${stats.size} bytes`);
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error running Julius V7:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Run if called directly
if (require.main === module) {
  runNov12GapAnalysis();
}

module.exports = { runNov12GapAnalysis };