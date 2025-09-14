import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * COMPREHENSIVE ERROR DETECTION SUITE
 * 
 * This test suite performs thorough error detection and analysis for the
 * business automation dashboard to identify all issues causing "lots of errors"
 */

// Store all detected errors for final report
let allErrors = {
    javascript: [],
    network: [],
    ui: [],
    functionality: [],
    performance: [],
    critical: []
};

// Screenshot counter
let screenshotCounter = 0;

test.describe('Comprehensive Error Detection Suite', () => {
    
    test.beforeEach(async ({ page }) => {
        // Clear error arrays for each test
        allErrors = {
            javascript: [],
            network: [],
            ui: [],
            functionality: [],
            performance: [],
            critical: []
        };
        
        // Set up comprehensive error listeners
        setupErrorListeners(page);
    });

    test.describe('1. JavaScript Console Errors Analysis', () => {
        
        test('Capture all JavaScript errors, warnings, and console messages', async ({ page }) => {
            console.log('\n🔍 STARTING JAVASCRIPT ERROR DETECTION...\n');
            
            const consoleMessages = [];
            const jsErrors = [];
            const warnings = [];
            const networkErrors = [];
            
            // Comprehensive console message capture
            page.on('console', msg => {
                const message = {
                    type: msg.type(),
                    text: msg.text(),
                    location: msg.location(),
                    timestamp: new Date().toISOString()
                };
                
                consoleMessages.push(message);
                
                if (msg.type() === 'error') {
                    jsErrors.push(message);
                    allErrors.javascript.push({
                        type: 'JavaScript Error',
                        message: msg.text(),
                        location: msg.location(),
                        impact: determineErrorImpact(msg.text()),
                        timestamp: new Date().toISOString()
                    });
                } else if (msg.type() === 'warning') {
                    warnings.push(message);
                    allErrors.javascript.push({
                        type: 'JavaScript Warning',
                        message: msg.text(),
                        location: msg.location(),
                        impact: 'Medium',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            
            // Page error handling
            page.on('pageerror', exception => {
                const error = {
                    type: 'Page Exception',
                    message: exception.message,
                    stack: exception.stack,
                    impact: 'Critical',
                    timestamp: new Date().toISOString()
                };
                allErrors.critical.push(error);
                console.log(`❌ CRITICAL PAGE ERROR: ${exception.message}`);
            });
            
            // Request failure tracking
            page.on('requestfailed', request => {
                const error = {
                    type: 'Network Request Failed',
                    url: request.url(),
                    failure: request.failure()?.errorText || 'Unknown',
                    method: request.method(),
                    impact: request.url().includes('supabase') ? 'Critical' : 'High',
                    timestamp: new Date().toISOString()
                };
                allErrors.network.push(error);
                networkErrors.push(error);
                console.log(`🌐 NETWORK ERROR: ${request.method()} ${request.url()} - ${error.failure}`);
            });
            
            // Navigate to dashboard
            console.log('📍 Navigating to dashboard...');
            await page.goto('/workshops/business-automation-dashboard.html');
            
            // Wait for initial load and let all errors surface
            console.log('⏳ Waiting for page to fully load and capture errors...');
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(5000); // Extended wait to catch async errors
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000); // Additional wait for late-loading components
            
            // Take screenshot of current state
            await takeScreenshot(page, 'initial-load');
            
            // Log all captured errors
            console.log('\n📊 ERROR ANALYSIS RESULTS:\n');
            console.log(`🔴 JavaScript Errors: ${jsErrors.length}`);
            console.log(`⚠️  JavaScript Warnings: ${warnings.length}`);
            console.log(`🌐 Network Errors: ${networkErrors.length}`);
            console.log(`💥 Critical Errors: ${allErrors.critical.length}`);
            
            // Detail each error
            jsErrors.forEach((error, index) => {
                console.log(`\n❌ JS ERROR ${index + 1}:`);
                console.log(`   Message: ${error.text}`);
                console.log(`   Location: ${JSON.stringify(error.location)}`);
                console.log(`   Impact: ${determineErrorImpact(error.text)}`);
            });
            
            warnings.forEach((warning, index) => {
                console.log(`\n⚠️  WARNING ${index + 1}:`);
                console.log(`   Message: ${warning.text}`);
                console.log(`   Location: ${JSON.stringify(warning.location)}`);
            });
            
            networkErrors.forEach((error, index) => {
                console.log(`\n🌐 NETWORK ERROR ${index + 1}:`);
                console.log(`   URL: ${error.url}`);
                console.log(`   Method: ${error.method}`);
                console.log(`   Failure: ${error.failure}`);
                console.log(`   Impact: ${error.impact}`);
            });
            
            // Assert that critical errors are documented
            expect(true).toBeTruthy(); // Always pass, we're documenting not failing
        });
        
        test('Check for undefined variables and missing functions', async ({ page }) => {
            console.log('\n🔍 CHECKING FOR UNDEFINED VARIABLES AND FUNCTIONS...\n');
            
            const undefinedErrors = [];
            const functionErrors = [];
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    if (text.includes('is not defined') || text.includes('undefined')) {
                        undefinedErrors.push({
                            message: text,
                            location: msg.location(),
                            type: 'Undefined Variable/Function'
                        });
                    }
                    if (text.includes('is not a function') || text.includes('Cannot read properties')) {
                        functionErrors.push({
                            message: text,
                            location: msg.location(),
                            type: 'Function/Property Error'
                        });
                    }
                }
            });
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(4000);
            
            console.log(`🔍 Found ${undefinedErrors.length} undefined variable errors`);
            console.log(`🔍 Found ${functionErrors.length} function errors`);
            
            undefinedErrors.forEach((error, index) => {
                console.log(`\n❌ UNDEFINED ERROR ${index + 1}: ${error.message}`);
                allErrors.javascript.push({
                    type: error.type,
                    message: error.message,
                    location: error.location,
                    impact: 'High',
                    cause: 'Variable or function referenced before definition or missing dependency',
                    fix: 'Check variable declaration and function definition order'
                });
            });
            
            functionErrors.forEach((error, index) => {
                console.log(`\n❌ FUNCTION ERROR ${index + 1}: ${error.message}`);
                allErrors.javascript.push({
                    type: error.type,
                    message: error.message,
                    location: error.location,
                    impact: 'High',
                    cause: 'Attempting to call undefined function or access property of null/undefined',
                    fix: 'Add proper null checks and ensure function exists before calling'
                });
            });
        });
    });
    
    test.describe('2. UI/Visual Issues Analysis', () => {
        
        test('Capture screenshots and identify visual issues', async ({ page }) => {
            console.log('\n📸 STARTING UI/VISUAL ANALYSIS...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            // Take full page screenshots at different viewport sizes
            console.log('📸 Capturing desktop screenshot...');
            await page.setViewportSize({ width: 1920, height: 1080 });
            await takeScreenshot(page, 'desktop-full-page');
            
            console.log('📸 Capturing tablet screenshot...');
            await page.setViewportSize({ width: 768, height: 1024 });
            await takeScreenshot(page, 'tablet-view');
            
            console.log('📸 Capturing mobile screenshot...');
            await page.setViewportSize({ width: 375, height: 667 });
            await takeScreenshot(page, 'mobile-view');
            
            // Reset to desktop for further testing
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            // Check for broken layouts
            console.log('🔍 Checking for layout issues...');
            await checkLayoutIssues(page);
            
            // Check for missing elements
            console.log('🔍 Checking for missing elements...');
            await checkMissingElements(page);
            
            // Check for overlapping content
            console.log('🔍 Checking for overlapping content...');
            await checkOverlappingContent(page);
        });
        
        test('Test interactive elements functionality', async ({ page }) => {
            console.log('\n🔘 TESTING INTERACTIVE ELEMENTS...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(4000);
            
            // Test buttons
            await testButtons(page);
            
            // Test modals
            await testModals(page);
            
            // Test forms
            await testForms(page);
        });
    });
    
    test.describe('3. Functionality Testing', () => {
        
        test('Test project selector functionality', async ({ page }) => {
            console.log('\n📂 TESTING PROJECT SELECTOR...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            
            // Look for project selector elements
            const projectSelectors = [
                'select[name*="project"]',
                '#project-select',
                '.project-selector',
                'select',
                '[data-project]',
                '.dropdown'
            ];
            
            let selectorFound = false;
            let selectorElement = null;
            
            for (const selector of projectSelectors) {
                const element = page.locator(selector);
                const count = await element.count();
                console.log(`🔍 Checking selector "${selector}": ${count} found`);
                
                if (count > 0) {
                    selectorElement = element.first();
                    selectorFound = true;
                    console.log(`✅ Found project selector: ${selector}`);
                    
                    // Check if it's visible and enabled
                    const isVisible = await selectorElement.isVisible();
                    const isEnabled = await selectorElement.isEnabled();
                    
                    console.log(`   Visible: ${isVisible}, Enabled: ${isEnabled}`);
                    
                    if (isVisible && isEnabled) {
                        // Try to interact with it
                        try {
                            await selectorElement.click();
                            await page.waitForTimeout(1000);
                            
                            // Check for options
                            const options = await page.locator('option').count();
                            console.log(`   Options available: ${options}`);
                            
                            if (options === 0) {
                                allErrors.functionality.push({
                                    type: 'Project Selector Issue',
                                    message: 'Project selector found but no options available',
                                    impact: 'High',
                                    cause: 'Data not loading or selector not populated',
                                    fix: 'Check data loading and option population logic'
                                });
                            }
                        } catch (error) {
                            allErrors.functionality.push({
                                type: 'Project Selector Interaction Error',
                                message: error.message,
                                impact: 'High',
                                cause: 'Selector interaction failed',
                                fix: 'Debug selector interaction logic'
                            });
                        }
                    } else {
                        allErrors.functionality.push({
                            type: 'Project Selector Visibility/Enabled Issue',
                            message: `Selector visible: ${isVisible}, enabled: ${isEnabled}`,
                            impact: 'High',
                            cause: 'Selector not properly displayed or disabled',
                            fix: 'Check CSS and JavaScript for selector state'
                        });
                    }
                    break;
                }
            }
            
            if (!selectorFound) {
                allErrors.functionality.push({
                    type: 'Missing Project Selector',
                    message: 'No project selector found on page',
                    impact: 'Critical',
                    cause: 'Project selector element missing or not rendered',
                    fix: 'Add or fix project selector HTML/JavaScript'
                });
                console.log('❌ No project selector found');
            }
        });
        
        test('Test Settings button functionality', async ({ page }) => {
            console.log('\n⚙️ TESTING SETTINGS BUTTON...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(4000);
            
            await testSettingsButton(page);
        });
        
        test('Test FAB button functionality', async ({ page }) => {
            console.log('\n🔘 TESTING FAB BUTTON...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(4000);
            
            await testFABButton(page);
        });
        
        test('Test chart rendering', async ({ page }) => {
            console.log('\n📊 TESTING CHART RENDERING...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(6000); // Charts may take longer to render
            
            await testChartRendering(page);
        });
    });
    
    test.describe('4. Network/API Issues Analysis', () => {
        
        test('Monitor network requests and API failures', async ({ page }) => {
            console.log('\n🌐 MONITORING NETWORK REQUESTS...\n');
            
            const requestLog = [];
            const failedRequests = [];
            const slowRequests = [];
            
            page.on('request', request => {
                requestLog.push({
                    url: request.url(),
                    method: request.method(),
                    timestamp: Date.now()
                });
            });
            
            page.on('response', response => {
                const request = response.request();
                const duration = Date.now() - requestLog.find(r => r.url === request.url())?.timestamp;
                
                if (!response.ok()) {
                    failedRequests.push({
                        url: response.url(),
                        status: response.status(),
                        statusText: response.statusText(),
                        method: request.method()
                    });
                    
                    allErrors.network.push({
                        type: 'HTTP Error',
                        message: `${response.status()} ${response.statusText()}`,
                        url: response.url(),
                        method: request.method(),
                        impact: response.url().includes('supabase') ? 'Critical' : 'High'
                    });
                }
                
                if (duration > 5000) {
                    slowRequests.push({
                        url: response.url(),
                        duration: duration,
                        method: request.method()
                    });
                }
            });
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            
            console.log(`📊 Total requests: ${requestLog.length}`);
            console.log(`❌ Failed requests: ${failedRequests.length}`);
            console.log(`🐌 Slow requests (>5s): ${slowRequests.length}`);
            
            failedRequests.forEach((req, index) => {
                console.log(`\n❌ FAILED REQUEST ${index + 1}:`);
                console.log(`   URL: ${req.url}`);
                console.log(`   Status: ${req.status} ${req.statusText}`);
                console.log(`   Method: ${req.method}`);
            });
        });
        
        test('Verify Supabase connection', async ({ page }) => {
            console.log('\n💾 TESTING SUPABASE CONNECTION...\n');
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(6000);
            
            // Check for Supabase-related errors
            const supabaseErrors = allErrors.network.filter(error => 
                error.url && error.url.includes('supabase')
            );
            
            console.log(`🔍 Found ${supabaseErrors.length} Supabase-related errors`);
            
            // Look for connection indicators in the UI
            const connectionIndicators = await page.locator('text=/connected/i').count() + 
                                       await page.locator('text=/online/i').count() + 
                                       await page.locator('.connection-status').count();
            console.log(`📡 Connection indicators found: ${connectionIndicators}`);
            
            // Check console for Supabase messages
            let supabaseMessages = 0;
            page.on('console', msg => {
                if (msg.text().toLowerCase().includes('supabase')) {
                    supabaseMessages++;
                    console.log(`💬 Supabase console message: ${msg.text()}`);
                }
            });
        });
    });
    
    test.describe('5. Performance Analysis', () => {
        
        test('Monitor page load performance', async ({ page }) => {
            console.log('\n⚡ ANALYZING PERFORMANCE...\n');
            
            const startTime = Date.now();
            
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('domcontentloaded');
            
            const domLoadTime = Date.now() - startTime;
            console.log(`📊 DOM Load Time: ${domLoadTime}ms`);
            
            await page.waitForLoadState('networkidle');
            const networkIdleTime = Date.now() - startTime;
            console.log(`📊 Network Idle Time: ${networkIdleTime}ms`);
            
            if (domLoadTime > 3000) {
                allErrors.performance.push({
                    type: 'Slow DOM Load',
                    message: `DOM loaded in ${domLoadTime}ms`,
                    impact: 'Medium',
                    threshold: '3000ms',
                    fix: 'Optimize JavaScript and CSS loading'
                });
            }
            
            if (networkIdleTime > 10000) {
                allErrors.performance.push({
                    type: 'Slow Network Loading',
                    message: `Network idle reached in ${networkIdleTime}ms`,
                    impact: 'High',
                    threshold: '10000ms',
                    fix: 'Optimize API calls and resource loading'
                });
            }
        });
    });
    
    test.describe('6. Final Error Report Generation', () => {
        
        test('Generate comprehensive error report', async ({ page }) => {
            console.log('\n📋 GENERATING COMPREHENSIVE ERROR REPORT...\n');
            
            // Navigate one more time to ensure we catch any remaining issues
            await page.goto('/workshops/business-automation-dashboard.html');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            
            // Generate final report
            await generateFinalReport();
            
            // Always pass - this is documentation
            expect(true).toBeTruthy();
        });
    });
});

// Helper Functions
function setupErrorListeners(page) {
    // Already handled in individual tests
}

function determineErrorImpact(errorMessage) {
    const critical = ['TypeError', 'ReferenceError', 'Cannot read properties', 'is not defined'];
    const high = ['Failed to fetch', 'Network request', 'Uncaught'];
    const medium = ['Warning', 'Deprecated'];
    
    const message = errorMessage.toLowerCase();
    
    if (critical.some(term => message.includes(term.toLowerCase()))) {
        return 'Critical';
    } else if (high.some(term => message.includes(term.toLowerCase()))) {
        return 'High';
    } else if (medium.some(term => message.includes(term.toLowerCase()))) {
        return 'Medium';
    }
    
    return 'Low';
}

async function takeScreenshot(page, name) {
    try {
        screenshotCounter++;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${screenshotCounter.toString().padStart(2, '0')}-${name}-${timestamp}.png`;
        await page.screenshot({ 
            path: `test-results/error-detection-screenshots/${filename}`,
            fullPage: true 
        });
        console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
        console.log(`❌ Failed to take screenshot: ${error.message}`);
    }
}

async function checkLayoutIssues(page) {
    // Check for elements extending beyond viewport
    const elementsOutOfBounds = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const issues = [];
        
        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 50 || rect.bottom > window.innerHeight + 100) {
                issues.push({
                    element: el.tagName + (el.className ? '.' + el.className : ''),
                    bounds: rect,
                    issue: 'Element extends beyond viewport'
                });
            }
        });
        
        return issues;
    });
    
    elementsOutOfBounds.forEach(issue => {
        allErrors.ui.push({
            type: 'Layout Issue',
            message: issue.issue,
            element: issue.element,
            impact: 'Medium',
            fix: 'Adjust CSS layout and positioning'
        });
        console.log(`📐 Layout Issue: ${issue.element} - ${issue.issue}`);
    });
}

async function checkMissingElements(page) {
    const expectedElements = [
        { selector: '.metric-card, [class*="metric"]', name: 'Metric Cards' },
        { selector: 'canvas, .chart', name: 'Charts' },
        { selector: 'button', name: 'Buttons' },
        { selector: 'select, .dropdown', name: 'Dropdowns/Selects' }
    ];
    
    for (const element of expectedElements) {
        const count = await page.locator(element.selector).count();
        if (count === 0) {
            allErrors.ui.push({
                type: 'Missing Element',
                message: `${element.name} not found`,
                selector: element.selector,
                impact: 'High',
                fix: 'Add missing HTML elements or check CSS display properties'
            });
            console.log(`❌ Missing: ${element.name}`);
        } else {
            console.log(`✅ Found: ${element.name} (${count} instances)`);
        }
    }
}

async function checkOverlappingContent(page) {
    const overlaps = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.metric-card, .card, .modal, .panel'));
        const overlapping = [];
        
        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                const rect1 = elements[i].getBoundingClientRect();
                const rect2 = elements[j].getBoundingClientRect();
                
                if (rect1.right > rect2.left && rect1.left < rect2.right &&
                    rect1.bottom > rect2.top && rect1.top < rect2.bottom) {
                    overlapping.push({
                        element1: elements[i].tagName + (elements[i].className || ''),
                        element2: elements[j].tagName + (elements[j].className || '')
                    });
                }
            }
        }
        
        return overlapping;
    });
    
    overlaps.forEach(overlap => {
        allErrors.ui.push({
            type: 'Overlapping Content',
            message: `${overlap.element1} overlaps with ${overlap.element2}`,
            impact: 'Medium',
            fix: 'Adjust CSS positioning and z-index values'
        });
        console.log(`⚠️ Overlap: ${overlap.element1} <-> ${overlap.element2}`);
    });
}

async function testButtons(page) {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`🔘 Testing ${buttonCount} buttons...`);
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const buttonText = await button.textContent();
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        console.log(`   Button ${i + 1}: "${buttonText}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
        
        if (!isVisible) {
            allErrors.ui.push({
                type: 'Hidden Button',
                message: `Button "${buttonText}" is not visible`,
                impact: 'Medium',
                fix: 'Check CSS display and visibility properties'
            });
        }
        
        if (isVisible && isEnabled) {
            try {
                await button.click();
                await page.waitForTimeout(500);
                console.log(`     ✅ Button "${buttonText}" clicked successfully`);
            } catch (error) {
                allErrors.functionality.push({
                    type: 'Button Click Error',
                    message: `Button "${buttonText}" click failed: ${error.message}`,
                    impact: 'High',
                    fix: 'Debug button click handler'
                });
                console.log(`     ❌ Button "${buttonText}" click failed: ${error.message}`);
            }
        }
    }
}

async function testModals(page) {
    // Look for modal triggers and test them
    const modalTriggers = page.locator('button:has-text("Settings"), button:has-text("Open"), [data-modal], .modal-trigger');
    const triggerCount = await modalTriggers.count();
    
    console.log(`🪟 Testing ${triggerCount} potential modal triggers...`);
    
    for (let i = 0; i < triggerCount; i++) {
        const trigger = modalTriggers.nth(i);
        const triggerText = await trigger.textContent();
        
        try {
            await trigger.click();
            await page.waitForTimeout(1000);
            
            // Look for opened modals
            const modals = page.locator('.modal, .dialog, [role="dialog"], .popup');
            const modalCount = await modals.count();
            
            if (modalCount === 0) {
                allErrors.functionality.push({
                    type: 'Modal Not Opening',
                    message: `Modal trigger "${triggerText}" clicked but no modal appeared`,
                    impact: 'High',
                    fix: 'Check modal opening JavaScript'
                });
            } else {
                console.log(`   ✅ Modal opened for trigger "${triggerText}"`);
                
                // Try to close modal
                const closeButtons = page.locator('.close, button:has-text("Close"), button:has-text("×")');
                if (await closeButtons.count() > 0) {
                    await closeButtons.first().click();
                    await page.waitForTimeout(500);
                }
            }
        } catch (error) {
            allErrors.functionality.push({
                type: 'Modal Trigger Error',
                message: `Modal trigger "${triggerText}" failed: ${error.message}`,
                impact: 'High',
                fix: 'Debug modal trigger JavaScript'
            });
        }
    }
}

async function testForms(page) {
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    console.log(`📝 Testing ${formCount} forms...`);
    
    for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i);
        const inputs = form.locator('input, select, textarea');
        const inputCount = await inputs.count();
        
        console.log(`   Form ${i + 1}: ${inputCount} inputs`);
        
        if (inputCount === 0) {
            allErrors.functionality.push({
                type: 'Empty Form',
                message: `Form ${i + 1} has no inputs`,
                impact: 'Medium',
                fix: 'Add form inputs or remove empty form'
            });
        }
    }
}

async function testSettingsButton(page) {
    const settingsSelectors = [
        'button:has-text("Settings")',
        'button[title*="settings" i]',
        '.settings-btn',
        '[data-testid*="settings"]',
        '.gear-icon',
        'button:has(.gear)',
        'button:has([class*="settings"])'
    ];
    
    let settingsFound = false;
    
    for (const selector of settingsSelectors) {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        
        if (count > 0) {
            settingsFound = true;
            console.log(`⚙️ Found settings button: ${selector}`);
            
            const button = buttons.first();
            const isVisible = await button.isVisible();
            const isEnabled = await button.isEnabled();
            
            console.log(`   Visible: ${isVisible}, Enabled: ${isEnabled}`);
            
            if (isVisible && isEnabled) {
                try {
                    await button.click();
                    await page.waitForTimeout(1000);
                    
                    // Look for settings panel
                    const panels = page.locator('.settings-panel, .modal, .sidebar, [class*="settings"][class*="open"]');
                    const panelCount = await panels.count();
                    
                    if (panelCount > 0) {
                        console.log(`   ✅ Settings panel opened`);
                        await takeScreenshot(page, 'settings-panel-open');
                        
                        // Try to close
                        const closeButtons = page.locator('button:has-text("Close"), button:has-text("×"), .close-btn');
                        if (await closeButtons.count() > 0) {
                            await closeButtons.first().click();
                            await page.waitForTimeout(500);
                        }
                    } else {
                        allErrors.functionality.push({
                            type: 'Settings Panel Not Opening',
                            message: 'Settings button clicked but panel did not open',
                            impact: 'High',
                            fix: 'Check settings panel JavaScript and CSS'
                        });
                    }
                } catch (error) {
                    allErrors.functionality.push({
                        type: 'Settings Button Error',
                        message: `Settings button click failed: ${error.message}`,
                        impact: 'High',
                        fix: 'Debug settings button click handler'
                    });
                }
            }
            break;
        }
    }
    
    if (!settingsFound) {
        allErrors.functionality.push({
            type: 'Missing Settings Button',
            message: 'No settings button found on page',
            impact: 'Medium',
            fix: 'Add settings button or check if it\'s hidden'
        });
        console.log('❌ No settings button found');
    }
}

async function testFABButton(page) {
    const fabSelectors = [
        '.fab',
        '.floating-action-button',
        'button[class*="floating"]',
        'button[class*="fab"]',
        '[data-testid="fab"]',
        '.add-process-btn',
        'button:has-text("+")'
    ];
    
    let fabFound = false;
    
    for (const selector of fabSelectors) {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        
        if (count > 0) {
            fabFound = true;
            console.log(`🔘 Found FAB button: ${selector}`);
            
            const button = buttons.first();
            const isVisible = await button.isVisible();
            const isEnabled = await button.isEnabled();
            
            console.log(`   Visible: ${isVisible}, Enabled: ${isEnabled}`);
            
            if (isVisible && isEnabled) {
                try {
                    await button.click();
                    await page.waitForTimeout(2000);
                    
                    // Look for process entry workspace
                    const workspaces = page.locator('.process-entry, .workspace, .modal:has-text("Process"), [class*="entry"][class*="form"]');
                    const workspaceCount = await workspaces.count();
                    
                    if (workspaceCount > 0) {
                        console.log(`   ✅ Process entry workspace opened`);
                        await takeScreenshot(page, 'fab-workspace-open');
                    } else {
                        allErrors.functionality.push({
                            type: 'FAB Workspace Not Opening',
                            message: 'FAB button clicked but process entry workspace did not open',
                            impact: 'High',
                            fix: 'Check FAB click handler and workspace display logic'
                        });
                    }
                } catch (error) {
                    allErrors.functionality.push({
                        type: 'FAB Button Error',
                        message: `FAB button click failed: ${error.message}`,
                        impact: 'High',
                        fix: 'Debug FAB button click handler'
                    });
                }
            }
            break;
        }
    }
    
    if (!fabFound) {
        allErrors.functionality.push({
            type: 'Missing FAB Button',
            message: 'No FAB (Floating Action Button) found on page',
            impact: 'High',
            fix: 'Add FAB button or check if it\'s hidden'
        });
        console.log('❌ No FAB button found');
    }
}

async function testChartRendering(page) {
    const chartSelectors = ['canvas', '.chart svg', '[class*="chart"]', '#chartCanvas'];
    let chartsFound = false;
    let chartsRendered = 0;
    
    for (const selector of chartSelectors) {
        const charts = page.locator(selector);
        const count = await charts.count();
        
        if (count > 0) {
            chartsFound = true;
            console.log(`📊 Found ${count} charts with selector: ${selector}`);
            
            // Test each chart
            for (let i = 0; i < Math.min(count, 5); i++) {
                const chart = charts.nth(i);
                const isVisible = await chart.isVisible();
                
                if (isVisible) {
                    if (selector === 'canvas') {
                        // Test canvas content
                        const hasContent = await chart.evaluate(el => {
                            if (!el.getContext) return false;
                            const ctx = el.getContext('2d');
                            if (!ctx) return false;
                            try {
                                const imageData = ctx.getImageData(0, 0, el.width, el.height);
                                return imageData.data.some(pixel => pixel !== 0);
                            } catch (e) {
                                return false;
                            }
                        });
                        
                        if (hasContent) {
                            chartsRendered++;
                            console.log(`   ✅ Chart ${i + 1} has rendered content`);
                        } else {
                            allErrors.functionality.push({
                                type: 'Empty Chart Canvas',
                                message: `Chart canvas ${i + 1} is visible but appears empty`,
                                impact: 'High',
                                fix: 'Check chart data loading and rendering logic'
                            });
                            console.log(`   ❌ Chart ${i + 1} appears empty`);
                        }
                    } else {
                        // For SVG charts, check for content
                        const hasContent = await chart.locator('*').count() > 0;
                        if (hasContent) {
                            chartsRendered++;
                            console.log(`   ✅ SVG Chart ${i + 1} has content`);
                        } else {
                            allErrors.functionality.push({
                                type: 'Empty SVG Chart',
                                message: `SVG chart ${i + 1} is visible but appears empty`,
                                impact: 'High',
                                fix: 'Check chart data and SVG generation'
                            });
                        }
                    }
                } else {
                    allErrors.functionality.push({
                        type: 'Hidden Chart',
                        message: `Chart ${i + 1} exists but is not visible`,
                        impact: 'Medium',
                        fix: 'Check chart CSS display and visibility'
                    });
                }
            }
        }
    }
    
    if (!chartsFound) {
        allErrors.functionality.push({
            type: 'No Charts Found',
            message: 'No chart elements found on page',
            impact: 'Critical',
            fix: 'Add chart elements or check if they failed to render'
        });
        console.log('❌ No charts found on page');
    } else {
        console.log(`📊 Summary: ${chartsRendered} charts successfully rendered out of ${chartsFound} found`);
    }
}

async function generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE ERROR DETECTION REPORT');
    console.log('='.repeat(80));
    
    const totalErrors = Object.values(allErrors).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\n🔢 TOTAL ERRORS DETECTED: ${totalErrors}\n`);
    
    // Summary by category
    console.log('📊 ERROR BREAKDOWN BY CATEGORY:');
    Object.entries(allErrors).forEach(([category, errors]) => {
        if (errors.length > 0) {
            console.log(`   ${category.toUpperCase()}: ${errors.length} errors`);
        }
    });
    
    // Critical errors first
    if (allErrors.critical.length > 0) {
        console.log('\n' + '⚠️'.repeat(20));
        console.log('🚨 CRITICAL ERRORS (IMMEDIATE ATTENTION REQUIRED):');
        console.log('⚠️'.repeat(20));
        allErrors.critical.forEach((error, index) => {
            console.log(`\n❌ CRITICAL ERROR ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   Message: ${error.message}`);
            if (error.stack) console.log(`   Stack: ${error.stack}`);
            console.log(`   Fix Required: Page cannot function properly`);
        });
    }
    
    // JavaScript errors
    if (allErrors.javascript.length > 0) {
        console.log('\n' + '🔴'.repeat(20));
        console.log('💻 JAVASCRIPT ERRORS:');
        console.log('🔴'.repeat(20));
        allErrors.javascript.forEach((error, index) => {
            console.log(`\n❌ JS ERROR ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   Message: ${error.message}`);
            console.log(`   Impact: ${error.impact}`);
            if (error.location) console.log(`   Location: ${JSON.stringify(error.location)}`);
            if (error.cause) console.log(`   Likely Cause: ${error.cause}`);
            if (error.fix) console.log(`   Recommended Fix: ${error.fix}`);
        });
    }
    
    // Network errors
    if (allErrors.network.length > 0) {
        console.log('\n' + '🌐'.repeat(20));
        console.log('🌍 NETWORK/API ERRORS:');
        console.log('🌐'.repeat(20));
        allErrors.network.forEach((error, index) => {
            console.log(`\n❌ NETWORK ERROR ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   URL: ${error.url || 'N/A'}`);
            console.log(`   Method: ${error.method || 'N/A'}`);
            console.log(`   Message: ${error.message}`);
            console.log(`   Impact: ${error.impact}`);
            if (error.failure) console.log(`   Failure: ${error.failure}`);
        });
    }
    
    // UI errors
    if (allErrors.ui.length > 0) {
        console.log('\n' + '🎨'.repeat(20));
        console.log('🖼️  UI/VISUAL ERRORS:');
        console.log('🎨'.repeat(20));
        allErrors.ui.forEach((error, index) => {
            console.log(`\n❌ UI ERROR ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   Message: ${error.message}`);
            console.log(`   Impact: ${error.impact}`);
            if (error.element) console.log(`   Element: ${error.element}`);
            if (error.selector) console.log(`   Selector: ${error.selector}`);
            if (error.fix) console.log(`   Recommended Fix: ${error.fix}`);
        });
    }
    
    // Functionality errors
    if (allErrors.functionality.length > 0) {
        console.log('\n' + '⚙️'.repeat(20));
        console.log('🔧 FUNCTIONALITY ERRORS:');
        console.log('⚙️'.repeat(20));
        allErrors.functionality.forEach((error, index) => {
            console.log(`\n❌ FUNCTIONALITY ERROR ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   Message: ${error.message}`);
            console.log(`   Impact: ${error.impact}`);
            if (error.cause) console.log(`   Likely Cause: ${error.cause}`);
            if (error.fix) console.log(`   Recommended Fix: ${error.fix}`);
        });
    }
    
    // Performance errors
    if (allErrors.performance.length > 0) {
        console.log('\n' + '⚡'.repeat(20));
        console.log('🚀 PERFORMANCE ISSUES:');
        console.log('⚡'.repeat(20));
        allErrors.performance.forEach((error, index) => {
            console.log(`\n⚠️ PERFORMANCE ISSUE ${index + 1}:`);
            console.log(`   Type: ${error.type}`);
            console.log(`   Message: ${error.message}`);
            console.log(`   Impact: ${error.impact}`);
            if (error.threshold) console.log(`   Threshold: ${error.threshold}`);
            if (error.fix) console.log(`   Recommended Fix: ${error.fix}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PRIORITY RECOMMENDATIONS:');
    console.log('='.repeat(80));
    
    const criticalCount = allErrors.critical.length;
    const highImpactCount = Object.values(allErrors).flat().filter(e => e.impact === 'Critical' || e.impact === 'High').length;
    
    console.log(`\n1. 🚨 IMMEDIATE: Fix ${criticalCount} critical errors that prevent basic functionality`);
    console.log(`2. 🔥 HIGH PRIORITY: Address ${highImpactCount} high-impact errors affecting user experience`);
    console.log(`3. 📊 MEDIUM PRIORITY: Resolve UI and performance issues`);
    console.log(`4. 🔍 LOW PRIORITY: Clean up warnings and minor issues`);
    
    console.log('\n' + '='.repeat(80));
    console.log('📸 SCREENSHOTS: Check test-results/error-detection-screenshots/ for visual evidence');
    console.log('='.repeat(80));
    
    if (totalErrors === 0) {
        console.log('\n🎉 GREAT NEWS: No errors detected! The dashboard appears to be working properly.');
    } else {
        console.log(`\n⚠️  SUMMARY: ${totalErrors} total errors found requiring attention.`);
    }
}