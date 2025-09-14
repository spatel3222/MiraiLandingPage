import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Business Automation Dashboard UI Analysis', () => {
  const screenshotDir = path.join(__dirname, '../../ui-analysis-screenshots');
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/workshops/business-automation-dashboard.html');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to render
    await page.waitForTimeout(3000);
  });

  test('Full Page Desktop Screenshot Analysis', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/01-full-page-desktop.png`,
      fullPage: true,
      animations: 'disabled'
    });
    
    // Log page title and basic info
    const title = await page.title();
    console.log(`Dashboard Title: ${title}`);
    
    // Check for overlapping elements by looking at computed styles
    const overlappingElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check for elements with absolute/fixed positioning that might overlap
        if (style.position === 'absolute' || style.position === 'fixed') {
          issues.push({
            element: el.tagName + (el.className ? '.' + el.className.replace(/\s+/g, '.') : ''),
            position: style.position,
            top: style.top,
            left: style.left,
            zIndex: style.zIndex,
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            }
          });
        }
        
        // Check for text overflow
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
          if (el.textContent && el.textContent.trim().length > 0) {
            issues.push({
              type: 'overflow',
              element: el.tagName + (el.className ? '.' + el.className.replace(/\s+/g, '.') : ''),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              textContent: el.textContent.substring(0, 100) + '...'
            });
          }
        }
      });
      
      return issues;
    });
    
    console.log('Potential UI Issues Found:', JSON.stringify(overlappingElements, null, 2));
  });

  test('Header and Key Metrics Row Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Screenshot of header section
    const header = page.locator('header');
    await header.screenshot({ 
      path: `${screenshotDir}/02-header-section.png`,
      animations: 'disabled'
    });
    
    // Look for key metrics row (should be first row after header)
    const keyMetricsSection = page.locator('.dashboard-content').first();
    if (await keyMetricsSection.isVisible()) {
      await keyMetricsSection.screenshot({ 
        path: `${screenshotDir}/03-key-metrics-row.png`,
        animations: 'disabled'
      });
    }
    
    // Analyze the structure
    const headerStructure = await page.evaluate(() => {
      const header = document.querySelector('header');
      const content = document.querySelector('.dashboard-content, main, .content');
      
      return {
        headerHeight: header ? header.getBoundingClientRect().height : 0,
        contentStart: content ? content.getBoundingClientRect().top : 0,
        headerElements: header ? Array.from(header.children).map(child => ({
          tag: child.tagName,
          class: child.className,
          text: child.textContent?.substring(0, 50) + '...'
        })) : []
      };
    });
    
    console.log('Header Structure Analysis:', JSON.stringify(headerStructure, null, 2));
  });

  test('Business KPIs and Priority Matrix Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Look for KPI sections
    const kpiSections = page.locator('[class*="kpi"], [class*="metric"], [class*="score"], .stat-card, .metric-card');
    const kpiCount = await kpiSections.count();
    
    console.log(`Found ${kpiCount} potential KPI sections`);
    
    if (kpiCount > 0) {
      // Screenshot first few KPI sections
      for (let i = 0; i < Math.min(kpiCount, 5); i++) {
        await kpiSections.nth(i).screenshot({ 
          path: `${screenshotDir}/04-kpi-section-${i + 1}.png`,
          animations: 'disabled'
        });
      }
    }
    
    // Look for priority matrix
    const priorityMatrix = page.locator('[class*="matrix"], [class*="priority"], [class*="quadrant"]');
    const matrixCount = await priorityMatrix.count();
    
    if (matrixCount > 0) {
      await priorityMatrix.first().screenshot({ 
        path: `${screenshotDir}/05-priority-matrix.png`,
        animations: 'disabled'
      });
    }
    
    // Analyze layout structure
    const layoutAnalysis = await page.evaluate(() => {
      const main = document.querySelector('main, .dashboard-content, .content, body > .container');
      if (!main) return { error: 'Main content container not found' };
      
      const children = Array.from(main.children);
      const sections = children.map((child, index) => {
        const rect = child.getBoundingClientRect();
        const style = window.getComputedStyle(child);
        
        return {
          index,
          tag: child.tagName,
          className: child.className,
          height: rect.height,
          width: rect.width,
          position: {
            top: rect.top,
            left: rect.left
          },
          display: style.display,
          flexDirection: style.flexDirection,
          gridTemplate: style.gridTemplateColumns || style.gridTemplateRows || 'none',
          textContent: child.textContent?.substring(0, 100) + '...'
        };
      });
      
      return { sections };
    });
    
    console.log('Layout Structure Analysis:', JSON.stringify(layoutAnalysis, null, 2));
  });

  test('Mobile Responsive Analysis', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 12 size
    await page.waitForTimeout(1000); // Wait for responsive adjustments
    
    await page.screenshot({ 
      path: `${screenshotDir}/06-mobile-portrait.png`,
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: `${screenshotDir}/07-tablet-view.png`,
      fullPage: true,
      animations: 'disabled'
    });
    
    // Analyze responsive issues
    const responsiveIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues = [];
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check for horizontal overflow on mobile
        if (rect.width > window.innerWidth) {
          issues.push({
            type: 'horizontal-overflow',
            element: el.tagName + (el.className ? '.' + el.className.replace(/\s+/g, '.') : ''),
            elementWidth: rect.width,
            viewportWidth: window.innerWidth
          });
        }
        
        // Check for fixed widths that might cause issues
        if (style.width && style.width.includes('px') && !style.width.includes('%')) {
          const widthValue = parseInt(style.width);
          if (widthValue > window.innerWidth * 0.9) {
            issues.push({
              type: 'fixed-width-too-large',
              element: el.tagName + (el.className ? '.' + el.className.replace(/\s+/g, '.') : ''),
              fixedWidth: style.width,
              viewportWidth: window.innerWidth
            });
          }
        }
      });
      
      return issues;
    });
    
    console.log('Responsive Issues Found:', JSON.stringify(responsiveIssues, null, 2));
  });

  test('Text Positioning and Overlap Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Find text elements that might be overlapping
    const textOverlapAnalysis = await page.evaluate(() => {
      const textElements = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const parent = node.parentElement;
        if (parent && node.textContent.trim()) {
          const rect = parent.getBoundingClientRect();
          const style = window.getComputedStyle(parent);
          
          textElements.push({
            text: node.textContent.trim().substring(0, 50),
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              bottom: rect.bottom,
              right: rect.right
            },
            position: style.position,
            zIndex: style.zIndex,
            parent: parent.tagName + (parent.className ? '.' + parent.className.replace(/\s+/g, '.') : '')
          });
        }
      }
      
      // Find overlapping text elements
      const overlaps = [];
      for (let i = 0; i < textElements.length; i++) {
        for (let j = i + 1; j < textElements.length; j++) {
          const a = textElements[i].rect;
          const b = textElements[j].rect;
          
          // Check for overlap
          if (a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom) {
            overlaps.push({
              element1: textElements[i],
              element2: textElements[j],
              overlapArea: {
                x: Math.max(a.x, b.x),
                y: Math.max(a.y, b.y),
                width: Math.min(a.right, b.right) - Math.max(a.x, b.x),
                height: Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y)
              }
            });
          }
        }
      }
      
      return { overlaps, totalTextElements: textElements.length };
    });
    
    console.log('Text Overlap Analysis:', JSON.stringify(textOverlapAnalysis, null, 2));
    
    // Take screenshot highlighting text areas
    await page.addStyleTag({
      content: `
        * {
          outline: 1px solid rgba(255, 0, 0, 0.3) !important;
        }
        *:hover {
          outline: 2px solid red !important;
        }
      `
    });
    
    await page.screenshot({ 
      path: `${screenshotDir}/08-text-elements-highlighted.png`,
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Design Quality and Modernization Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Analyze design elements that look AI-generated or basic
    const designAnalysis = await page.evaluate(() => {
      const analysis = {
        colorScheme: [],
        typography: [],
        spacing: [],
        shadows: [],
        borderRadius: [],
        layout: []
      };
      
      // Analyze color usage
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      const fontSet = new Set();
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        // Collect colors
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(style.backgroundColor);
        }
        if (style.color) {
          colorSet.add(style.color);
        }
        
        // Collect fonts
        if (style.fontFamily) {
          fontSet.add(style.fontFamily);
        }
        
        // Check for basic/generic styling patterns
        if (style.boxShadow && style.boxShadow !== 'none') {
          analysis.shadows.push({
            element: el.tagName + (el.className ? '.' + el.className : ''),
            shadow: style.boxShadow
          });
        }
        
        if (style.borderRadius && style.borderRadius !== '0px') {
          analysis.borderRadius.push({
            element: el.tagName + (el.className ? '.' + el.className : ''),
            radius: style.borderRadius
          });
        }
      });
      
      analysis.colorScheme = Array.from(colorSet).slice(0, 20);
      analysis.typography = Array.from(fontSet);
      
      return analysis;
    });
    
    console.log('Design Quality Analysis:', JSON.stringify(designAnalysis, null, 2));
    
    // Take a final comprehensive screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/09-final-comprehensive-view.png`,
      fullPage: true,
      animations: 'disabled'
    });
  });
});