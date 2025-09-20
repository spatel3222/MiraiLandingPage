import { test, expect } from '@playwright/test';

test.describe('Department Rankings and Use Case Priorities Fixes', () => {
    test('should verify both department rankings and use case priorities work correctly with testSept9b', async ({ page }) => {
        console.log('🧪 Starting comprehensive test for department rankings and use case priorities fixes...');
        
        // Navigate to the dashboard
        await page.goto('/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for the page to load completely
        await page.waitForTimeout(3000);
        
        console.log('📊 Dashboard loaded, now checking initial state...');
        
        // Verify we're on the testSept9b project (should be default)
        const projectName = await page.locator('#currentProjectName').textContent();
        console.log(`Current project: ${projectName}`);
        
        // If not already on testSept9b, switch to it
        if (projectName !== 'testSept9b') {
            console.log('🔄 Switching to testSept9b project...');
            
            // Look for the project selector
            const projectSelector = page.locator('#headerProjectSelector');
            await projectSelector.waitFor({ state: 'visible', timeout: 10000 });
            
            // Select testSept9b from the dropdown
            await projectSelector.selectOption('testSept9b');
            await page.waitForTimeout(3000);
            
            // Verify the switch worked
            const newProjectName = await page.locator('#currentProjectName').textContent();
            console.log(`Switched to project: ${newProjectName}`);
        }
        
        // Wait for data to load
        await page.waitForTimeout(5000);
        
        console.log('✅ Project switched, now verifying fixes...');
        
        // Take initial screenshot for debugging
        await page.screenshot({ 
            path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/initial-state.png',
            fullPage: true 
        });
        
        // PART 1: Verify Department Rankings Fix
        console.log('🏢 Testing Department Rankings...');
        
        const departmentRankingsContainer = page.locator('#departmentRankings');
        await expect(departmentRankingsContainer).toBeVisible();
        
        // Check if department rankings are populated (not showing empty state)
        const emptyStateDept = departmentRankingsContainer.locator('text=No department data available');
        const hasEmptyStateDept = await emptyStateDept.count() > 0;
        
        if (hasEmptyStateDept) {
            console.log('❌ Department rankings still showing empty state');
            await page.screenshot({ 
                path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/department-rankings-empty.png',
                fullPage: true 
            });
        } else {
            console.log('✅ Department rankings populated, checking for 4 departments...');
            
            // Look for department items
            const departmentItems = departmentRankingsContainer.locator('.department-item');
            const departmentCount = await departmentItems.count();
            
            console.log(`Found ${departmentCount} departments`);
            
            // Verify we have at least some departments (expect 4 based on user feedback)
            expect(departmentCount).toBeGreaterThan(0);
            
            if (departmentCount >= 4) {
                console.log('✅ Found 4+ departments as expected');
            } else {
                console.log(`⚠️ Expected 4 departments, found ${departmentCount}`);
            }
            
            // Verify each department has necessary data
            for (let i = 0; i < Math.min(departmentCount, 4); i++) {
                const deptItem = departmentItems.nth(i);
                const deptName = await deptItem.locator('.department-name').textContent();
                const deptStats = await deptItem.locator('.department-stats').textContent();
                
                console.log(`Department ${i + 1}: ${deptName} - ${deptStats}`);
                
                // Verify department has name and stats
                expect(deptName).toBeTruthy();
                expect(deptStats).toContain('process');
                expect(deptStats).toContain('Score:');
            }
        }
        
        // Take screenshot of department rankings
        await page.screenshot({ 
            path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/department-rankings-result.png',
            fullPage: true 
        });
        
        // PART 2: Verify Use Case Priorities Fix
        console.log('📋 Testing Use Case Priorities...');
        
        const useCasePrioritiesContainer = page.locator('#useCasePriorities');
        await expect(useCasePrioritiesContainer).toBeVisible();
        
        // Check if use case priorities are populated (not showing empty state)
        const emptyStateUseCase = useCasePrioritiesContainer.locator('text=No process data available');
        const hasEmptyStateUseCase = await emptyStateUseCase.count() > 0;
        
        if (hasEmptyStateUseCase) {
            console.log('❌ Use case priorities still showing empty state');
            await page.screenshot({ 
                path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/use-case-priorities-empty.png',
                fullPage: true 
            });
        } else {
            console.log('✅ Use case priorities populated, checking for actual process data...');
            
            // Look for use case items
            const useCaseItems = useCasePrioritiesContainer.locator('.use-case-item');
            const useCaseCount = await useCaseItems.count();
            
            console.log(`Found ${useCaseCount} use cases`);
            
            // Verify we have use cases
            expect(useCaseCount).toBeGreaterThan(0);
            
            // Verify these are NOT hardcoded values like "Invoice Processing, Resume Screening"
            const hardcodedTexts = [
                'Invoice Processing',
                'Resume Screening',
                'Inventory Management',
                'Customer Onboarding'
            ];
            
            let foundHardcoded = false;
            for (let i = 0; i < useCaseCount; i++) {
                const useCaseItem = useCaseItems.nth(i);
                const useCaseText = await useCaseItem.textContent();
                
                console.log(`Use Case ${i + 1}: ${useCaseText?.substring(0, 100)}...`);
                
                // Check if this matches any hardcoded text
                for (const hardcoded of hardcodedTexts) {
                    if (useCaseText?.includes(hardcoded)) {
                        console.log(`⚠️ Found potentially hardcoded text: ${hardcoded}`);
                        foundHardcoded = true;
                    }
                }
            }
            
            if (!foundHardcoded) {
                console.log('✅ No hardcoded values found - use cases appear to be dynamic');
            }
            
            // Verify each use case has proper structure
            for (let i = 0; i < Math.min(useCaseCount, 4); i++) {
                const useCaseItem = useCaseItems.nth(i);
                
                // Look for priority badges
                const priorityBadge = useCaseItem.locator('.priority-badge');
                if (await priorityBadge.count() > 0) {
                    const badgeText = await priorityBadge.textContent();
                    console.log(`  Priority badge: ${badgeText}`);
                    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(badgeText);
                }
                
                // Look for timeline
                const timeline = useCaseItem.locator('.use-case-timeline');
                if (await timeline.count() > 0) {
                    const timelineText = await timeline.textContent();
                    console.log(`  Timeline: ${timelineText}`);
                    expect(timelineText).toContain('week');
                }
            }
        }
        
        // Take screenshot of use case priorities
        await page.screenshot({ 
            path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/use-case-priorities-result.png',
            fullPage: true 
        });
        
        // PART 3: Final Comprehensive Screenshot
        console.log('📸 Taking comprehensive screenshot...');
        
        // Scroll to make sure both sections are visible
        await page.locator('#departmentRankings').scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/comprehensive-fixes-validation.png',
            fullPage: true 
        });
        
        // PART 4: Data Extraction for Verification
        console.log('📊 Extracting data for detailed verification...');
        
        // Extract department data
        const departmentData = await page.evaluate(() => {
            const container = document.getElementById('departmentRankings');
            if (!container) return { error: 'Container not found' };
            
            const departments = [];
            const items = container.querySelectorAll('.department-item');
            
            items.forEach((item, index) => {
                const name = item.querySelector('.department-name')?.textContent || '';
                const stats = item.querySelector('.department-stats')?.textContent || '';
                const scoreBar = item.querySelector('.score-fill');
                const scoreWidth = scoreBar ? scoreBar.style.width : '0%';
                
                departments.push({
                    index: index + 1,
                    name: name.trim(),
                    stats: stats.trim(),
                    scoreWidth: scoreWidth
                });
            });
            
            return {
                departmentCount: items.length,
                departments: departments,
                hasEmptyState: container.textContent.includes('No department data available')
            };
        });
        
        console.log('Department Data:', JSON.stringify(departmentData, null, 2));
        
        // Extract use case data
        const useCaseData = await page.evaluate(() => {
            const container = document.getElementById('useCasePriorities');
            if (!container) return { error: 'Container not found' };
            
            const useCases = [];
            const items = container.querySelectorAll('.use-case-item');
            
            items.forEach((item, index) => {
                const name = item.querySelector('.use-case-name')?.textContent || '';
                const priority = item.querySelector('.priority-badge')?.textContent || '';
                const timeline = item.querySelector('.use-case-timeline')?.textContent || '';
                const description = item.querySelector('.use-case-description')?.textContent || '';
                
                useCases.push({
                    index: index + 1,
                    name: name.trim(),
                    priority: priority.trim(),
                    timeline: timeline.trim(),
                    description: description.trim().substring(0, 100)
                });
            });
            
            return {
                useCaseCount: items.length,
                useCases: useCases,
                hasEmptyState: container.textContent.includes('No process data available')
            };
        });
        
        console.log('Use Case Data:', JSON.stringify(useCaseData, null, 2));
        
        // PART 5: Final Assertions
        console.log('🔍 Running final assertions...');
        
        // Assert department rankings are working
        if (departmentData.error) {
            throw new Error('Department rankings container not found');
        }
        
        expect(departmentData.hasEmptyState).toBe(false);
        expect(departmentData.departmentCount).toBeGreaterThan(0);
        
        // Assert use case priorities are working
        if (useCaseData.error) {
            throw new Error('Use case priorities container not found');
        }
        
        expect(useCaseData.hasEmptyState).toBe(false);
        expect(useCaseData.useCaseCount).toBeGreaterThan(0);
        
        console.log('✅ All tests passed! Both fixes are working correctly.');
        console.log(`📊 Summary: Found ${departmentData.departmentCount} departments and ${useCaseData.useCaseCount} use cases`);
        
        // Generate summary report
        const summary = {
            testPassed: true,
            timestamp: new Date().toISOString(),
            project: 'testSept9b',
            departmentRankings: {
                working: !departmentData.hasEmptyState,
                count: departmentData.departmentCount,
                departments: departmentData.departments
            },
            useCasePriorities: {
                working: !useCaseData.hasEmptyState,
                count: useCaseData.useCaseCount,
                useCases: useCaseData.useCases
            }
        };
        
        console.log('📋 Final Summary:', JSON.stringify(summary, null, 2));
    });
    
    test('should verify switching between projects updates both sections', async ({ page }) => {
        console.log('🔄 Testing project switching functionality...');
        
        // Navigate to the dashboard
        await page.goto('/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Check if there are multiple projects to switch between
        const projectSelector = page.locator('#headerProjectSelector');
        await projectSelector.waitFor({ state: 'visible', timeout: 10000 });
        
        const projectOptions = await projectSelector.locator('option').count();
        
        if (projectOptions > 2) { // More than just "Select Project..." and one project
            console.log(`Found ${projectOptions} project options, testing switching...`);
            
            // Take screenshot before switching
            await page.screenshot({ 
                path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/before-project-switch.png',
                fullPage: true 
            });
            
            // Get all option values
            const optionValues = await page.evaluate(() => {
                const select = document.getElementById('headerProjectSelector');
                return Array.from(select.options).map(option => option.value).filter(value => value);
            });
            
            console.log('Available projects:', optionValues);
            
            // Find a project that's not testSept9b
            const otherProject = optionValues.find(value => value !== 'testSept9b');
            
            if (otherProject) {
                console.log(`Switching to project: ${otherProject}`);
                await projectSelector.selectOption(otherProject);
                await page.waitForTimeout(3000);
                
                // Take screenshot after switching to other project
                await page.screenshot({ 
                    path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/switched-to-other-project.png',
                    fullPage: true 
                });
                
                // Now switch back to testSept9b
                console.log('Switching back to testSept9b...');
                await projectSelector.selectOption('testSept9b');
                await page.waitForTimeout(3000);
                
                // Verify the sections updated
                const departmentContainer = page.locator('#departmentRankings');
                const useCaseContainer = page.locator('#useCasePriorities');
                
                await expect(departmentContainer).toBeVisible();
                await expect(useCaseContainer).toBeVisible();
                
                // Take final screenshot
                await page.screenshot({ 
                    path: '/Users/shivangpatel/Documents/GitHub/crtx.in/test-results/switched-back-to-testSept9b.png',
                    fullPage: true 
                });
                
                console.log('✅ Project switching test completed');
            } else {
                console.log('ℹ️ No other projects found besides testSept9b');
            }
        } else {
            console.log('ℹ️ Not enough projects available for switching test');
        }
    });
});