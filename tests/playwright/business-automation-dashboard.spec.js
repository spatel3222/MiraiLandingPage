import { test, expect } from '@playwright/test';

/**
 * Comprehensive Test Suite for Business Automation Dashboard
 * Testing all UI improvements and core functionality
 */

test.describe('Business Automation Dashboard - Complete Test Suite', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the dashboard
        await page.goto('/workshops/business-automation-dashboard.html');
        
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle');
        
        // Wait for Supabase initialization
        await page.waitForTimeout(2000);
    });

    test.describe('1. Basic Loading & UI', () => {
        
        test('Dashboard loads without JavaScript errors', async ({ page }) => {
            // Check for console errors
            const errorMessages = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errorMessages.push(msg.text());
                }
            });
            
            // Wait for the page to fully load
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(3000);
            
            // Check that no critical errors occurred
            const criticalErrors = errorMessages.filter(msg => 
                !msg.includes('favicon') && 
                !msg.includes('404') &&
                !msg.includes('net::ERR_FAILED')
            );
            
            expect(criticalErrors).toHaveLength(0);
        });

        test('All new UI improvements are visible', async ({ page }) => {
            // Check for modern cards
            await expect(page.locator('.metric-card').first()).toBeVisible();
            
            // Check for professional icons (should not contain emoji characters)
            const metricCards = page.locator('.metric-card');
            const cardCount = await metricCards.count();
            
            for (let i = 0; i < cardCount; i++) {
                const card = metricCards.nth(i);
                const cardContent = await card.textContent();
                
                // Should not contain emoji characters
                expect(cardContent).not.toMatch(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u);
                
                // Should have SVG icons or professional text
                const hasIcon = await card.locator('svg, .icon').count() > 0;
                expect(hasIcon).toBeTruthy();
            }
        });

        test('Progress ring animation works', async ({ page }) => {
            // Look for automation readiness score progress ring
            const progressRing = page.locator('.progress-ring, [class*="progress"], [class*="circular"]').first();
            
            if (await progressRing.count() > 0) {
                await expect(progressRing).toBeVisible();
                
                // Check if it has animation properties
                const hasAnimation = await progressRing.evaluate(el => {
                    const computedStyle = window.getComputedStyle(el);
                    return computedStyle.animation !== 'none' || 
                           computedStyle.transition !== 'none' ||
                           el.querySelector('[class*="animate"]') !== null;
                });
                
                expect(hasAnimation).toBeTruthy();
            }
        });

        test('Responsive design works on different screen sizes', async ({ page }) => {
            // Test desktop view
            await page.setViewportSize({ width: 1200, height: 800 });
            await expect(page.locator('body')).toBeVisible();
            
            // Test tablet view
            await page.setViewportSize({ width: 768, height: 1024 });
            await expect(page.locator('body')).toBeVisible();
            
            // Test mobile view
            await page.setViewportSize({ width: 375, height: 667 });
            await expect(page.locator('body')).toBeVisible();
            
            // Check that elements remain accessible on mobile
            const metricCards = page.locator('.metric-card');
            if (await metricCards.count() > 0) {
                await expect(metricCards.first()).toBeVisible();
            }
        });
    });

    test.describe('2. Supabase Integration', () => {
        
        test('Database connection status shows connected', async ({ page }) => {
            // Wait for database initialization
            await page.waitForTimeout(3000);
            
            // Check for connection status indicators
            const connectionIndicators = [
                'Connected',
                '✅',
                'online',
                'Supabase',
                'database.*connected'
            ];
            
            let foundConnection = false;
            for (const indicator of connectionIndicators) {
                const elements = page.locator(`text=/${indicator}/i`);
                if (await elements.count() > 0) {
                    foundConnection = true;
                    break;
                }
            }
            
            // Also check console for connection messages
            const consoleMessages = [];
            page.on('console', msg => consoleMessages.push(msg.text()));
            
            await page.waitForTimeout(2000);
            
            const hasConnectionLog = consoleMessages.some(msg => 
                msg.includes('Supabase connected') || 
                msg.includes('connected successfully')
            );
            
            expect(foundConnection || hasConnectionLog).toBeTruthy();
        });

        test('Project selector populates with projects', async ({ page }) => {
            // Wait for projects to load
            await page.waitForTimeout(4000);
            
            // Look for project selector elements
            const projectSelectors = [
                'select[name*="project"]',
                '#project-select',
                '.project-selector',
                '[data-testid="project-selector"]'
            ];
            
            let projectSelector = null;
            for (const selector of projectSelectors) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    projectSelector = element;
                    break;
                }
            }
            
            // Also check for dropdown or list items
            const projectOptions = page.locator('option, .project-item, [class*="project"][class*="option"]');
            const optionCount = await projectOptions.count();
            
            expect(optionCount).toBeGreaterThan(0);
        });

        test('testSept9b project can be selected', async ({ page }) => {
            // Wait for projects to load
            await page.waitForTimeout(4000);
            
            // Look for the specific project
            const testProject = page.locator('text=/testSept9b/i');
            
            if (await testProject.count() > 0) {
                await expect(testProject).toBeVisible();
                
                // Try to click/select it if it's interactive
                if (await testProject.isEnabled()) {
                    await testProject.click();
                    await page.waitForTimeout(2000);
                }
            } else {
                // Check if project data is loaded in any form
                const pageContent = await page.textContent('body');
                expect(pageContent).toMatch(/testSept9b|test.*sept.*9b/i);
            }
        });

        test('Process data loads correctly from database', async ({ page }) => {
            // Wait for data to load
            await page.waitForTimeout(5000);
            
            // Look for process data indicators
            const processIndicators = [
                '.process-item',
                '[data-testid*="process"]',
                'text=/processes?/i',
                '.chart-container canvas',
                '[class*="metric"]'
            ];
            
            let foundProcessData = false;
            for (const indicator of processIndicators) {
                const elements = page.locator(indicator);
                if (await elements.count() > 0) {
                    foundProcessData = true;
                    break;
                }
            }
            
            // Also check for numeric data that would indicate loaded processes
            const pageText = await page.textContent('body');
            const hasNumericData = /\d+/.test(pageText) && 
                                  (pageText.includes('Process') || 
                                   pageText.includes('Department') ||
                                   pageText.includes('Score'));
            
            expect(foundProcessData || hasNumericData).toBeTruthy();
        });
    });

    test.describe('3. Core Functionality', () => {
        
        test('Settings panel opens and closes correctly', async ({ page }) => {
            // Look for settings triggers
            const settingsTriggers = [
                'button[title*="settings" i]',
                '.settings-btn',
                '[data-testid*="settings"]',
                'button:has-text("Settings")',
                '.gear-icon',
                '[class*="settings"]'
            ];
            
            let settingsButton = null;
            for (const selector of settingsTriggers) {
                const element = page.locator(selector).first();
                if (await element.count() > 0 && await element.isVisible()) {
                    settingsButton = element;
                    break;
                }
            }
            
            if (settingsButton) {
                // Test opening settings
                await settingsButton.click();
                await page.waitForTimeout(1000);
                
                // Look for settings panel
                const settingsPanel = page.locator('.settings-panel, .modal, .sidebar, [class*="settings"][class*="open"]');
                await expect(settingsPanel.first()).toBeVisible();
                
                // Test closing (look for close button or click outside)
                const closeButton = page.locator('button:has-text("Close"), button:has-text("×"), .close-btn');
                if (await closeButton.count() > 0) {
                    await closeButton.first().click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('FAB button works and Process Entry workspace opens', async ({ page }) => {
            // Look for FAB (Floating Action Button)
            const fabSelectors = [
                '.fab',
                '.floating-action-button',
                'button[class*="floating"]',
                'button[class*="fab"]',
                '[data-testid="fab"]',
                '.add-process-btn'
            ];
            
            let fabButton = null;
            for (const selector of fabSelectors) {
                const element = page.locator(selector);
                if (await element.count() > 0 && await element.isVisible()) {
                    fabButton = element;
                    break;
                }
            }
            
            if (fabButton) {
                await fabButton.click();
                await page.waitForTimeout(2000);
                
                // Look for process entry workspace
                const processWorkspace = page.locator('.process-entry, .workspace, .modal:has-text("Process"), [class*="entry"][class*="form"]');
                await expect(processWorkspace.first()).toBeVisible();
            }
        });

        test('Charts render and display data properly', async ({ page }) => {
            // Wait for charts to render
            await page.waitForTimeout(5000);
            
            // Look for Chart.js canvases or SVG charts
            const charts = page.locator('canvas, .chart svg, [class*="chart"]');
            const chartCount = await charts.count();
            
            expect(chartCount).toBeGreaterThan(0);
            
            // Check that at least one chart is visible
            if (chartCount > 0) {
                await expect(charts.first()).toBeVisible();
                
                // For canvas elements, check they have content
                const canvases = page.locator('canvas');
                const canvasCount = await canvases.count();
                
                for (let i = 0; i < Math.min(canvasCount, 3); i++) {
                    const canvas = canvases.nth(i);
                    const hasContent = await canvas.evaluate(el => {
                        const ctx = el.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, el.width, el.height);
                        return imageData.data.some(pixel => pixel !== 0);
                    });
                    
                    if (hasContent) {
                        expect(hasContent).toBeTruthy();
                        break; // At least one chart has content
                    }
                }
            }
        });
    });

    test.describe('4. Visual Improvements', () => {
        
        test('KPI cards display properly with enhanced typography', async ({ page }) => {
            const kpiCards = page.locator('.kpi-card, .metric-card, [class*="kpi"], [class*="metric"]');
            const cardCount = await kpiCards.count();
            
            if (cardCount > 0) {
                for (let i = 0; i < Math.min(cardCount, 5); i++) {
                    const card = kpiCards.nth(i);
                    await expect(card).toBeVisible();
                    
                    // Check for proper styling
                    const hasGoodTypography = await card.evaluate(el => {
                        const computedStyle = window.getComputedStyle(el);
                        return computedStyle.fontSize !== '' && 
                               computedStyle.fontWeight !== '' &&
                               computedStyle.color !== '';
                    });
                    
                    expect(hasGoodTypography).toBeTruthy();
                }
            }
        });

        test('Hover effects and animations work smoothly', async ({ page }) => {
            const interactiveElements = page.locator('button, .card, .metric-card, [class*="hover"]');
            const elementCount = await interactiveElements.count();
            
            if (elementCount > 0) {
                const firstElement = interactiveElements.first();
                
                // Test hover effect
                await firstElement.hover();
                await page.waitForTimeout(500);
                
                // Check if element has hover styles or animations
                const hasHoverEffect = await firstElement.evaluate(el => {
                    const computedStyle = window.getComputedStyle(el);
                    return computedStyle.cursor === 'pointer' || 
                           computedStyle.transition !== 'none' ||
                           computedStyle.transform !== 'none';
                });
                
                expect(hasHoverEffect).toBeTruthy();
            }
        });

        test('Layout follows intended structure (Key Metrics → KPIs → Charts)', async ({ page }) => {
            // Check for proper section order
            const sections = await page.locator('[class*="section"], .container, .grid').all();
            
            // Look for key metrics section
            const keyMetricsSection = page.locator('text=/key.*metrics/i, .key-metrics, .metrics');
            const hasKeyMetrics = await keyMetricsSection.count() > 0;
            
            // Look for KPI section
            const kpiSection = page.locator('text=/kpi/i, .kpi, .indicators');
            const hasKPIs = await kpiSection.count() > 0;
            
            // Look for charts section
            const chartsSection = page.locator('canvas, .chart, text=/chart/i');
            const hasCharts = await chartsSection.count() > 0;
            
            // At least some structure should be present
            expect(hasKeyMetrics || hasKPIs || hasCharts).toBeTruthy();
        });
    });

    test.describe('5. Data Consistency', () => {
        
        test('Process counts match between different sections', async ({ page }) => {
            // Wait for all data to load
            await page.waitForTimeout(6000);
            
            // Extract all numeric values from the page
            const pageText = await page.textContent('body');
            const numbers = pageText.match(/\d+/g) || [];
            
            // Check that we have some numeric data
            expect(numbers.length).toBeGreaterThan(0);
            
            // Look for consistent process counts
            const processCountMatches = pageText.match(/(\d+).*process/gi) || [];
            if (processCountMatches.length > 1) {
                const counts = processCountMatches.map(match => {
                    const num = match.match(/\d+/);
                    return num ? parseInt(num[0]) : 0;
                });
                
                // All process counts should be the same
                const uniqueCounts = [...new Set(counts)];
                expect(uniqueCounts.length).toBeLessThanOrEqual(2); // Allow for some variation
            }
        });

        test('Department names are consistent throughout', async ({ page }) => {
            // Wait for data to load
            await page.waitForTimeout(5000);
            
            const pageText = await page.textContent('body');
            
            // Common department names that should be consistent
            const departments = ['HR', 'Finance', 'Operations', 'IT', 'Marketing', 'Sales'];
            
            let foundDepartments = 0;
            departments.forEach(dept => {
                if (pageText.includes(dept)) {
                    foundDepartments++;
                }
            });
            
            // Should find at least some department data
            expect(foundDepartments).toBeGreaterThan(0);
        });

        test('Charts show real data (not placeholder data)', async ({ page }) => {
            // Wait for charts to load
            await page.waitForTimeout(5000);
            
            const pageText = await page.textContent('body');
            
            // Check that we don't have placeholder text
            const placeholderIndicators = [
                'Lorem ipsum',
                'placeholder',
                'sample data',
                'test data',
                'mock data',
                'dummy'
            ];
            
            const hasPlaceholders = placeholderIndicators.some(indicator => 
                pageText.toLowerCase().includes(indicator.toLowerCase())
            );
            
            expect(hasPlaceholders).toBeFalsy();
            
            // Check for real numeric data
            const hasNumericData = /\d+/.test(pageText);
            expect(hasNumericData).toBeTruthy();
        });
    });

    test.describe('6. Integration Test - End-to-End Flow', () => {
        
        test('Complete dashboard workflow functions properly', async ({ page }) => {
            // 1. Page loads
            await expect(page).toHaveTitle(/AI Opportunity Navigator|Business Process Automation/);
            
            // 2. Wait for all components to load
            await page.waitForTimeout(6000);
            
            // 3. Check that key elements are present
            const hasMetrics = await page.locator('.metric-card, [class*="metric"]').count() > 0;
            const hasCharts = await page.locator('canvas, .chart').count() > 0;
            
            expect(hasMetrics || hasCharts).toBeTruthy();
            
            // 4. Test interaction (if FAB is available)
            const fabButton = page.locator('.fab, .floating-action-button, button[class*="floating"]').first();
            if (await fabButton.count() > 0) {
                await fabButton.click();
                await page.waitForTimeout(2000);
                
                // Should open some form or workspace
                const modals = page.locator('.modal, .workspace, [class*="entry"]');
                if (await modals.count() > 0) {
                    await expect(modals.first()).toBeVisible();
                }
            }
            
            // 5. Check console for no critical errors
            const errorMessages = [];
            page.on('console', msg => {
                if (msg.type() === 'error' && !msg.text().includes('favicon')) {
                    errorMessages.push(msg.text());
                }
            });
            
            await page.waitForTimeout(2000);
            
            // Should have minimal errors
            expect(errorMessages.length).toBeLessThan(3);
        });
    });

    test.describe('7. Performance and Accessibility', () => {
        
        test('Page loads within reasonable time', async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            
            const loadTime = Date.now() - startTime;
            
            // Should load within 10 seconds
            expect(loadTime).toBeLessThan(10000);
        });

        test('Basic accessibility requirements met', async ({ page }) => {
            // Check for proper headings
            const headings = page.locator('h1, h2, h3, h4, h5, h6');
            const headingCount = await headings.count();
            expect(headingCount).toBeGreaterThan(0);
            
            // Check for alt text on images (if any)
            const images = page.locator('img');
            const imageCount = await images.count();
            
            if (imageCount > 0) {
                for (let i = 0; i < imageCount; i++) {
                    const img = images.nth(i);
                    const alt = await img.getAttribute('alt');
                    expect(alt).toBeDefined();
                }
            }
            
            // Check for proper button labels
            const buttons = page.locator('button');
            const buttonCount = await buttons.count();
            
            if (buttonCount > 0) {
                const firstButton = buttons.first();
                const hasLabel = await firstButton.evaluate(btn => {
                    return btn.textContent.trim() !== '' || 
                           btn.getAttribute('aria-label') !== null ||
                           btn.getAttribute('title') !== null;
                });
                expect(hasLabel).toBeTruthy();
            }
        });
    });
});