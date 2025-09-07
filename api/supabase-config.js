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
                const { data, error } = await this.supabase
                    .from('processes')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data || [];
            } catch (error) {
                console.error('❌ Process fetch failed:', error);
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
}

// Initialize the global database instance
window.workshopDB = new WorkshopDatabase();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkshopDatabase;
}