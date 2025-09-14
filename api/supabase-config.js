// Supabase Configuration for Business Process Workshop Tool
// This module handles all database operations with fallback to localStorage

class WorkshopDatabase {
    constructor() {
        this.supabase = null;
        this.isOnline = false;
        this.initializeSupabase();
        this.setupRealtimeListeners();
    }

    initializeSupabase() {
        try {
            // Initialize Supabase client - Replace with your actual Supabase URL and anon key
            const SUPABASE_URL = 'https://fvyghgvshobufpgaclbs.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eWdoZ3ZzaG9idWZwZ2FjbGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDI1MjgsImV4cCI6MjA3MjcxODUyOH0.RR_PavED-XHko85FsuLVWfWapVIJZ3l3vRPq4lszmfM';
            
            if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://your-project.supabase.co') {
                this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                this.isOnline = true;
                console.log('✅ Supabase connected successfully');
            } else {
                console.log('📱 Running in offline mode with localStorage');
                this.isOnline = false;
            }
        } catch (error) {
            console.warn('⚠️ Supabase initialization failed, falling back to localStorage:', error);
            this.isOnline = false;
        }
    }

    // Project Management Operations
    async createProject(projectData) {
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('projects')
                    .insert([{
                        name: projectData.name,
                        description: projectData.description,
                        workshop_date: projectData.workshopDate,
                        facilitator_email: projectData.facilitatorEmail,
                        metadata: projectData.metadata || {}
                    }])
                    .select()
                    .single();

                if (error) throw error;
                
                console.log('✅ Project created in database:', data.id);
                return data;
            } catch (error) {
                console.error('❌ Database project creation failed:', error);
                return this.createProjectLocal(projectData);
            }
        } else {
            return this.createProjectLocal(projectData);
        }
    }

    createProjectLocal(projectData) {
        const project = {
            id: this.generateUUID(),
            ...projectData,
            created_at: new Date().toISOString()
        };
        
        const projects = JSON.parse(localStorage.getItem('businessProjects') || '[]');
        projects.push(project);
        localStorage.setItem('businessProjects', JSON.stringify(projects));
        
        console.log('💾 Project created locally:', project.id);
        return project;
    }

    async getProjects() {
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Database project fetch failed:', error);
                return this.getProjectsLocal();
            }
        } else {
            return this.getProjectsLocal();
        }
    }

    getProjectsLocal() {
        return JSON.parse(localStorage.getItem('businessProjects') || '[]');
    }

    // Department Token Management
    async generateDepartmentTokens(projectId, departments) {
        if (this.isOnline && this.supabase) {
            try {
                const tokens = departments.map(dept => ({
                    project_id: projectId,
                    department: dept,
                    token: this.generateSecureToken(projectId, dept)
                }));

                const { data, error } = await this.supabase
                    .from('department_tokens')
                    .upsert(tokens, { 
                        onConflict: 'project_id,department',
                        ignoreDuplicates: false 
                    })
                    .select();

                if (error) throw error;

                console.log('✅ Department tokens generated:', data.length);
                return data;
            } catch (error) {
                console.error('❌ Token generation failed:', error);
                return this.generateTokensLocal(projectId, departments);
            }
        } else {
            return this.generateTokensLocal(projectId, departments);
        }
    }

    generateTokensLocal(projectId, departments) {
        const tokens = departments.map(dept => ({
            id: this.generateUUID(),
            project_id: projectId,
            department: dept,
            token: this.generateSecureToken(projectId, dept),
            created_at: new Date().toISOString(),
            is_active: true
        }));

        localStorage.setItem(`tokens_${projectId}`, JSON.stringify(tokens));
        console.log('💾 Tokens generated locally:', tokens.length);
        return tokens;
    }

    async validateToken(token, projectId, department) {
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .rpc('validate_department_token', {
                        p_token: token,
                        p_project_id: projectId,
                        p_department: department
                    });

                if (error) throw error;
                return data === true;
            } catch (error) {
                console.error('❌ Token validation failed:', error);
                return this.validateTokenLocal(token, projectId, department);
            }
        } else {
            return this.validateTokenLocal(token, projectId, department);
        }
    }

    validateTokenLocal(token, projectId, department) {
        const tokens = JSON.parse(localStorage.getItem(`tokens_${projectId}`) || '[]');
        const validToken = tokens.find(t => 
            t.token === token && 
            t.department === department && 
            t.is_active
        );
        return !!validToken;
    }

    // Process Management Operations
    async submitProcess(processData) {
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('processes')
                    .insert([{
                        project_id: processData.projectId,
                        department: processData.department,
                        name: processData.name,
                        custom_department: processData.customDepartment,
                        time_spent: processData.timeSpent,
                        repetitive_score: processData.scores.repetitive,
                        data_driven_score: processData.scores.dataDriven,
                        rule_based_score: processData.scores.ruleBased,
                        high_volume_score: processData.scores.highVolume,
                        impact_score: processData.impact,
                        feasibility_score: processData.feasibility,
                        notes: processData.notes,
                        submitted_by_token: processData.token
                    }])
                    .select()
                    .single();

                if (error) throw error;
                
                console.log('✅ Process submitted to database:', data.id);
                
                // Trigger real-time update
                this.notifyRealtimeUpdate('process_submitted', data);
                
                return data;
            } catch (error) {
                console.error('❌ Process submission failed:', error);
                return this.submitProcessLocal(processData);
            }
        } else {
            return this.submitProcessLocal(processData);
        }
    }

    submitProcessLocal(processData) {
        const process = {
            id: this.generateUUID(),
            project_id: processData.projectId,
            department: processData.department,
            name: processData.name,
            custom_department: processData.customDepartment,
            time_spent: processData.timeSpent,
            repetitive_score: processData.scores.repetitive,
            data_driven_score: processData.scores.dataDriven,
            rule_based_score: processData.scores.ruleBased,
            high_volume_score: processData.scores.highVolume,
            impact_score: processData.impact,
            feasibility_score: processData.feasibility,
            notes: processData.notes,
            submitted_by_token: processData.token,
            created_at: new Date().toISOString(),
            automation_avg: (
                processData.scores.repetitive + 
                processData.scores.dataDriven + 
                processData.scores.ruleBased + 
                processData.scores.highVolume
            ) / 4,
            priority_score: (
                processData.impact * 0.4 + 
                processData.feasibility * 0.3 + 
                ((processData.scores.repetitive + processData.scores.dataDriven + 
                  processData.scores.ruleBased + processData.scores.highVolume) / 4) * 0.3
            )
        };

        const processes = JSON.parse(localStorage.getItem(`processes_${processData.projectId}`) || '[]');
        processes.push(process);
        localStorage.setItem(`processes_${processData.projectId}`, JSON.stringify(processes));

        console.log('💾 Process submitted locally:', process.id);
        return process;
    }

    async getProcesses(projectId) {
        if (this.isOnline && this.supabase) {
            try {
                console.log('🔍 Fetching processes for project:', projectId);
                
                // Try to query processes table - handle potential schema issues
                let query = this.supabase.from('processes');
                
                // First check if table exists with a simple select
                const testQuery = await this.supabase
                    .from('processes')
                    .select('id')
                    .limit(1);
                    
                if (testQuery.error) {
                    console.warn('⚠️ Processes table might not exist:', testQuery.error.message);
                    throw new Error('Processes table not accessible');
                }
                
                // Now try the full query
                const { data, error } = await this.supabase
                    .from('processes')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Supabase error details:', error);
                    console.error('❌ Error message:', error.message);
                    console.error('❌ Error details:', error.details);
                    throw error;
                }
                
                console.log('✅ Processes fetched successfully:', data?.length || 0);
                
                // Map Supabase field names to dashboard field names
                const mappedData = (data || []).map(process => ({
                    id: process.id,
                    name: process.name,
                    department: process.department,
                    custom_department: process.custom_department,
                    
                    // Map score fields - Supabase uses underscore format
                    impact: process.impact_score || 0,
                    feasibility: process.feasibility_score || 0,
                    timeSpent: process.time_spent || 0,
                    
                    // Map automation scores
                    scores: {
                        repetitive: process.repetitive_score || 0,
                        dataDriven: process.data_driven_score || 0,
                        ruleBased: process.rule_based_score || 0,
                        highVolume: process.high_volume_score || 0
                    },
                    
                    // Additional fields
                    notes: process.notes || '',
                    created_at: process.created_at,
                    project_id: process.project_id,
                    
                    // Calculate derived fields
                    automation_avg: ((process.repetitive_score || 0) + 
                                    (process.data_driven_score || 0) + 
                                    (process.rule_based_score || 0) + 
                                    (process.high_volume_score || 0)) / 4,
                    priority_score: ((process.impact_score || 0) * 0.4 + 
                                    (process.feasibility_score || 0) * 0.3 + 
                                    (((process.repetitive_score || 0) + 
                                      (process.data_driven_score || 0) + 
                                      (process.rule_based_score || 0) + 
                                      (process.high_volume_score || 0)) / 4) * 0.3)
                }));
                
                console.log('📊 Mapped process data:', mappedData.length, 'processes');
                if (mappedData.length > 0) {
                    console.log('📊 Sample mapped process:', {
                        name: mappedData[0].name,
                        impact: mappedData[0].impact,
                        feasibility: mappedData[0].feasibility
                    });
                }
                
                return mappedData;
            } catch (error) {
                console.error('❌ Process fetch failed:', error);
                console.warn('⚠️ Falling back to local storage for project:', projectId);
                return this.getProcessesLocal(projectId);
            }
        } else {
            return this.getProcessesLocal(projectId);
        }
    }

    getProcessesLocal(projectId) {
        return JSON.parse(localStorage.getItem(`processes_${projectId}`) || '[]');
    }

    async getWorkshopAnalytics(projectId) {
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .rpc('get_workshop_stats', { p_project_id: projectId });

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('❌ Analytics fetch failed:', error);
                return this.getAnalyticsLocal(projectId);
            }
        } else {
            return this.getAnalyticsLocal(projectId);
        }
    }

    getAnalyticsLocal(projectId) {
        const processes = this.getProcessesLocal(projectId);
        const departments = [...new Set(processes.map(p => p.department))];
        
        return {
            total_processes: processes.length,
            departments_participating: departments.length,
            high_priority_count: processes.filter(p => p.priority_score >= 7).length,
            automation_ready_count: processes.filter(p => p.automation_avg >= 7).length,
            total_hours_weekly: processes.reduce((sum, p) => sum + p.time_spent, 0),
            estimated_annual_savings: processes
                .filter(p => p.automation_avg >= 7)
                .reduce((sum, p) => sum + (p.time_spent * 52 * 50), 0),
            avg_automation_score: processes.length > 0 
                ? processes.reduce((sum, p) => sum + p.automation_avg, 0) / processes.length 
                : 0,
            department_breakdown: departments.map(dept => ({
                department: dept,
                count: processes.filter(p => p.department === dept).length,
                avg_score: processes.filter(p => p.department === dept)
                    .reduce((sum, p) => sum + p.automation_avg, 0) / 
                    Math.max(processes.filter(p => p.department === dept).length, 1)
            }))
        };
    }

    // Real-time Updates
    setupRealtimeListeners() {
        if (!this.isOnline || !this.supabase) return;

        try {
            // Listen for new processes
            const processChannel = this.supabase
                .channel('processes-changes')
                .on('postgres_changes', 
                    { event: 'INSERT', schema: 'public', table: 'processes' },
                    (payload) => {
                        console.log('🔄 New process received:', payload.new);
                        this.handleRealtimeProcessUpdate(payload.new);
                    }
                )
                .subscribe();

            console.log('👂 Real-time listeners activated');
        } catch (error) {
            console.warn('⚠️ Real-time setup failed:', error);
        }
    }

    handleRealtimeProcessUpdate(newProcess) {
        // Trigger custom events for the dashboard to update
        const event = new CustomEvent('workshopProcessAdded', {
            detail: { process: newProcess }
        });
        window.dispatchEvent(event);
    }

    notifyRealtimeUpdate(eventType, data) {
        const event = new CustomEvent(`workshop${eventType}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }

    // Utility Methods
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateSecureToken(projectId, department) {
        // Simple token generation - in production, use crypto.subtle or similar
        const data = `${projectId}-${department}-${Date.now()}`;
        return btoa(data).replace(/[+/=]/g, '').substring(0, 32);
    }

    // URL Generation for Department Links
    generateDepartmentURL(projectId, department, baseUrl = window.location.origin) {
        if (this.isOnline) {
            // Use database-generated URLs
            return `${baseUrl}/business-automation-dashboard.html?project=${projectId}&dept=${department}&pt=db_token`;
        } else {
            // Use localStorage-based URLs
            const token = this.generateSecureToken(projectId, department);
            return `${baseUrl}/business-automation-dashboard.html?project=${projectId}&dept=${department}&pt=${token}`;
        }
    }

    // Connection Status
    isConnected() {
        return this.isOnline;
    }

    getConnectionStatus() {
        return {
            online: this.isOnline,
            database: this.isOnline ? 'Supabase' : 'localStorage',
            realtime: this.isOnline ? 'Active' : 'Offline'
        };
    }

    // Delete Operations
    async deleteProject(projectId) {
        if (this.isOnline && this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('projects')
                    .delete()
                    .eq('id', projectId);

                if (error) throw error;
                
                console.log('✅ Project deleted from Supabase:', projectId);
                return { success: true };
            } catch (error) {
                console.error('❌ Failed to delete project from Supabase:', error);
                throw error;
            }
        } else {
            // Remove from localStorage
            const projects = JSON.parse(localStorage.getItem('businessProjects') || '[]');
            const updatedProjects = projects.filter(p => p.id !== projectId);
            localStorage.setItem('businessProjects', JSON.stringify(updatedProjects));
            console.log('💾 Project deleted from localStorage:', projectId);
            return { success: true };
        }
    }

    async deleteProcess(processId) {
        if (this.isOnline && this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('processes')
                    .delete()
                    .eq('id', processId);

                if (error) throw error;
                
                console.log('✅ Process deleted from Supabase:', processId);
                return { success: true };
            } catch (error) {
                console.error('❌ Failed to delete process from Supabase:', error);
                throw error;
            }
        } else {
            console.log('📱 Process delete operation not needed for localStorage mode');
            return { success: true };
        }
    }

    async deleteDepartmentTokens(projectId) {
        if (this.isOnline && this.supabase) {
            try {
                const { error } = await this.supabase
                    .from('department_tokens')
                    .delete()
                    .eq('project_id', projectId);

                if (error) throw error;
                
                console.log('✅ Department tokens deleted from Supabase for project:', projectId);
                return { success: true };
            } catch (error) {
                console.error('❌ Failed to delete department tokens from Supabase:', error);
                throw error;
            }
        } else {
            // Remove from localStorage
            localStorage.removeItem(`tokens_${projectId}`);
            console.log('💾 Department tokens deleted from localStorage for project:', projectId);
            return { success: true };
        }
    }

    // Bulk Operations
    async saveProcesses(projectId, processesArray) {
        if (this.isOnline && this.supabase) {
            try {
                // For Supabase, we don't need bulk save since processes are submitted individually
                // This method exists for compatibility with the dashboard's saveProcesses() calls
                console.log('📝 Supabase processes managed individually, no bulk save needed');
                return { success: true };
            } catch (error) {
                console.error('❌ Supabase saveProcesses error:', error);
                throw error;
            }
        } else {
            // Save to localStorage
            try {
                localStorage.setItem(`processes_${projectId}`, JSON.stringify(processesArray));
                console.log('💾 Processes saved to localStorage:', processesArray.length);
                return { success: true };
            } catch (error) {
                console.error('❌ Failed to save processes to localStorage:', error);
                throw error;
            }
        }
    }

    // Update Operations
    async updateProject(projectId, updates) {
        if (this.isOnline && this.supabase) {
            try {
                const updateData = {
                    name: updates.name,
                    description: updates.description || updates.clientName,
                    metadata: { 
                        ...updates.metadata,
                        clientName: updates.clientName 
                    }
                };
                
                console.log('🔄 Supabase updateProject - projectId:', projectId);
                console.log('🔄 Supabase updateProject - updateData:', updateData);
                
                const { data, error } = await this.supabase
                    .from('projects')
                    .update(updateData)
                    .eq('id', projectId)
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Supabase update error:', error);
                    throw error;
                }
                
                console.log('✅ Project updated in Supabase:', projectId);
                console.log('✅ Updated project data returned:', data);
                return data;
            } catch (error) {
                console.error('❌ Failed to update project in Supabase:', error);
                throw error;
            }
        } else {
            // Update in localStorage
            const projects = JSON.parse(localStorage.getItem('businessProjects') || '[]');
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                projects[projectIndex] = { ...projects[projectIndex], ...updates };
                projects[projectIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('businessProjects', JSON.stringify(projects));
                console.log('💾 Project updated in localStorage:', projectId);
                return projects[projectIndex];
            }
            throw new Error('Project not found');
        }
    }

    // Database Reset Functions
    async resetDatabase() {
        console.log('🔄 Resetting database...');
        
        if (this.isOnline && this.supabase) {
            return this.resetSupabaseData();
        } else {
            return this.resetLocalStorage();
        }
    }

    async resetSupabaseData() {
        try {
            // Delete all processes
            const { error: processError } = await this.supabase
                .from('processes')
                .delete()
                .neq('id', 'dummy'); // Delete all records

            if (processError) throw processError;

            // Delete all department tokens
            const { error: tokenError } = await this.supabase
                .from('department_tokens')
                .delete()
                .neq('id', 'dummy'); // Delete all records

            if (tokenError) throw tokenError;

            // Delete all projects
            const { error: projectError } = await this.supabase
                .from('projects')
                .delete()
                .neq('id', 'dummy'); // Delete all records

            if (projectError) throw projectError;

            console.log('✅ Supabase database reset successfully');
            return { success: true, message: 'Database reset successfully' };
        } catch (error) {
            console.error('❌ Failed to reset Supabase database:', error);
            // Fallback to localStorage reset
            return this.resetLocalStorage();
        }
    }

    resetLocalStorage() {
        try {
            // Get all localStorage keys related to the workshop app
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key === 'businessProjects' ||
                    key === 'currentProjectId' ||
                    key === 'currentProjectData' ||
                    key.startsWith('tokens_') ||
                    key.startsWith('processes_')
                )) {
                    keysToRemove.push(key);
                }
            }

            // Remove all workshop-related data
            keysToRemove.forEach(key => localStorage.removeItem(key));

            console.log('✅ localStorage reset successfully');
            console.log('🗑️ Removed keys:', keysToRemove);
            
            return { 
                success: true, 
                message: `Database reset successfully. Removed ${keysToRemove.length} items from localStorage.`,
                removedKeys: keysToRemove
            };
        } catch (error) {
            console.error('❌ Failed to reset localStorage:', error);
            return { success: false, message: 'Failed to reset database', error };
        }
    }
}

// Initialize the global database instance
window.workshopDB = new WorkshopDatabase();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopDatabase;
}