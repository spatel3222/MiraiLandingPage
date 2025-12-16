import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siwiwplrqmvqkyjeppjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2l3cGxycW12cWt5amVwcGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDk2NzcsImV4cCI6MjA4MDU4NTY3N30.TruMicpS8X6do6_CwTF1dGCJBP25JxN7Lb6_kv84Vic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
