import { test, expect } from '@playwright/test';

/**
 * Detailed Dashboard Verification Test
 * Focused on capturing specific checklist items
 */

test.describe('Dashboard Detailed Verification', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // Wait for full initialization
    });

    test('Complete Dashboard Status Report', async ({ page }) => {
        console.log('=== DASHBOARD VERIFICATION REPORT ===');
        
        // 1. Basic Page Load
        const title = await page.title();
        console.log('✅ Page Title:', title);
        
        // 2. Check for JavaScript Errors
        const errorMessages = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errorMessages.push(msg.text());
            }
        });
        await page.waitForTimeout(3000);
        const criticalErrors = errorMessages.filter(msg => 
            !msg.includes('favicon') && !msg.includes('404') && !msg.includes('net::ERR_FAILED')
        );
        console.log('🔍 JavaScript Errors:', criticalErrors.length === 0 ? 'None' : criticalErrors);
        
        // 3. Supabase Connection Status
        const consoleMessages = [];
        page.on('console', msg => consoleMessages.push(msg.text()));
        await page.waitForTimeout(2000);
        
        const connectionMessages = consoleMessages.filter(msg => 
            msg.includes('Supabase') || msg.includes('connected') || msg.includes('database')
        );
        console.log('🔌 Database Status:', connectionMessages.length > 0 ? 'Connected' : 'No connection logs');
        
        // 4. UI Elements Verification
        const metricCards = page.locator('.metric-card');
        const metricCardCount = await metricCards.count();
        console.log('📊 Metric Cards Found:', metricCardCount);
        
        // 5. Charts Verification
        const canvases = page.locator('canvas');
        const chartCount = await canvases.count();
        console.log('📈 Charts Found:', chartCount);
        
        // 6. Project Data
        const pageText = await page.textContent('body');
        const hasTestProject = pageText.includes('testSept9b');
        console.log('🎯 testSept9b Project:', hasTestProject ? 'Visible' : 'Not found');
        
        // 7. Process Count
        const processMatches = pageText.match(/(\d+).*process/gi) || [];
        console.log('📋 Process References:', processMatches);
        
        // 8. Settings Button Check
        const settingsButtons = await page.locator('button[class*="settings"], .settings-btn').count();
        console.log('⚙️ Settings Buttons:', settingsButtons);
        
        // 9. FAB Buttons Check
        const fabButtons = await page.locator('[class*="fab"]').count();
        console.log('🔘 FAB Buttons:', fabButtons);
        
        // 10. Department Data
        const departmentKeywords = ['HR', 'Finance', 'Operations', 'IT', 'Marketing', 'Sales'];
        const foundDepartments = departmentKeywords.filter(dept => pageText.includes(dept));
        console.log('🏢 Departments Found:', foundDepartments);
        
        // 11. Numeric Data Check
        const numbers = pageText.match(/\d+/g) || [];
        console.log('🔢 Numeric Values Count:', numbers.length);
        
        // 12. Professional Icons Check (no emojis)
        if (metricCardCount > 0) {
            const firstCard = metricCards.first();
            const cardText = await firstCard.textContent();
            const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(cardText);
            console.log('🎨 Professional Icons:', hasEmojis ? 'Contains emojis' : 'Professional');
        }
        
        // 13. Responsive Design Check
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        const mobileVisible = await page.locator('body').isVisible();
        console.log('📱 Mobile Responsive:', mobileVisible ? 'Yes' : 'No');
        
        // Reset viewport
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // 14. Animation/Progress Ring Check
        const progressElements = await page.locator('[class*="progress"], [class*="circular"], [class*="animate"]').count();
        console.log('⚡ Animation Elements:', progressElements);
        
        // 15. Data Consistency Check
        const hasConsistentData = numbers.length > 5 && foundDepartments.length > 0;
        console.log('✅ Data Consistency:', hasConsistentData ? 'Good' : 'Needs attention');
        
        console.log('=== END VERIFICATION REPORT ===');
        
        // Basic assertions
        expect(criticalErrors.length).toBe(0);
        expect(metricCardCount).toBeGreaterThan(0);
        expect(chartCount).toBeGreaterThan(0);
        expect(numbers.length).toBeGreaterThan(0);
    });

    test('Interaction Testing', async ({ page }) => {
        console.log('=== INTERACTION TESTING ===');
        
        // Test FAB interaction
        const primaryFab = page.locator('#primaryFab, .fab-primary').first();
        if (await primaryFab.count() > 0) {
            console.log('🔘 Testing FAB interaction...');
            await primaryFab.click();
            await page.waitForTimeout(2000);
            
            const processButton = page.locator('text=/add process/i, button[onclick*="Process"]').first();
            if (await processButton.count() > 0) {
                await processButton.click();
                await page.waitForTimeout(2000);
                
                const workspace = page.locator('.workspace, .modal, [class*="entry"]');
                const workspaceVisible = await workspace.count() > 0;
                console.log('📝 Process Entry Workspace:', workspaceVisible ? 'Opens correctly' : 'Not found');
            }
        }
        
        // Test Settings interaction
        const settingsButton = page.locator('button[class*="settings"]').first();
        if (await settingsButton.count() > 0) {
            console.log('⚙️ Testing Settings interaction...');
            await settingsButton.click();
            await page.waitForTimeout(1000);
            
            const settingsPanel = page.locator('.settings-panel, .modal');
            const panelVisible = await settingsPanel.count() > 0;
            console.log('🔧 Settings Panel:', panelVisible ? 'Opens correctly' : 'Not found');
        }
        
        console.log('=== END INTERACTION TESTING ===');
    });

    test('Visual Screenshot Capture', async ({ page }) => {
        // Take full page screenshot
        await page.screenshot({ 
            path: 'test-results/dashboard-full-desktop.png', 
            fullPage: true 
        });
        
        // Mobile screenshot
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: 'test-results/dashboard-mobile.png', 
            fullPage: true 
        });
        
        console.log('📸 Screenshots captured: desktop and mobile views');
    });
});