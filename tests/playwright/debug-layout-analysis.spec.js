import { test, expect } from '@playwright/test';

/**
 * SPECIFIC DEBUG LAYOUT ANALYSIS
 * 
 * This test specifically investigates the debug message layout issues
 * that are causing the extremely long page scroll
 */

test.describe('Debug Layout Issues Analysis', () => {
    
    test('Analyze debug message overflow and layout issues', async ({ page }) => {
        console.log('\n🔍 ANALYZING DEBUG MESSAGE LAYOUT ISSUES...\n');
        
        // Navigate to dashboard
        await page.goto('/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: `test-results/debug-analysis-full-page.png`,
            fullPage: true 
        });
        
        // Get page dimensions
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        
        console.log(`📏 Page height: ${pageHeight}px`);
        console.log(`📏 Viewport height: ${viewportHeight}px`);
        console.log(`📏 Page is ${Math.round(pageHeight / viewportHeight)}x longer than viewport`);
        
        // Count debug messages
        const debugMessages = await page.locator('.debug-message').count();
        const debugTexts = await page.locator('.debug-text').count();
        const debugTimestamps = await page.locator('.debug-timestamp').count();
        
        console.log(`🐛 Debug messages: ${debugMessages}`);
        console.log(`🐛 Debug texts: ${debugTexts}`);
        console.log(`🐛 Debug timestamps: ${debugTimestamps}`);
        
        // Check if debug messages are being dynamically added
        await page.waitForTimeout(2000);
        
        const debugMessagesAfterWait = await page.locator('.debug-message').count();
        console.log(`🐛 Debug messages after wait: ${debugMessagesAfterWait}`);
        
        if (debugMessagesAfterWait > debugMessages) {
            console.log(`⚠️ Debug messages are being dynamically added! Increased by ${debugMessagesAfterWait - debugMessages}`);
        }
        
        // Get content of some debug messages
        const firstFewMessages = await page.locator('.debug-message').first().count() > 0 
            ? await page.locator('.debug-message').first().textContent()
            : 'No debug messages found';
        
        console.log(`📝 First debug message content: ${firstFewMessages}`);
        
        // Check for repeating content
        if (debugMessages > 5) {
            const allDebugContent = [];
            for (let i = 0; i < Math.min(debugMessages, 10); i++) {
                const content = await page.locator('.debug-message').nth(i).textContent();
                allDebugContent.push(content);
            }
            
            console.log(`📝 Debug message contents (first 10):`);
            allDebugContent.forEach((content, index) => {
                console.log(`   ${index + 1}: ${content?.substring(0, 100)}...`);
            });
            
            // Check for duplicates
            const uniqueContents = [...new Set(allDebugContent)];
            if (uniqueContents.length < allDebugContent.length) {
                console.log(`⚠️ Found ${allDebugContent.length - uniqueContents.length} duplicate debug messages`);
            }
        }
        
        // Check the debug container dimensions and styling
        const debugContainer = page.locator('.debug-container, .debug-panel').first();
        if (await debugContainer.count() > 0) {
            const containerInfo = await debugContainer.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return {
                    height: rect.height,
                    width: rect.width,
                    display: style.display,
                    position: style.position,
                    overflow: style.overflow,
                    maxHeight: style.maxHeight
                };
            });
            
            console.log(`📦 Debug container info:`, containerInfo);
            
            if (containerInfo.height > viewportHeight * 2) {
                console.log(`⚠️ Debug container is abnormally tall: ${containerInfo.height}px`);
            }
        }
        
        // Check for JavaScript intervals or timeouts that might be adding content
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'log' && msg.text().includes('debug')) {
                consoleLogs.push(msg.text());
            }
        });
        
        await page.waitForTimeout(3000);
        
        if (consoleLogs.length > 0) {
            console.log(`📊 Found ${consoleLogs.length} debug-related console logs:`);
            consoleLogs.forEach((log, index) => {
                console.log(`   ${index + 1}: ${log}`);
            });
        }
        
        // Check specific layout calculations
        const layoutIssues = await page.evaluate(() => {
            const issues = [];
            
            // Check for elements causing horizontal scroll
            const elements = document.querySelectorAll('*');
            elements.forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth + 10) {
                    issues.push({
                        element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                        rightEdge: rect.right,
                        windowWidth: window.innerWidth,
                        overflow: rect.right - window.innerWidth
                    });
                }
                
                // Check for extremely tall elements
                if (rect.height > window.innerHeight * 5) {
                    issues.push({
                        element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                        height: rect.height,
                        windowHeight: window.innerHeight,
                        ratio: rect.height / window.innerHeight
                    });
                }
            });
            
            return issues;
        });
        
        console.log(`\n🚨 LAYOUT ISSUES DETECTED: ${layoutIssues.length}`);
        layoutIssues.forEach((issue, index) => {
            console.log(`   ${index + 1}: ${issue.element}`);
            if (issue.overflow) {
                console.log(`      - Horizontal overflow: ${issue.overflow}px beyond window`);
            }
            if (issue.ratio) {
                console.log(`      - Abnormal height: ${issue.ratio.toFixed(1)}x viewport height`);
            }
        });
        
        // Take targeted screenshots of problem areas
        if (debugMessages > 0) {
            const debugSection = page.locator('.debug-message').first();
            await debugSection.screenshot({ 
                path: `test-results/debug-messages-section.png` 
            });
        }
        
        // Scroll to different parts of the page to capture the full extent
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.screenshot({ 
            path: `test-results/debug-analysis-middle.png` 
        });
        
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.screenshot({ 
            path: `test-results/debug-analysis-bottom.png` 
        });
        
        // Final assessment
        const assessment = {
            totalDebugMessages: debugMessages,
            pageHeightRatio: Math.round(pageHeight / viewportHeight),
            hasLayoutIssues: layoutIssues.length > 0,
            isDynamicallyGrowing: debugMessagesAfterWait > debugMessages,
            consoleLogs: consoleLogs.length
        };
        
        console.log(`\n📋 FINAL ASSESSMENT:`);
        console.log(`   Debug messages: ${assessment.totalDebugMessages}`);
        console.log(`   Page height ratio: ${assessment.pageHeightRatio}x viewport`);
        console.log(`   Layout issues: ${assessment.hasLayoutIssues ? 'YES' : 'NO'}`);
        console.log(`   Dynamically growing: ${assessment.isDynamicallyGrowing ? 'YES' : 'NO'}`);
        console.log(`   Debug console logs: ${assessment.consoleLogs}`);
        
        if (assessment.pageHeightRatio > 10) {
            console.log(`\n🚨 CRITICAL: Page is abnormally tall (${assessment.pageHeightRatio}x viewport height)`);
            console.log(`   This suggests a layout issue or runaway content generation`);
        }
        
        if (assessment.isDynamicallyGrowing) {
            console.log(`\n⚠️ WARNING: Debug content is being added dynamically`);
            console.log(`   Check for JavaScript intervals or event handlers adding debug messages`);
        }
        
        // Always pass - this is analysis
        expect(true).toBeTruthy();
    });
    
    test('Check for JavaScript debug loops or intervals', async ({ page }) => {
        console.log('\n🔄 CHECKING FOR DEBUG LOOPS...\n');
        
        const intervals = [];
        const timeouts = [];
        
        // Override setInterval and setTimeout to track them
        await page.addInitScript(() => {
            const originalSetInterval = window.setInterval;
            const originalSetTimeout = window.setTimeout;
            
            window.debugIntervals = [];
            window.debugTimeouts = [];
            
            window.setInterval = function(fn, delay) {
                const id = originalSetInterval.apply(this, arguments);
                window.debugIntervals.push({ id, delay, fn: fn.toString().substring(0, 100) });
                return id;
            };
            
            window.setTimeout = function(fn, delay) {
                const id = originalSetTimeout.apply(this, arguments);
                window.debugTimeouts.push({ id, delay, fn: fn.toString().substring(0, 100) });
                return id;
            };
        });
        
        await page.goto('/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check what intervals and timeouts were set
        const intervalData = await page.evaluate(() => window.debugIntervals || []);
        const timeoutData = await page.evaluate(() => window.debugTimeouts || []);
        
        console.log(`⏰ Found ${intervalData.length} intervals:`);
        intervalData.forEach((interval, index) => {
            console.log(`   ${index + 1}: Delay ${interval.delay}ms - ${interval.fn}`);
        });
        
        console.log(`⏰ Found ${timeoutData.length} timeouts:`);
        timeoutData.forEach((timeout, index) => {
            console.log(`   ${index + 1}: Delay ${timeout.delay}ms - ${timeout.fn}`);
        });
        
        // Check for rapid intervals that might cause issues
        const rapidIntervals = intervalData.filter(i => i.delay < 1000);
        if (rapidIntervals.length > 0) {
            console.log(`\n⚠️ Found ${rapidIntervals.length} rapid intervals (< 1s) that could cause performance issues`);
        }
        
        expect(true).toBeTruthy();
    });
});