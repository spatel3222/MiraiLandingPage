import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Platform = 'meta' | 'google' | 'shopify'

export const TABLE_NAMES: Record<Platform, string> = {
  meta: 'meta_import_data',
  google: 'google_import_data', 
  shopify: 'shopify_import_data'
}