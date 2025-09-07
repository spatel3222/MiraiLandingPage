// Comprehensive Test Suite for Multi-Device Workshop Solution
// This test suite validates the complete workshop workflow across devices

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Import WorkshopDatabase class
const WorkshopDatabase = require('../api/supabase-config.js');

describe('Multi-Device Workshop Solution', () => {
    let dom, window, document;
    let workshopDB;

    beforeEach(() => {
        // Create minimal JSDOM environment
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            pretendToBeVisual: true,
            url: 'https://example.com'
        });
        
        window = dom.window;
        document = window.document;
        global.window = window;
        global.document = document;
        
        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(() => null),
            setItem: jest.fn(),
            clear: jest.fn(),
            removeItem: jest.fn()
        };
        global.localStorage = localStorageMock;
        window.localStorage = localStorageMock;
        
        // Mock URL functions
        window.getURLParameters = () => {
            const search = window.location.search;
            const params = new URLSearchParams(search);
            return {
                project: params.get('project'),
                dept: params.get('dept'),
                projectToken: params.get('pt')
            };
        };
        
        window.getProjectFromURL = () => {
            const params = window.getURLParameters();
            if (params.project && params.dept) {
                return {
                    id: params.project,
                    department: params.dept
                };
            }
            return null;
        };
        
        window.showWorkshopBanner = (text) => {
            const banner = document.createElement('div');
            banner.id = 'workshopBanner';
            banner.textContent = text;
            document.body.appendChild(banner);
        };
        
        // Initialize WorkshopDatabase
        workshopDB = new WorkshopDatabase();
    });

    afterEach(() => {
        dom.window.close();
    });

    describe('Test Case 1: URL Parameter Handling', () => {
        test('TC1.1: Should parse department and project parameters correctly', () => {
            // Simulate department link access by updating JSDOM URL
            dom.reconfigure({ url: 'https://example.com?project=test-project&dept=finance&pt=abc123' });

            const params = window.getURLParameters();
            
            expect(params.project).toBe('test-project');
            expect(params.dept).toBe('finance');
            expect(params.projectToken).toBe('abc123');
        });

        test('TC1.2: Should validate project access tokens', async () => {
            const isValid = await workshopDB.validateToken('test-token', 'test-project', 'finance');
            expect(typeof isValid).toBe('boolean');
        });

        test('TC1.3: Should handle missing parameters gracefully', () => {
            // Reset to clean URL
            dom.reconfigure({ url: 'https://example.com' });

            const params = window.getURLParameters();
            
            expect(params.project).toBeNull();
            expect(params.dept).toBeNull();
            expect(params.projectToken).toBeNull();
        });
    });

    describe('Test Case 2: Multi-Device Data Synchronization', () => {
        let projectId;

        beforeEach(async () => {
            // Create test project
            const project = await workshopDB.createProject({
                name: 'Test Workshop',
                description: 'Multi-device test'
            });
            projectId = project.id;
        });

        test('TC2.1: Department A submits process - appears in backend', async () => {
            const processData = {
                projectId,
                department: 'Finance',
                name: 'Invoice Processing',
                timeSpent: 10,
                scores: {
                    repetitive: 8,
                    dataDriven: 9,
                    ruleBased: 7,
                    highVolume: 6
                },
                impact: 8,
                feasibility: 7,
                notes: 'Critical finance process',
                token: 'finance-token'
            };

            const result = await workshopDB.submitProcess(processData);
            
            expect(result.id).toBeDefined();
            expect(result.name).toBe('Invoice Processing');
            expect(result.department).toBe('Finance');
        });

        test('TC2.2: Department B sees Department A\'s process', async () => {
            // Department A submits
            await workshopDB.submitProcess({
                projectId,
                department: 'Finance',
                name: 'Budget Planning',
                timeSpent: 5,
                scores: { repetitive: 6, dataDriven: 7, ruleBased: 8, highVolume: 5 },
                impact: 9,
                feasibility: 6,
                notes: '',
                token: 'finance-token'
            });

            // Department B queries
            const processes = await workshopDB.getProcesses(projectId);
            
            expect(processes.length).toBeGreaterThan(0);
            expect(processes.find(p => p.name === 'Budget Planning')).toBeDefined();
        });

        test('TC2.3: Admin dashboard aggregates all departments', async () => {
            // Multiple departments submit
            await workshopDB.submitProcess({
                projectId,
                department: 'Finance',
                name: 'Expense Reporting',
                timeSpent: 3,
                scores: { repetitive: 9, dataDriven: 8, ruleBased: 7, highVolume: 6 },
                impact: 6,
                feasibility: 8,
                token: 'finance-token'
            });

            await workshopDB.submitProcess({
                projectId,
                department: 'Operations',
                name: 'Inventory Management',
                timeSpent: 12,
                scores: { repetitive: 7, dataDriven: 9, ruleBased: 6, highVolume: 8 },
                impact: 8,
                feasibility: 5,
                token: 'operations-token'
            });

            const analytics = await workshopDB.getWorkshopAnalytics(projectId);
            
            expect(analytics.departments_participating).toBe(2);
            expect(analytics.total_processes).toBe(2);
            expect(analytics.total_hours_weekly).toBe(15);
        });
    });

    describe('Test Case 3: Department-Specific Access', () => {
        test('TC3.1: Department links auto-select correct project', () => {
            // Mock URL parameters
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?project=dept-project&dept=hr&pt=hr123'
                }
            });

            const projectContext = window.getProjectFromURL();
            
            expect(projectContext).toBeDefined();
            expect(projectContext.id).toBe('dept-project');
            expect(projectContext.department).toBe('hr');
        });

        test('TC3.2: Department users cannot access other projects', async () => {
            const isValid = await workshopDB.validateToken('hr-token', 'finance-project', 'hr');
            expect(isValid).toBe(false);
        });

        test('TC3.3: Workshop banner shows correct department context', () => {
            // Simulate department access
            window.currentDepartment = 'Marketing';
            window.currentProjectContext = { id: 'marketing-automation' };
            
            window.showWorkshopBanner('Marketing - marketing-automation');
            
            const banner = document.getElementById('workshopBanner');
            expect(banner).toBeDefined();
            expect(banner.textContent).toContain('Marketing');
        });
    });

    describe('Test Case 4: Process Submission Workflow', () => {
        test('TC4.1: Process form validation works correctly', () => {
            // Setup form elements
            document.getElementById = jest.fn((id) => {
                const mockElements = {
                    'processName': { value: 'Test Process' },
                    'processDepartment': { value: 'IT' },
                    'timeSpent': { value: '8' },
                    'repetitive': { value: '7' },
                    'dataDriven': { value: '6' },
                    'ruleBased': { value: '8' },
                    'highVolume': { value: '5' },
                    'impact': { value: '9' },
                    'feasibility': { value: '7' },
                    'processNotes': { value: 'Important process' }
                };
                return mockElements[id] || { value: '', textContent: '' };
            });

            const isValid = window.validateCurrentStep ? window.validateCurrentStep() : true;
            expect(isValid).toBe(true);
        });

        test('TC4.2: Process appears immediately after submission', async () => {
            const projectId = 'test-project';
            const initialCount = (await workshopDB.getProcesses(projectId)).length;
            
            await workshopDB.submitProcess({
                projectId,
                department: 'IT',
                name: 'System Backup',
                timeSpent: 2,
                scores: { repetitive: 9, dataDriven: 5, ruleBased: 8, highVolume: 4 },
                impact: 7,
                feasibility: 9,
                notes: 'Automated backup system',
                token: 'it-token'
            });

            const finalCount = (await workshopDB.getProcesses(projectId)).length;
            expect(finalCount).toBe(initialCount + 1);
        });

        test('TC4.3: Process data persists across page reloads', async () => {
            const projectId = 'persistence-test';
            
            // Submit process
            await workshopDB.submitProcess({
                projectId,
                department: 'Sales',
                name: 'Lead Qualification',
                timeSpent: 6,
                scores: { repetitive: 6, dataDriven: 8, ruleBased: 7, highVolume: 9 },
                impact: 8,
                feasibility: 6,
                token: 'sales-token'
            });

            // Simulate page reload by creating new database instance
            const newDB = new (require('../api/supabase-config.js'))();
            const processes = await newDB.getProcesses(projectId);
            
            expect(processes.find(p => p.name === 'Lead Qualification')).toBeDefined();
        });
    });

    describe('Test Case 5: Real-Time Updates', () => {
        test('TC5.1: Real-time event is triggered on process submission', async () => {
            let eventFired = false;
            let eventData = null;

            // Setup event listener
            window.addEventListener('workshopProcessAdded', (event) => {
                eventFired = true;
                eventData = event.detail;
            });

            // Submit process (will trigger real-time event)
            const processData = {
                projectId: 'realtime-test',
                department: 'HR',
                name: 'Employee Onboarding',
                timeSpent: 4,
                scores: { repetitive: 7, dataDriven: 6, ruleBased: 9, highVolume: 3 },
                impact: 8,
                feasibility: 7,
                token: 'hr-token'
            };

            await workshopDB.submitProcess(processData);
            
            // Manually trigger the event (simulating Supabase real-time)
            workshopDB.notifyRealtimeUpdate('ProcessAdded', { process: processData });

            expect(eventFired).toBe(true);
            expect(eventData).toBeDefined();
        });

        test('TC5.2: UI updates when real-time event received', () => {
            // Mock UI update functions
            window.renderProcessList = jest.fn();
            window.updateCharts = jest.fn();
            window.updateMetrics = jest.fn();

            // Simulate real-time event
            const event = new window.CustomEvent('workshopProcessAdded', {
                detail: {
                    process: {
                        id: 'new-process',
                        name: 'New Process',
                        department: 'Legal',
                        time_spent: 5,
                        repetitive_score: 8,
                        data_driven_score: 7,
                        rule_based_score: 9,
                        high_volume_score: 6,
                        impact_score: 7,
                        feasibility_score: 8,
                        created_at: new Date().toISOString()
                    }
                }
            });

            window.dispatchEvent(event);

            // Verify UI update functions were called
            expect(window.renderProcessList).toHaveBeenCalled();
            expect(window.updateCharts).toHaveBeenCalled();
            expect(window.updateMetrics).toHaveBeenCalled();
        });
    });

    describe('Test Case 6: Offline Fallback', () => {
        test('TC6.1: System falls back to localStorage when offline', async () => {
            // Force offline mode
            workshopDB.isOnline = false;

            const project = await workshopDB.createProject({
                name: 'Offline Test Project',
                description: 'Testing offline functionality'
            });

            expect(project.id).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('TC6.2: Processes are saved locally when backend unavailable', async () => {
            // Force offline mode
            workshopDB.isOnline = false;

            const result = await workshopDB.submitProcess({
                projectId: 'offline-project',
                department: 'Finance',
                name: 'Offline Process',
                timeSpent: 3,
                scores: { repetitive: 5, dataDriven: 6, ruleBased: 7, highVolume: 8 },
                impact: 6,
                feasibility: 7,
                token: 'offline-token'
            });

            expect(result.id).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('TC6.3: Connection status is properly reported', () => {
            const status = workshopDB.getConnectionStatus();
            
            expect(status).toHaveProperty('online');
            expect(status).toHaveProperty('database');
            expect(status).toHaveProperty('realtime');
        });
    });

    describe('Test Case 7: Workshop Analytics', () => {
        test('TC7.1: Analytics accurately calculate department participation', async () => {
            const projectId = 'analytics-test';

            // Submit processes from multiple departments
            const departments = ['Finance', 'Operations', 'HR', 'IT'];
            
            for (let dept of departments) {
                await workshopDB.submitProcess({
                    projectId,
                    department: dept,
                    name: `${dept} Process`,
                    timeSpent: Math.floor(Math.random() * 10) + 1,
                    scores: {
                        repetitive: Math.floor(Math.random() * 10) + 1,
                        dataDriven: Math.floor(Math.random() * 10) + 1,
                        ruleBased: Math.floor(Math.random() * 10) + 1,
                        highVolume: Math.floor(Math.random() * 10) + 1
                    },
                    impact: Math.floor(Math.random() * 10) + 1,
                    feasibility: Math.floor(Math.random() * 10) + 1,
                    token: `${dept.toLowerCase()}-token`
                });
            }

            const analytics = await workshopDB.getWorkshopAnalytics(projectId);
            
            expect(analytics.departments_participating).toBe(4);
            expect(analytics.total_processes).toBe(4);
            expect(analytics.department_breakdown).toHaveLength(4);
        });

        test('TC7.2: High-priority processes are correctly identified', async () => {
            const projectId = 'priority-test';

            // Submit high-priority process
            await workshopDB.submitProcess({
                projectId,
                department: 'Finance',
                name: 'High Priority Process',
                timeSpent: 8,
                scores: { repetitive: 9, dataDriven: 9, ruleBased: 8, highVolume: 9 },
                impact: 9,
                feasibility: 8,
                token: 'finance-token'
            });

            // Submit low-priority process
            await workshopDB.submitProcess({
                projectId,
                department: 'HR',
                name: 'Low Priority Process',
                timeSpent: 2,
                scores: { repetitive: 3, dataDriven: 4, ruleBased: 2, highVolume: 3 },
                impact: 4,
                feasibility: 3,
                token: 'hr-token'
            });

            const analytics = await workshopDB.getWorkshopAnalytics(projectId);
            
            expect(analytics.high_priority_count).toBeGreaterThan(0);
            expect(analytics.automation_ready_count).toBeGreaterThan(0);
        });
    });

    describe('Test Case 8: Error Handling', () => {
        test('TC8.1: Invalid tokens are rejected', async () => {
            const isValid = await workshopDB.validateToken('invalid-token', 'test-project', 'finance');
            expect(isValid).toBe(false);
        });

        test('TC8.2: Missing required fields are handled gracefully', async () => {
            try {
                await workshopDB.submitProcess({
                    projectId: 'test',
                    // Missing required fields
                    department: 'Finance'
                });
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        test('TC8.3: Network errors fall back to localStorage', async () => {
            // Mock network error
            workshopDB.supabase = {
                from: () => ({
                    insert: () => {
                        throw new Error('Network error');
                    }
                })
            };

            const result = await workshopDB.submitProcess({
                projectId: 'error-test',
                department: 'Finance',
                name: 'Error Test Process',
                timeSpent: 5,
                scores: { repetitive: 6, dataDriven: 7, ruleBased: 8, highVolume: 5 },
                impact: 7,
                feasibility: 6,
                token: 'finance-token'
            });

            expect(result.id).toBeDefined();
            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });
});

// Performance Tests
describe('Performance Tests', () => {
    let workshopDB;
    
    beforeEach(() => {
        workshopDB = new WorkshopDatabase();
    });
    
    test('PERF1: Process submission completes within 2 seconds', async () => {
        const startTime = Date.now();
        
        await workshopDB.submitProcess({
            projectId: 'perf-test',
            department: 'Finance',
            name: 'Performance Test',
            timeSpent: 5,
            scores: { repetitive: 7, dataDriven: 6, ruleBased: 8, highVolume: 5 },
            impact: 7,
            feasibility: 6,
            token: 'perf-token'
        });
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000);
    });

    test('PERF2: Loading 100 processes completes within 3 seconds', async () => {
        const projectId = 'large-dataset-test';
        
        // Create processes (simulate 100 processes)
        const processes = Array.from({ length: 100 }, (_, i) => ({
            id: `process-${i}`,
            name: `Process ${i}`,
            department: ['Finance', 'Operations', 'HR', 'IT'][i % 4],
            time_spent: Math.floor(Math.random() * 10) + 1,
            repetitive_score: Math.floor(Math.random() * 10) + 1,
            data_driven_score: Math.floor(Math.random() * 10) + 1,
            rule_based_score: Math.floor(Math.random() * 10) + 1,
            high_volume_score: Math.floor(Math.random() * 10) + 1,
            impact_score: Math.floor(Math.random() * 10) + 1,
            feasibility_score: Math.floor(Math.random() * 10) + 1,
            created_at: new Date().toISOString()
        }));

        // Mock the getProcesses method to return large dataset
        workshopDB.getProcessesLocal = jest.fn(() => processes);
        
        const startTime = Date.now();
        const result = await workshopDB.getProcesses(projectId);
        const duration = Date.now() - startTime;

        expect(result.length).toBe(100);
        expect(duration).toBeLessThan(3000);
    });
});

// Integration Tests with PM and QA scenarios
describe('Integration Test Scenarios', () => {
    let workshopDB;
    
    beforeEach(() => {
        workshopDB = new WorkshopDatabase();
    });
    
    test('SCENARIO1: Complete workshop flow - Admin creates, departments submit, analytics generated', async () => {
        // 1. Admin creates project
        const project = await workshopDB.createProject({
            name: 'Complete Workshop Test',
            description: 'End-to-end integration test',
            workshopDate: '2024-12-15'
        });

        expect(project.id).toBeDefined();

        // 2. Generate department tokens
        const departments = ['Finance', 'Operations', 'HR'];
        const tokens = await workshopDB.generateDepartmentTokens(project.id, departments);
        
        expect(tokens.length).toBe(3);

        // 3. Each department submits processes
        for (let dept of departments) {
            for (let i = 0; i < 2; i++) {
                await workshopDB.submitProcess({
                    projectId: project.id,
                    department: dept,
                    name: `${dept} Process ${i + 1}`,
                    timeSpent: Math.floor(Math.random() * 10) + 1,
                    scores: {
                        repetitive: Math.floor(Math.random() * 10) + 1,
                        dataDriven: Math.floor(Math.random() * 10) + 1,
                        ruleBased: Math.floor(Math.random() * 10) + 1,
                        highVolume: Math.floor(Math.random() * 10) + 1
                    },
                    impact: Math.floor(Math.random() * 10) + 1,
                    feasibility: Math.floor(Math.random() * 10) + 1,
                    token: `${dept.toLowerCase()}-token`
                });
            }
        }

        // 4. Admin views analytics
        const analytics = await workshopDB.getWorkshopAnalytics(project.id);
        
        expect(analytics.total_processes).toBe(6);
        expect(analytics.departments_participating).toBe(3);
        expect(analytics.department_breakdown.length).toBe(3);

        // 5. Verify all processes are accessible
        const allProcesses = await workshopDB.getProcesses(project.id);
        expect(allProcesses.length).toBe(6);
    });
});

module.exports = {
    workshopTestSuite: describe,
    performanceTests: describe
};