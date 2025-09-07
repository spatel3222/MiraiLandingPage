-- Supabase Database Schema for Business Process Workshop Tool
-- This schema supports multi-device department access with real-time collaboration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table - stores workshop projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    workshop_date DATE,
    facilitator_email TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Department tokens table - manages secure access for departments
CREATE TABLE IF NOT EXISTS department_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, department)
);

-- Processes table - stores all submitted business processes
CREATE TABLE IF NOT EXISTS processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    name TEXT NOT NULL,
    custom_department TEXT,
    time_spent INTEGER NOT NULL, -- hours per week
    
    -- Automation scores (1-10)
    repetitive_score INTEGER NOT NULL CHECK (repetitive_score BETWEEN 1 AND 10),
    data_driven_score INTEGER NOT NULL CHECK (data_driven_score BETWEEN 1 AND 10),
    rule_based_score INTEGER NOT NULL CHECK (rule_based_score BETWEEN 1 AND 10),
    high_volume_score INTEGER NOT NULL CHECK (high_volume_score BETWEEN 1 AND 10),
    
    -- Impact and feasibility (1-10)
    impact_score INTEGER NOT NULL CHECK (impact_score BETWEEN 1 AND 10),
    feasibility_score INTEGER NOT NULL CHECK (feasibility_score BETWEEN 1 AND 10),
    
    -- Additional data
    notes TEXT,
    submitted_by_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Computed fields
    automation_avg DECIMAL(3,2) GENERATED ALWAYS AS (
        (repetitive_score + data_driven_score + rule_based_score + high_volume_score)::decimal / 4
    ) STORED,
    priority_score DECIMAL(5,2) GENERATED ALWAYS AS (
        (impact_score * 0.4 + feasibility_score * 0.3 + 
         ((repetitive_score + data_driven_score + rule_based_score + high_volume_score)::decimal / 4) * 0.3)
    ) STORED
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processes_project_id ON processes(project_id);
CREATE INDEX IF NOT EXISTS idx_processes_department ON processes(department);
CREATE INDEX IF NOT EXISTS idx_processes_priority_score ON processes(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_department_tokens_token ON department_tokens(token);
CREATE INDEX IF NOT EXISTS idx_department_tokens_project ON department_tokens(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read projects (for public workshop access)
CREATE POLICY "Public read access for projects" ON projects
    FOR SELECT USING (true);

-- Policy: Departments can read their tokens
CREATE POLICY "Department token access" ON department_tokens
    FOR SELECT USING (true);

-- Policy: Departments can read processes from their project
CREATE POLICY "Process read access" ON processes
    FOR SELECT USING (true);

-- Policy: Departments can insert processes with valid token
CREATE POLICY "Process insert access" ON processes
    FOR INSERT WITH CHECK (true);

-- Policy: Departments can update their own processes
CREATE POLICY "Process update access" ON processes
    FOR UPDATE USING (true);

-- Functions for business logic
CREATE OR REPLACE FUNCTION validate_department_token(
    p_token TEXT,
    p_project_id UUID,
    p_department TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    token_valid BOOLEAN := false;
BEGIN
    -- Check if token exists, is active, and matches department/project
    SELECT EXISTS(
        SELECT 1 FROM department_tokens dt
        WHERE dt.token = p_token
        AND dt.project_id = p_project_id
        AND dt.department = p_department
        AND dt.is_active = true
        AND (dt.expires_at IS NULL OR dt.expires_at > NOW())
    ) INTO token_valid;
    
    -- Update access tracking if valid
    IF token_valid THEN
        UPDATE department_tokens
        SET access_count = access_count + 1,
            last_accessed_at = NOW()
        WHERE token = p_token;
    END IF;
    
    RETURN token_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate department access URL
CREATE OR REPLACE FUNCTION generate_department_url(
    p_project_id UUID,
    p_department TEXT,
    p_base_url TEXT DEFAULT 'https://yoursite.com/workshop.html'
) RETURNS TEXT AS $$
DECLARE
    dept_token TEXT;
BEGIN
    -- Get or create token for this department/project combination
    SELECT token INTO dept_token
    FROM department_tokens
    WHERE project_id = p_project_id AND department = p_department;
    
    IF dept_token IS NULL THEN
        -- Generate new token
        dept_token := encode(digest(p_project_id::text || p_department || extract(epoch from now())::text, 'sha256'), 'hex');
        
        INSERT INTO department_tokens (project_id, department, token)
        VALUES (p_project_id, p_department, dept_token);
    END IF;
    
    RETURN p_base_url || '?project=' || p_project_id || '&dept=' || p_department || '&token=' || dept_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics view for workshop insights
CREATE OR REPLACE VIEW workshop_analytics AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(DISTINCT pr.department) as departments_participating,
    COUNT(pr.id) as total_processes,
    COUNT(CASE WHEN pr.automation_avg >= 7 THEN 1 END) as high_automation_potential,
    COUNT(CASE WHEN pr.priority_score >= 7 THEN 1 END) as high_priority_processes,
    AVG(pr.time_spent) as avg_time_spent,
    SUM(pr.time_spent) as total_time_spent,
    AVG(pr.automation_avg) as avg_automation_score,
    AVG(pr.priority_score) as avg_priority_score,
    ROUND(SUM(CASE WHEN pr.automation_avg >= 7 THEN pr.time_spent * 50 ELSE 0 END)) as estimated_savings_hours,
    p.created_at,
    p.workshop_date
FROM projects p
LEFT JOIN processes pr ON p.id = pr.project_id
GROUP BY p.id, p.name, p.created_at, p.workshop_date;

-- Department participation view
CREATE OR REPLACE VIEW department_participation AS
SELECT 
    pr.project_id,
    pr.department,
    COUNT(*) as process_count,
    AVG(pr.automation_avg) as avg_automation_score,
    AVG(pr.priority_score) as avg_priority_score,
    SUM(pr.time_spent) as total_time_spent,
    MIN(pr.created_at) as first_submission,
    MAX(pr.created_at) as last_submission
FROM processes pr
GROUP BY pr.project_id, pr.department;

-- Function to get real-time workshop stats
CREATE OR REPLACE FUNCTION get_workshop_stats(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_processes', COUNT(*),
        'departments_participating', COUNT(DISTINCT department),
        'high_priority_count', COUNT(CASE WHEN priority_score >= 7 THEN 1 END),
        'automation_ready_count', COUNT(CASE WHEN automation_avg >= 7 THEN 1 END),
        'total_hours_weekly', SUM(time_spent),
        'estimated_annual_savings', SUM(CASE WHEN automation_avg >= 7 THEN time_spent * 52 * 50 ELSE 0 END),
        'avg_automation_score', ROUND(AVG(automation_avg), 2),
        'last_submission', MAX(created_at),
        'department_breakdown', json_agg(
            json_build_object(
                'department', department,
                'count', dept_count,
                'avg_score', dept_avg_score
            )
        )
    ) INTO stats
    FROM (
        SELECT 
            department,
            COUNT(*) as dept_count,
            AVG(automation_avg) as dept_avg_score,
            time_spent,
            automation_avg,
            priority_score,
            created_at
        FROM processes
        WHERE project_id = p_project_id
        GROUP BY department, time_spent, automation_avg, priority_score, created_at
    ) dept_stats;
    
    RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
    BEFORE UPDATE ON processes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (remove in production)
INSERT INTO projects (id, name, description, workshop_date) VALUES
(uuid_generate_v4(), 'Q4 2024 Automation Workshop', 'Cross-department process automation initiative', '2024-12-15')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions for the application
-- These would be configured in Supabase dashboard for the service role
COMMENT ON TABLE projects IS 'Workshop projects with metadata and status tracking';
COMMENT ON TABLE department_tokens IS 'Secure access tokens for department-specific links';
COMMENT ON TABLE processes IS 'Business processes submitted by departments during workshops';
COMMENT ON VIEW workshop_analytics IS 'Aggregated analytics for workshop insights and reporting';
COMMENT ON VIEW department_participation IS 'Department-level participation and performance metrics';