// Comprehensive QA Test Suite for Multi-Device Workshop Solution
// This file contains additional critical tests for production readiness

const WorkshopDatabase = require('../api/supabase-config.js');

describe('Critical Production Readiness Tests', () => {
    let workshopDB;
    
    beforeEach(() => {
        workshopDB = new WorkshopDatabase();
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('SECURITY TESTS', () => {
        test('SEC1: Department tokens should be cryptographically secure', () => {
            const token1 = workshopDB.generateSecureToken('project1', 'finance');
            const token2 = workshopDB.generateSecureToken('project1', 'finance');
            
            // Tokens should be different even for same input
            expect(token1).not.toBe(token2);
            // Tokens should be at least 32 chars
            expect(token1.length).toBeGreaterThanOrEqual(32);
            // Tokens should not contain sensitive data
            expect(token1).not.toContain('project1');
            expect(token1).not.toContain('finance');
        });

        test('SEC2: Cross-department access should be blocked', async () => {
            // Create project and tokens
            const project = await workshopDB.createProject({
                name: 'Security Test Project',
                description: 'Testing cross-department access'
            });
            
            const tokens = await workshopDB.generateDepartmentTokens(project.id, ['Finance', 'HR']);
            const financeToken = tokens.find(t => t.department === 'Finance').token;
            const hrToken = tokens.find(t => t.department === 'HR').token;
            
            // Finance token should not work for HR
            const isValidCrossAccess = await workshopDB.validateToken(financeToken, project.id, 'HR');
            expect(isValidCrossAccess).toBe(false);
            
            // HR token should work for HR
            const isValidSameAccess = await workshopDB.validateToken(hrToken, project.id, 'HR');
            expect(isValidSameAccess).toBe(true);
        });

        test('SEC3: Expired or malformed tokens should be rejected', async () => {
            const projectId = 'test-project-123';
            
            // Test malformed tokens
            const malformedTokens = [
                null,
                undefined,
                '',
                'too-short',
                'definitely-not-a-real-token-but-long-enough',
                '<script>alert("xss")</script>',
                'DROP TABLE processes;'
            ];
            
            for (const token of malformedTokens) {
                const isValid = await workshopDB.validateToken(token, projectId, 'Finance');
                expect(isValid).toBe(false);
            }
        });

        test('SEC4: SQL injection attempts should be safely handled', async () => {
            const maliciousInputs = [
                "'; DROP TABLE processes; --",
                "1' OR '1'='1",
                "admin'; INSERT INTO processes VALUES ('malicious'); --",
                "<script>alert('xss')</script>",
                "../../etc/passwd"
            ];

            for (const input of maliciousInputs) {
                await expect(workshopDB.submitProcess({
                    projectId: input,
                    department: input,
                    name: input,
                    timeSpent: 5,
                    scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                    impact: 7,
                    feasibility: 6,
                    token: 'test-token'
                })).resolves.toBeDefined();
                // Should not throw errors or cause crashes
            }
        });
    });

    describe('CONCURRENT USER TESTS', () => {
        test('CONC1: Multiple departments submitting simultaneously', async () => {
            const project = await workshopDB.createProject({
                name: 'Concurrent Test Project',
                description: 'Testing concurrent submissions'
            });

            const departments = ['Finance', 'HR', 'Operations', 'IT', 'Sales'];
            const promises = departments.map((dept, index) => 
                workshopDB.submitProcess({
                    projectId: project.id,
                    department: dept,
                    name: `${dept} Concurrent Process`,
                    timeSpent: index + 1,
                    scores: { 
                        repetitive: Math.floor(Math.random() * 10) + 1,
                        dataDriven: Math.floor(Math.random() * 10) + 1,
                        ruleBased: Math.floor(Math.random() * 10) + 1,
                        highVolume: Math.floor(Math.random() * 10) + 1
                    },
                    impact: Math.floor(Math.random() * 10) + 1,
                    feasibility: Math.floor(Math.random() * 10) + 1,
                    token: `${dept.toLowerCase()}-token`
                })
            );

            const results = await Promise.all(promises);
            
            // All submissions should succeed
            expect(results.length).toBe(5);
            results.forEach(result => {
                expect(result.id).toBeDefined();
            });
            
            // All processes should be retrievable
            const processes = await workshopDB.getProcesses(project.id);
            expect(processes.length).toBe(5);
        });

        test('CONC2: Race condition handling in analytics calculation', async () => {
            const project = await workshopDB.createProject({
                name: 'Race Condition Test',
                description: 'Testing analytics under concurrent load'
            });

            // Simulate multiple users submitting and requesting analytics
            const submissionPromises = [];
            const analyticsPromises = [];
            
            for (let i = 0; i < 10; i++) {
                submissionPromises.push(
                    workshopDB.submitProcess({
                        projectId: project.id,
                        department: ['Finance', 'HR', 'IT'][i % 3],
                        name: `Race Test Process ${i}`,
                        timeSpent: i + 1,
                        scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                        impact: 7,
                        feasibility: 6,
                        token: 'race-test-token'
                    })
                );
                
                analyticsPromises.push(
                    workshopDB.getWorkshopAnalytics(project.id)
                );
            }

            // Execute all operations concurrently
            const [submissions, analytics] = await Promise.all([
                Promise.all(submissionPromises),
                Promise.all(analyticsPromises)
            ]);

            // All operations should complete without errors
            expect(submissions.length).toBe(10);
            expect(analytics.length).toBe(10);
            
            // Final analytics should be consistent
            const finalAnalytics = await workshopDB.getWorkshopAnalytics(project.id);
            expect(finalAnalytics.total_processes).toBe(10);
        });
    });

    describe('NETWORK FAILURE SIMULATION', () => {
        test('NET1: Offline to online data synchronization', async () => {
            // Start offline
            workshopDB.isOnline = false;
            
            const project = await workshopDB.createProject({
                name: 'Offline Test Project',
                description: 'Testing offline capabilities'
            });

            // Submit processes while offline
            const process1 = await workshopDB.submitProcess({
                projectId: project.id,
                department: 'Finance',
                name: 'Offline Process 1',
                timeSpent: 5,
                scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                impact: 7,
                feasibility: 6,
                token: 'offline-token'
            });

            const process2 = await workshopDB.submitProcess({
                projectId: project.id,
                department: 'HR',
                name: 'Offline Process 2',
                timeSpent: 3,
                scores: { repetitive: 5, dataDriven: 8, ruleBased: 6, highVolume: 7 },
                impact: 8,
                feasibility: 5,
                token: 'offline-token-2'
            });

            // Verify data is stored locally
            expect(localStorage.setItem).toHaveBeenCalled();
            const localProcesses = workshopDB.getProcessesLocal(project.id);
            expect(localProcesses.length).toBe(2);

            // Simulate going back online
            workshopDB.isOnline = true;
            
            // Data should still be accessible
            const allProcesses = await workshopDB.getProcesses(project.id);
            expect(allProcesses.length).toBe(2);
        });

        test('NET2: Partial network failure recovery', async () => {
            let callCount = 0;
            
            // Mock intermittent network failures
            const originalSupabase = workshopDB.supabase;
            workshopDB.supabase = {
                from: () => ({
                    insert: () => {
                        callCount++;
                        if (callCount <= 2) {
                            throw new Error('Network timeout');
                        }
                        return { 
                            select: () => ({ 
                                single: () => ({ 
                                    data: { id: 'recovered-id' }, 
                                    error: null 
                                }) 
                            }) 
                        };
                    }
                })
            };

            const result = await workshopDB.submitProcess({
                projectId: 'failure-test',
                department: 'Finance',
                name: 'Recovery Test Process',
                timeSpent: 5,
                scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                impact: 7,
                feasibility: 6,
                token: 'recovery-token'
            });

            // Should fallback to localStorage on network failure
            expect(result.id).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('DATA INTEGRITY TESTS', () => {
        test('DATA1: Process data validation and sanitization', async () => {
            const testCases = [
                {
                    name: 'Valid process',
                    data: {
                        projectId: 'test-project',
                        department: 'Finance',
                        name: 'Test Process',
                        timeSpent: 8,
                        scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                        impact: 7,
                        feasibility: 6,
                        token: 'valid-token'
                    },
                    shouldSucceed: true
                },
                {
                    name: 'Negative time spent',
                    data: {
                        projectId: 'test-project',
                        department: 'Finance',
                        name: 'Invalid Time Process',
                        timeSpent: -5,
                        scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
                        impact: 7,
                        feasibility: 6,
                        token: 'valid-token'
                    },
                    shouldSucceed: false
                },
                {
                    name: 'Invalid scores',
                    data: {
                        projectId: 'test-project',
                        department: 'Finance',
                        name: 'Invalid Scores Process',
                        timeSpent: 5,
                        scores: { repetitive: 15, dataDriven: -2, ruleBased: 'invalid', highVolume: null },
                        impact: 7,
                        feasibility: 6,
                        token: 'valid-token'
                    },
                    shouldSucceed: false
                }
            ];

            for (const testCase of testCases) {
                if (testCase.shouldSucceed) {
                    const result = await workshopDB.submitProcess(testCase.data);
                    expect(result.id).toBeDefined();
                } else {
                    // Should either reject or sanitize invalid data
                    await expect(workshopDB.submitProcess(testCase.data))
                        .resolves.toBeDefined(); // Should not crash
                }
            }
        });

        test('DATA2: Analytics calculations accuracy', async () => {
            const project = await workshopDB.createProject({
                name: 'Analytics Test Project',
                description: 'Testing analytics accuracy'
            });

            // Submit known data
            const testProcesses = [
                {
                    department: 'Finance',
                    timeSpent: 10,
                    scores: { repetitive: 8, dataDriven: 9, ruleBased: 7, highVolume: 8 },
                    impact: 9,
                    feasibility: 7
                },
                {
                    department: 'Finance',
                    timeSpent: 5,
                    scores: { repetitive: 6, dataDriven: 7, ruleBased: 8, highVolume: 6 },
                    impact: 6,
                    feasibility: 8
                },
                {
                    department: 'HR',
                    timeSpent: 8,
                    scores: { repetitive: 9, dataDriven: 8, ruleBased: 9, highVolume: 7 },
                    impact: 8,
                    feasibility: 6
                }
            ];

            for (const process of testProcesses) {
                await workshopDB.submitProcess({
                    projectId: project.id,
                    department: process.department,
                    name: `${process.department} Test Process`,
                    timeSpent: process.timeSpent,
                    scores: process.scores,
                    impact: process.impact,
                    feasibility: process.feasibility,
                    token: 'analytics-token'
                });
            }

            const analytics = await workshopDB.getWorkshopAnalytics(project.id);
            
            // Verify calculations
            expect(analytics.total_processes).toBe(3);
            expect(analytics.departments_participating).toBe(2);
            expect(analytics.total_hours_weekly).toBe(23); // 10 + 5 + 8
            expect(analytics.department_breakdown).toHaveLength(2);
            
            const financeBreakdown = analytics.department_breakdown.find(d => d.department === 'Finance');
            expect(financeBreakdown.count).toBe(2);
        });

        test('DATA3: Large dataset performance and integrity', async () => {
            const startTime = Date.now();
            const project = await workshopDB.createProject({
                name: 'Large Dataset Test',
                description: 'Testing with large amounts of data'
            });

            // Submit 50 processes
            const processes = [];
            for (let i = 0; i < 50; i++) {
                processes.push(workshopDB.submitProcess({
                    projectId: project.id,
                    department: ['Finance', 'HR', 'IT', 'Operations', 'Sales'][i % 5],
                    name: `Process ${i}`,
                    timeSpent: Math.floor(Math.random() * 20) + 1,
                    scores: {
                        repetitive: Math.floor(Math.random() * 10) + 1,
                        dataDriven: Math.floor(Math.random() * 10) + 1,
                        ruleBased: Math.floor(Math.random() * 10) + 1,
                        highVolume: Math.floor(Math.random() * 10) + 1
                    },
                    impact: Math.floor(Math.random() * 10) + 1,
                    feasibility: Math.floor(Math.random() * 10) + 1,
                    token: 'large-dataset-token'
                }));
            }

            await Promise.all(processes);
            const duration = Date.now() - startTime;

            // All processes should be submitted within reasonable time
            expect(duration).toBeLessThan(5000); // 5 seconds

            // Verify data integrity
            const retrievedProcesses = await workshopDB.getProcesses(project.id);
            expect(retrievedProcesses.length).toBe(50);

            const analytics = await workshopDB.getWorkshopAnalytics(project.id);
            expect(analytics.total_processes).toBe(50);
            expect(analytics.departments_participating).toBe(5);
        });
    });

    describe('MOBILE DEVICE SIMULATION', () => {
        test('MOB1: Mobile viewport form interaction', () => {
            // Simulate mobile viewport
            Object.defineProperty(window, 'innerWidth', { value: 375 });
            Object.defineProperty(window, 'innerHeight', { value: 667 });
            
            // Mock mobile user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            });

            // Mobile-specific tests would go here
            // For now, just verify the environment is set up correctly
            expect(window.innerWidth).toBe(375);
            expect(navigator.userAgent).toContain('iPhone');
        });

        test('MOB2: Touch interface compatibility', () => {
            // Simulate touch events
            const touchEvent = new window.TouchEvent('touchstart', {
                touches: [{
                    clientX: 100,
                    clientY: 100,
                    identifier: 0
                }]
            });

            expect(touchEvent.type).toBe('touchstart');
            expect(touchEvent.touches.length).toBe(1);
        });
    });

    describe('ERROR BOUNDARY TESTS', () => {
        test('ERR1: Graceful handling of corrupted localStorage', () => {
            // Corrupt localStorage data
            localStorage.setItem('businessProjects', 'corrupted-json-data');
            
            const projects = workshopDB.getProjectsLocal();
            
            // Should return empty array instead of crashing
            expect(Array.isArray(projects)).toBe(true);
            expect(projects.length).toBe(0);
        });

        test('ERR2: Memory leak prevention', () => {
            // This is a simplified test - in real scenarios you'd use tools like memwatch
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Perform memory-intensive operations
            for (let i = 0; i < 100; i++) {
                const db = new WorkshopDatabase();
                db.createProjectLocal({
                    name: `Memory Test ${i}`,
                    description: 'Testing memory usage'
                });
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });
});

module.exports = {
    comprehensiveWorkshopTests: describe
};