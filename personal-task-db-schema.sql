-- Personal Task Tracker Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- 1. Personal Tasks Table
CREATE TABLE IF NOT EXISTS personal_tasks (
    id TEXT PRIMARY KEY,  -- Use TEXT for UUID compatibility
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'day-job',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'to-do',
    notes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL,
    archived_at TIMESTAMPTZ NULL,
    
    -- Constraints
    CONSTRAINT personal_tasks_status_check CHECK (status IN ('to-do', 'in-progress', 'done')),
    CONSTRAINT personal_tasks_priority_check CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT personal_tasks_category_check CHECK (category IN ('day-job', 'personal', 'learning', 'health', 'projects')),
    
    -- Unique constraint to prevent duplicate tasks per user
    UNIQUE(id, user_id)
);

-- 2. Daily Focus Tasks Table
CREATE TABLE IF NOT EXISTS daily_focus_tasks (
    user_id TEXT PRIMARY KEY,
    tasks JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_tasks_user_id ON personal_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_status ON personal_tasks(status);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_category ON personal_tasks(category);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_updated_at ON personal_tasks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_completed_at ON personal_tasks(completed_at DESC) WHERE completed_at IS NOT NULL;

-- 4. Enable Row Level Security
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_focus_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Personal Tasks Policies
-- Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON personal_tasks
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

CREATE POLICY "Users can insert own tasks" ON personal_tasks
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

CREATE POLICY "Users can update own tasks" ON personal_tasks
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

CREATE POLICY "Users can delete own tasks" ON personal_tasks
    FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

-- Daily Focus Tasks Policies
CREATE POLICY "Users can view own focus tasks" ON daily_focus_tasks
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

CREATE POLICY "Users can upsert own focus tasks" ON daily_focus_tasks
    FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

-- 6. Create helpful functions

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_personal_tasks_updated_at
    BEFORE UPDATE ON personal_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_focus_tasks_updated_at
    BEFORE UPDATE ON daily_focus_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Function to validate task data
CREATE OR REPLACE FUNCTION validate_personal_task()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure title is not empty
    IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
        RAISE EXCEPTION 'Task title cannot be empty';
    END IF;
    
    -- Ensure user_id is provided
    IF NEW.user_id IS NULL OR trim(NEW.user_id) = '' THEN
        RAISE EXCEPTION 'User ID must be provided';
    END IF;
    
    -- Set completed_at when status changes to 'done'
    IF NEW.status = 'done' AND (OLD IS NULL OR OLD.status != 'done') THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Clear completed_at when status changes from 'done'
    IF NEW.status != 'done' AND (OLD IS NOT NULL AND OLD.status = 'done') THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for validation
CREATE TRIGGER validate_personal_task_trigger
    BEFORE INSERT OR UPDATE ON personal_tasks
    FOR EACH ROW
    EXECUTE FUNCTION validate_personal_task();

-- 8. Create a view for task statistics (optional, for analytics)
CREATE OR REPLACE VIEW personal_task_stats AS
SELECT 
    user_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'to-do') as todo_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
    COUNT(*) FILTER (WHERE completed_at >= CURRENT_DATE) as completed_today,
    COUNT(*) FILTER (WHERE completed_at >= date_trunc('week', CURRENT_DATE)) as completed_this_week,
    COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived_tasks
FROM personal_tasks
GROUP BY user_id;

-- Grant permissions on the view
GRANT SELECT ON personal_task_stats TO authenticated;

-- 9. RLS policy for the view
CREATE POLICY "Users can view own stats" ON personal_task_stats
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub'::text);

-- Enable RLS on the view (if your Supabase version supports it)
-- ALTER VIEW personal_task_stats ENABLE ROW LEVEL SECURITY;

-- 10. Sample data cleanup function (for development/testing)
CREATE OR REPLACE FUNCTION cleanup_user_data(target_user_id TEXT)
RETURNS void AS $$
BEGIN
    DELETE FROM daily_focus_tasks WHERE user_id = target_user_id;
    DELETE FROM personal_tasks WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Cleaned up data for user: %', target_user_id;
END;
$$ language 'plpgsql';

-- Comment with usage instructions
COMMENT ON TABLE personal_tasks IS 'Stores personal tasks with sync capabilities across devices. Each task belongs to a specific user_id.';
COMMENT ON TABLE daily_focus_tasks IS 'Stores daily focus task selections per user. Only one row per user.';
COMMENT ON FUNCTION cleanup_user_data IS 'Development helper to clean up test data. Usage: SELECT cleanup_user_data(''your-user-id'');';

-- Final verification queries you can run to test:
/*
-- Check if tables were created successfully:
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%task%';

-- Check RLS is enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('personal_tasks', 'daily_focus_tasks');

-- Check policies exist:
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('personal_tasks', 'daily_focus_tasks');
*/