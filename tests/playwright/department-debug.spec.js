const { test, expect } = require('@playwright/test');

test.describe('Department Priority Debug', () => {
    test('check why department priority section is blank', async ({ page }) => {
        console.log('🔍 Debugging department priority section...');
        
        // Navigate to dashboard
        await page.goto('http://localhost:8000/workshops/business-automation-dashboard.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check current project and processes
        const projectInfo = await page.evaluate(() => {
            return {
                currentProjectId: window.currentProjectId,
                projectsCount: window.projects ? window.projects.length : 0,
                projects: window.projects ? window.projects.map(p => ({ id: p.id, name: p.name })) : [],
                processesCount: window.processes ? window.processes.length : 0,
                processes: window.processes ? window.processes.slice(0, 3).map(p => ({ 
                    name: p.name, 
                    department: p.department,
                    impact: p.impact,
                    feasibility: p.feasibility 
                })) : []
            };
        });
        
        console.log('📊 Project Info:', projectInfo);
        
        // Check department ranking function availability
        const functionCheck = await page.evaluate(() => {
            return {
                updateDepartmentRankings: typeof updateDepartmentRankings === 'function',
                getDepartmentRankings: typeof getDepartmentRankings === 'function',
                calculateDepartmentScores: typeof calculateDepartmentScores === 'function'
            };
        });
        
        console.log('⚙️ Function availability:', functionCheck);
        
        // Check department rankings content (correct ID is departmentRankings)
        const departmentContent = await page.evaluate(() => {
            const container = document.getElementById('departmentRankings');
            const noDataMessage = container?.querySelector('.text-gray-500');
            
            return {
                containerExists: !!container,
                containerHTML: container ? container.innerHTML.substring(0, 300) : null,
                hasNoDataMessage: !!noDataMessage,
                noDataText: noDataMessage ? noDataMessage.textContent : null,
                hasDepartmentItems: !!container?.querySelector('.department-item')
            };
        });
        
        console.log('📋 Department content:', departmentContent);
        
        // Try to manually trigger department rankings update
        const manualUpdate = await page.evaluate(() => {
            try {
                if (typeof updateDepartmentRankings === 'function') {
                    updateDepartmentRankings();
                    return { success: true, message: 'Function called successfully' };
                } else {
                    return { success: false, message: 'Function not available' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('🔄 Manual update result:', manualUpdate);
        
        // Wait and check again
        await page.waitForTimeout(2000);
        
        const afterUpdate = await page.evaluate(() => {
            const container = document.getElementById('department-rankings-content');
            return {
                containerHTML: container ? container.innerHTML.substring(0, 500) : null
            };
        });
        
        console.log('📋 After manual update:', afterUpdate);
        
        // Check if processes have departments
        const departmentAnalysis = await page.evaluate(() => {
            if (!window.processes || window.processes.length === 0) {
                return { error: 'No processes found' };
            }
            
            const departmentCounts = {};
            const processesWithDepartments = window.processes.filter(p => p.department);
            
            processesWithDepartments.forEach(p => {
                departmentCounts[p.department] = (departmentCounts[p.department] || 0) + 1;
            });
            
            return {
                totalProcesses: window.processes.length,
                processesWithDepartments: processesWithDepartments.length,
                departments: Object.keys(departmentCounts),
                departmentCounts: departmentCounts
            };
        });
        
        console.log('🏢 Department analysis:', departmentAnalysis);
    });
});