const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

async function uploadTestData() {
  const baseUrl = 'http://localhost:3001';
  
  const files = [
    {
      filename: 'Meta_Ads_10th Nov.csv',
      platform: 'meta'
    },
    {
      filename: 'Google_Ads_10th Nov.csv', 
      platform: 'google'
    },
    {
      filename: 'shopify_10th Nov.csv',
      platform: 'shopify'
    }
  ];

  for (const fileInfo of files) {
    const filePath = path.join(__dirname, 'sample_data', fileInfo.filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }

    console.log(`📤 Uploading ${fileInfo.filename} for ${fileInfo.platform}...`);
    
    try {
      const formData = new FormData();
      formData.append('files', fs.createReadStream(filePath));
      formData.append('platform', fileInfo.platform);

      const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${fileInfo.platform}: ${result.results?.[0]?.rowCount || 0} rows uploaded`);
      } else {
        const error = await response.text();
        console.log(`❌ ${fileInfo.platform} upload failed:`, error);
      }
    } catch (error) {
      console.log(`❌ Error uploading ${fileInfo.platform}:`, error.message);
    }
    
    // Wait between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Test data upload completed!');
}

uploadTestData().catch(console.error);