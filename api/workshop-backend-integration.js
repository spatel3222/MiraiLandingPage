// Workshop Backend Integration
// This file integrates your existing dashboard with the Supabase backend

class WorkshopBackend {
    constructor() {
        this.supabaseManager = new SupabaseManager();
        this.currentProjectId = null;
        this.currentToken = null;
        this.isAdmin = false;
        this.realtimeSubscription = null;
        
        this.initializeFromURL();
        this.setupEventListeners();
    }

    // Initialize based on URL parameters
    initializeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentToken = urlParams.get('token');
        this.currentProjectId = urlParams.get('project');
        
        if (this.currentToken) {
            this.validateToken();
        } else if (this.currentProjectId) {
            this.isAdmin = true;
            this.setupAdminView();
        }
    }

    // Validate department token
    async validateToken() {
        try {
            const { data, error } = await this.supabaseManager.supabase
                .rpc('validate_department_token', { token_input: this.currentToken });

            if (error || !data || data.length === 0) {
                this.showError('Invalid or expired token. Please contact your workshop administrator.');
                return;
            }

            const tokenInfo = data[0];
            this.currentProjectId = tokenInfo.project_id;
            this.currentDepartment = tokenInfo.department_name;
            
            this.setupDepartmentView();
            this.subscribeToRealTimeUpdates();
        } catch (error) {
            console.error('Token validation error:', error);
            this.showError('Unable to validate access. Please try again.');
        }
    }

    // Setup department-specific view
    setupDepartmentView() {
        // Customize UI for department users
        const headerTitle = document.querySelector('h1');
        if (headerTitle && this.currentDepartment) {
            headerTitle.textContent = `${this.currentDepartment} - Business Process Submission`;
        }

        // Hide admin-only features
        const adminElements = document.querySelectorAll('[data-admin-only]');
        adminElements.forEach(el => el.style.display = 'none');

        // Show department-specific welcome message
        this.showDepartmentWelcome();
    }

    // Setup admin view with all projects
    setupAdminView() {
        this.subscribeToRealTimeUpdates();
        this.loadAdminDashboard();
    }

    // Show welcome message for departments
    showDepartmentWelcome() {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg';
        welcomeMessage.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Welcome, ${this.currentDepartment} Team!</h3>
                    <div class="mt-2 text-sm text-blue-700">
                        <p>Please submit your department's business processes for automation analysis. Your submissions will be visible to all workshop participants in real-time.</p>
                    </div>
                </div>
            </div>
        `;
        
        const mainContent = document.querySelector('.dashboard-container');
        if (mainContent && mainContent.firstChild) {
            mainContent.insertBefore(welcomeMessage, mainContent.firstChild);
        }
    }

    // Enhanced process submission with backend integration
    async submitProcess(processData) {
        try {
            // Add department and token info
            const enhancedData = {
                ...processData,
                projectId: this.currentProjectId,
                submittedBy: this.currentDepartment || 'Admin',
                submissionSource: this.isAdmin ? 'admin' : 'department'
            };

            let result;
            if (this.supabaseManager.useLocalStorageFallback) {
                result = await this.supabaseManager.submitProcessLocal(enhancedData);
            } else {
                result = await this.supabaseManager.submitProcess(enhancedData, this.currentToken);
            }

            // Show success message
            this.showSuccess('Process submitted successfully! Other participants can see it in real-time.');
            
            // Refresh dashboard if admin
            if (this.isAdmin) {
                this.refreshAdminDashboard();
            }

            return result;
        } catch (error) {
            console.error('Process submission error:', error);
            this.showError('Failed to submit process. Please try again.');
            throw error;
        }
    }

    // Load admin dashboard with all processes
    async loadAdminDashboard() {
        if (!this.currentProjectId) return;

        try {
            const processes = await this.supabaseManager.getProjectProcesses(
                this.currentProjectId, 
                this.getAdminToken()
            );
            
            this.renderProcesses(processes);
            this.updateStatistics(processes);
        } catch (error) {
            console.error('Failed to load admin dashboard:', error);
        }
    }

    // Subscribe to real-time updates
    subscribeToRealTimeUpdates() {
        if (!this.currentProjectId || this.supabaseManager.useLocalStorageFallback) return;

        this.realtimeSubscription = this.supabaseManager.subscribeToProject(
            this.currentProjectId,
            (payload) => {
                console.log('Real-time update received:', payload);
                this.handleRealTimeUpdate(payload);
            }
        );
    }

    // Handle real-time updates
    handleRealTimeUpdate(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.addProcessToUI(newRecord);
                this.showNotification(`New process submitted by ${newRecord.department}: ${newRecord.process_name}`);
                break;
            case 'UPDATE':
                this.updateProcessInUI(newRecord);
                break;
            case 'DELETE':
                this.removeProcessFromUI(oldRecord.id);
                break;
        }
        
        // Update statistics
        this.refreshStatistics();
    }

    // Add new process to UI without full refresh
    addProcessToUI(processData) {
        const processContainer = document.querySelector('#processes-container');
        if (!processContainer) return;

        const processElement = this.createProcessElement(processData);
        processContainer.insertBefore(processElement, processContainer.firstChild);
        
        // Animate the new element
        processElement.style.opacity = '0';
        processElement.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            processElement.style.transition = 'all 0.3s ease';
            processElement.style.opacity = '1';
            processElement.style.transform = 'translateY(0)';
        }, 100);
    }

    // Create process element for UI
    createProcessElement(processData) {
        const div = document.createElement('div');
        div.className = 'process-item bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4';
        div.setAttribute('data-process-id', processData.id);
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-gray-900">${processData.process_name}</h4>
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">${processData.department}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                ${processData.process_data.description || 'No description provided'}
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>Submitted: ${new Date(processData.submitted_at).toLocaleString()}</span>
                <div class="flex space-x-2">
                    <span>Priority: ${processData.priority_score || 0}</span>
                    <span>Automation: ${processData.automation_potential || 0}%</span>
                </div>
            </div>
        `;
        
        return div;
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClasses(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getNotificationClasses(type) {
        const classes = {
            info: 'bg-blue-500 text-white',
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        return classes[type] || classes.info;
    }

    // Utility methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    getAdminToken() {
        // Extract admin token from URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('admin_token') || localStorage.getItem('workshop_admin_token');
    }

    // Generate department URLs for admin
    generateDepartmentUrls(projectId, departments) {
        const baseUrl = window.location.origin + window.location.pathname;
        return departments.map(dept => ({
            department: dept,
            url: `${baseUrl}?token=${this.generateToken()}&project=${projectId}&dept=${dept}`
        }));
    }

    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Cleanup
    destroy() {
        if (this.realtimeSubscription) {
            this.supabaseManager.unsubscribeFromProject();
        }
    }

    // Setup event listeners for form submissions
    setupEventListeners() {
        // Override existing form submission
        const originalSubmitProcess = window.submitProcess;
        if (originalSubmitProcess) {
            window.submitProcess = async (processData) => {
                return await this.submitProcess(processData);
            };
        }

        // Listen for page unload to cleanup
        window.addEventListener('beforeunload', () => this.destroy());
    }
}

// Initialize workshop backend when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.workshopBackend = new WorkshopBackend();
});

// Export for manual initialization
window.WorkshopBackend = WorkshopBackend;