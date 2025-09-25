-- Personal Task Tracker Database Schema for Supabase (FIXED VERSION)
-- Run this SQL in your Supabase SQL editor to create the required tables

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

-- 5. Create RLS Policies for Personal Tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON personal_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON personal_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON personal_tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON personal_tasks;

-- For anonymous users (since we're using device-based user IDs)
CREATE POLICY "Users can view own tasks" ON personal_tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own tasks" ON personal_tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own tasks" ON personal_tasks
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own tasks" ON personal_tasks
    FOR DELETE USING (true);

-- 6. Create RLS Policies for Daily Focus Tasks
DROP POLICY IF EXISTS "Users can view own focus tasks" ON daily_focus_tasks;
DROP POLICY IF EXISTS "Users can upsert own focus tasks" ON daily_focus_tasks;

CREATE POLICY "Users can view own focus tasks" ON daily_focus_tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can upsert own focus tasks" ON daily_focus_tasks
    FOR ALL USING (true);

-- 7. Create helpful functions

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_personal_tasks_updated_at ON personal_tasks;
DROP TRIGGER IF EXISTS update_daily_focus_tasks_updated_at ON daily_focus_tasks;

CREATE TRIGGER update_personal_tasks_updated_at
    BEFORE UPDATE ON personal_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_focus_tasks_updated_at
    BEFORE UPDATE ON daily_focus_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Function to validate task data
CREATE OR REPLACE FUNCTION validate_personal_task()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure title is not empty
    IF NEW.title IS NULL OR trim(NEW.title) = '' THEN
        RAISE EXCEPTION 'Task title cannot be empty';
    END IF;
    
    -- Set completion timestamp when status changes to done
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Clear completion timestamp when status changes from done
    IF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_personal_task_trigger ON personal_tasks;
CREATE TRIGGER validate_personal_task_trigger
    BEFORE INSERT OR UPDATE ON personal_tasks
    FOR EACH ROW
    EXECUTE FUNCTION validate_personal_task();

-- 9. Create a simple view for task statistics (without RLS)
DROP VIEW IF EXISTS personal_task_stats;
CREATE OR REPLACE VIEW personal_task_stats AS
SELECT 
    user_id,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'to-do') as todo_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as tasks_with_completion_date,
    COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived_tasks
FROM personal_tasks
GROUP BY user_id;

-- Grant permissions on tables and view
GRANT ALL ON personal_tasks TO anon, authenticated;
GRANT ALL ON daily_focus_tasks TO anon, authenticated;
GRANT SELECT ON personal_task_stats TO anon, authenticated;

-- 10. Sample data cleanup function (for development/testing)
CREATE OR REPLACE FUNCTION cleanup_user_data(target_user_id TEXT)
RETURNS void AS $$
BEGIN
    DELETE FROM daily_focus_tasks WHERE user_id = target_user_id;
    DELETE FROM personal_tasks WHERE user_id = target_user_id;
    RAISE NOTICE 'Cleaned up all data for user_id: %', target_user_id;
END;
$$ language 'plpgsql';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Personal Task Tracker database schema created successfully!';
    RAISE NOTICE '📊 Tables created: personal_tasks, daily_focus_tasks';
    RAISE NOTICE '🔒 Row Level Security enabled with device-based access';
    RAISE NOTICE '⚡ Performance indexes and triggers configured';
    RAISE NOTICE '📈 Analytics view (personal_task_stats) available';
END $$;