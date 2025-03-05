// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.https://oplfytljkygjcvaprlxf.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbGZ5dGxqa3lnamN2YXBybHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjU4NzYsImV4cCI6MjA1NjcwMTg3Nn0.utDJAdzfDqqKRpYyNQDhoP4uCxvJVG0lwBtUCUM1Zns;

// Ensure the variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL or Anon Key is missing. Check your .env.local file.'
  );
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

