import { supabase } from './supabaseClient';

export interface SupabaseConnectionTest {
  connected: boolean;
  error?: string;
  databaseExists: boolean;
  tablesCreated: boolean;
}

export class SupabaseService {
  static async testConnection(): Promise<SupabaseConnectionTest> {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('projects').select('count').limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, but connection is working
        return {
          connected: true,
          databaseExists: true,
          tablesCreated: false,
          error: 'Tables not created yet'
        };
      }
      
      if (error) {
        return {
          connected: false,
          databaseExists: false,
          tablesCreated: false,
          error: error.message
        };
      }
      
      return {
        connected: true,
        databaseExists: true,
        tablesCreated: true
      };
    } catch (error) {
      return {
        connected: false,
        databaseExists: false,
        tablesCreated: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }

  static async createTables(): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically be done via Supabase dashboard SQL editor
      // For now, we'll just test if we can access the database
      const { error } = await supabase.rpc('create_moi_tables', {});
      
      if (error) {
        return {
          success: false,
          error: `Database error: ${error.message}. Please create tables manually using the SQL provided.`
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating tables'
      };
    }
  }

  static getDatabaseSchema(): string {
    return `
-- MOI Analytics Dashboard Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create raw data metadata tracking
CREATE TABLE IF NOT EXISTS raw_data_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('meta', 'google', 'shopify')),
  date_reported DATE NOT NULL,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  import_session_id UUID NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  imported_by TEXT,
  UNIQUE(project_id, source_type, date_reported)
);

-- 3. Create campaign data table
CREATE TABLE IF NOT EXISTS campaign_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('meta', 'google', 'shopify')),
  date_reported DATE NOT NULL,
  campaign_name TEXT NOT NULL,
  ad_set_name TEXT,
  
  -- Meta specific fields
  impressions INTEGER,
  amount_spent DECIMAL(10,2),
  link_clicks INTEGER,
  
  -- Google specific fields  
  cost DECIMAL(10,2),
  clicks INTEGER,
  conversions INTEGER,
  
  -- Shopify specific fields
  utm_campaign TEXT,
  utm_term TEXT,
  sessions INTEGER,
  online_store_visitors INTEGER,
  cart_additions INTEGER,
  checkouts INTEGER,
  purchases INTEGER,
  total_sales DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  import_session_id UUID
);

-- 4. Create import sessions table
CREATE TABLE IF NOT EXISTS import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress',
  files_imported JSONB,
  validation_errors JSONB,
  user_id TEXT
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_data_date ON campaign_data(project_id, date_reported, campaign_name);
CREATE INDEX IF NOT EXISTS idx_raw_data_meta_date ON raw_data_meta(project_id, date_reported);
CREATE INDEX IF NOT EXISTS idx_import_sessions_project ON import_sessions(project_id, started_at);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sessions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (basic - allow all for now, restrict later)
CREATE POLICY "Allow all operations for now" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON raw_data_meta FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON campaign_data FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON import_sessions FOR ALL USING (true);

-- 8. Create the default project
INSERT INTO projects (name) VALUES ('MOI Analytics Dashboard') 
ON CONFLICT DO NOTHING;
`;
  }

  static async createDefaultProject(): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name: 'MOI Analytics Dashboard' })
        .select()
        .single();

      if (error) {
        // Project might already exist
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('name', 'MOI Analytics Dashboard')
          .single();

        if (existingProject) {
          return { success: true, projectId: existingProject.id };
        }

        return { success: false, error: error.message };
      }

      return { success: true, projectId: data.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating project'
      };
    }
  }
}