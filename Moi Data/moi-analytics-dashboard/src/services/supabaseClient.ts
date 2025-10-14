import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing or have placeholder values
const isValidUrl = supabaseUrl && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'));

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseAnonKey.length > 20;

if (!isValidUrl || !isValidKey) {
  console.error('🔧 SUPABASE CONFIGURATION NEEDED');
  console.log('Current values:');
  console.log(`  VITE_SUPABASE_URL: "${supabaseUrl || 'undefined'}"`);
  console.log(`  VITE_SUPABASE_ANON_KEY: "${supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'}"`);
  console.log('');
  console.log('Please update your .env.local file with real Supabase credentials:');
  console.log('1. Go to https://app.supabase.com');
  console.log('2. Create/select your project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the Project URL and anon public key');
  console.log('5. Update .env.local with the real values');
  console.log('6. Restart the development server');
}

// Create client with fallback values to prevent crashes
const clientUrl = isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isValidKey ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey);

// Log Supabase connection status
if (isValidUrl && isValidKey) {
  console.log('✅ Supabase client initialized successfully');
  console.log(`   - URL: ${supabaseUrl}`);
  console.log(`   - Key: ${supabaseAnonKey.substring(0, 20)}...`);
  
  // Test connection by checking if we can access the database
  (async () => {
    try {
      const { error } = await supabase.from('projects').select('count').limit(1).single();
      if (!error) {
        console.log('✅ Supabase connection test successful');
      } else if (error.code === 'PGRST116') {
        console.log('⚠️ Supabase connected but table "projects" not found - tables may need to be created');
      } else {
        console.warn('⚠️ Supabase connection test failed:', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Failed to test Supabase connection:', e);
    }
  })();
} else {
  console.warn('⚠️ Supabase client using placeholder values - real credentials needed');
}

// Export configuration status for components to check
export const supabaseConfig = {
  isConfigured: isValidUrl && isValidKey,
  hasValidUrl: isValidUrl,
  hasValidKey: isValidKey,
  url: supabaseUrl,
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not set'
};

// Helper function to check table existence
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log(`✅ Table "${tableName}" exists`);
      return true;
    } else if (error.code === 'PGRST116' || error.code === '42P01') {
      console.warn(`⚠️ Table "${tableName}" does not exist`);
      return false;
    } else {
      console.warn(`⚠️ Error checking table "${tableName}":`, error.message);
      return false;
    }
  } catch (e) {
    console.error(`❌ Failed to check table "${tableName}":`, e);
    return false;
  }
}

// Check all required tables on startup
if (isValidUrl && isValidKey) {
  (async () => {
    console.log('\n🔍 Checking Supabase tables...');
    const requiredTables = [
      'projects',
      'import_sessions', 
      'campaign_data',
      'raw_data_meta',
      'raw_data_google',
      'raw_data_shopify'
    ];
    
    for (const table of requiredTables) {
      await checkTableExists(table);
    }
    console.log('✅ Supabase table check complete\n');
  })();
}

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      raw_data_meta: {
        Row: {
          id: string;
          project_id: string;
          source_type: 'meta' | 'google' | 'shopify';
          date_reported: string;
          file_name: string;
          file_hash: string;
          row_count: number;
          import_session_id: string;
          imported_at: string;
          imported_by: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_type: 'meta' | 'google' | 'shopify';
          date_reported: string;
          file_name: string;
          file_hash: string;
          row_count: number;
          import_session_id: string;
          imported_at?: string;
          imported_by?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_type?: 'meta' | 'google' | 'shopify';
          date_reported?: string;
          file_name?: string;
          file_hash?: string;
          row_count?: number;
          import_session_id?: string;
          imported_at?: string;
          imported_by?: string | null;
        };
      };
      campaign_data: {
        Row: {
          id: string;
          project_id: string;
          source_type: 'meta' | 'google' | 'shopify';
          date_reported: string;
          campaign_name: string;
          ad_set_name: string | null;
          impressions: number | null;
          amount_spent: number | null;
          link_clicks: number | null;
          cost: number | null;
          clicks: number | null;
          conversions: number | null;
          utm_campaign: string | null;
          utm_term: string | null;
          sessions: number | null;
          online_store_visitors: number | null;
          cart_additions: number | null;
          checkouts: number | null;
          purchases: number | null;
          total_sales: number | null;
          created_at: string;
          import_session_id: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          source_type: 'meta' | 'google' | 'shopify';
          date_reported: string;
          campaign_name: string;
          ad_set_name?: string | null;
          impressions?: number | null;
          amount_spent?: number | null;
          link_clicks?: number | null;
          cost?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          sessions?: number | null;
          online_store_visitors?: number | null;
          cart_additions?: number | null;
          checkouts?: number | null;
          purchases?: number | null;
          total_sales?: number | null;
          created_at?: string;
          import_session_id?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          source_type?: 'meta' | 'google' | 'shopify';
          date_reported?: string;
          campaign_name?: string;
          ad_set_name?: string | null;
          impressions?: number | null;
          amount_spent?: number | null;
          link_clicks?: number | null;
          cost?: number | null;
          clicks?: number | null;
          conversions?: number | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          sessions?: number | null;
          online_store_visitors?: number | null;
          cart_additions?: number | null;
          checkouts?: number | null;
          purchases?: number | null;
          total_sales?: number | null;
          created_at?: string;
          import_session_id?: string | null;
        };
      };
      import_sessions: {
        Row: {
          id: string;
          project_id: string;
          started_at: string;
          completed_at: string | null;
          status: 'in_progress' | 'completed' | 'failed';
          files_imported: any | null;
          validation_errors: any | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          started_at?: string;
          completed_at?: string | null;
          status?: 'in_progress' | 'completed' | 'failed';
          files_imported?: any | null;
          validation_errors?: any | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          started_at?: string;
          completed_at?: string | null;
          status?: 'in_progress' | 'completed' | 'failed';
          files_imported?: any | null;
          validation_errors?: any | null;
          user_id?: string | null;
        };
      };
    };
  };
};