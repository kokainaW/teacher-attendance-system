// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure the variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL or Anon Key is missing. Check your .env.local file.'
  );
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

