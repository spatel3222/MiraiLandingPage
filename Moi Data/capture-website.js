const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureWebsite() {
  console.log('Starting website capture...');
  
  // Create output directory
  const outputDir = path.join(__dirname, '01_Original_Data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Launch browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('Navigating to vibewithmoi.com...');
    
    // Navigate to the website
    try {
      await page.goto('https://vibewithmoi.com', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait a bit for any animations or dynamic content
      await page.waitForTimeout(3000);
      
      // Capture full page screenshot
      console.log('Capturing full page screenshot...');
      await page.screenshot({
        path: path.join(outputDir, 'vibewithmoi-homepage-full.png'),
        fullPage: true,
        type: 'png'
      });
      
      // Capture viewport screenshot
      console.log('Capturing viewport screenshot...');
      await page.screenshot({
        path: path.join(outputDir, 'vibewithmoi-homepage-viewport.png'),
        fullPage: false,
        type: 'png'
      });
      
      // Get basic page info
      const title = await page.title();
      const url = page.url();
      
      console.log(`Successfully captured: ${title}`);
      console.log(`URL: ${url}`);
      
      // Try to extract some basic styling information
      console.log('Extracting CSS and design information...');
      
      const pageInfo = await page.evaluate(() => {
        // Get computed styles for body and main elements
        const body = document.body;
        const bodyStyles = window.getComputedStyle(body);
        
        // Get all stylesheets
        const stylesheets = Array.from(document.styleSheets);
        
        // Get color information from CSS variables if available
        const rootStyles = window.getComputedStyle(document.documentElement);
        
        // Extract text elements for typography analysis
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName.toLowerCase(),
          text: h.textContent.trim().substring(0, 100),
          styles: {
            fontFamily: window.getComputedStyle(h).fontFamily,
            fontSize: window.getComputedStyle(h).fontSize,
            fontWeight: window.getComputedStyle(h).fontWeight,
            color: window.getComputedStyle(h).color,
            lineHeight: window.getComputedStyle(h).lineHeight
          }
        }));
        
        // Get main content containers
        const containers = Array.from(document.querySelectorAll('main, .main, #main, .container, .content')).map(el => ({
          selector: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').join('.') : '') + (el.id ? '#' + el.id : ''),
          styles: {
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            color: window.getComputedStyle(el).color,
            padding: window.getComputedStyle(el).padding,
            margin: window.getComputedStyle(el).margin,
            maxWidth: window.getComputedStyle(el).maxWidth
          }
        }));
        
        return {
          title: document.title,
          bodyStyles: {
            fontFamily: bodyStyles.fontFamily,
            fontSize: bodyStyles.fontSize,
            lineHeight: bodyStyles.lineHeight,
            color: bodyStyles.color,
            backgroundColor: bodyStyles.backgroundColor
          },
          headings: headings,
          containers: containers,
          stylesheetCount: stylesheets.length
        };
      });
      
      // Save the extracted information
      fs.writeFileSync(
        path.join(outputDir, 'page-analysis.json'),
        JSON.stringify(pageInfo, null, 2)
      );
      
      console.log('Page analysis saved to page-analysis.json');
      
    } catch (error) {
      console.error('Error accessing vibewithmoi.com:', error.message);
      
      // Try alternative approach - maybe it's redirecting or has different URL structure
      console.log('Trying alternative URLs...');
      
      const alternativeUrls = [
        'https://www.vibewithmoi.com',
        'http://vibewithmoi.com',
        'http://www.vibewithmoi.com'
      ];
      
      for (const altUrl of alternativeUrls) {
        try {
          console.log(`Trying ${altUrl}...`);
          await page.goto(altUrl, { 
            waitUntil: 'networkidle',
            timeout: 15000 
          });
          
          await page.waitForTimeout(2000);
          
          await page.screenshot({
            path: path.join(outputDir, 'vibewithmoi-homepage-full.png'),
            fullPage: true,
            type: 'png'
          });
          
          await page.screenshot({
            path: path.join(outputDir, 'vibewithmoi-homepage-viewport.png'),
            fullPage: false,
            type: 'png'
          });
          
          const title = await page.title();
          console.log(`Successfully captured from ${altUrl}: ${title}`);
          break;
          
        } catch (altError) {
          console.log(`Failed to access ${altUrl}: ${altError.message}`);
          continue;
        }
      }
    }
    
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the capture
captureWebsite().catch(console.error);