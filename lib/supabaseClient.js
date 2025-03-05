import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oplfytljkygjcvaprlxf.supabase.co';  // Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbGZ5dGxqa3lnamN2YXBybHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjU4NzYsImV4cCI6MjA1NjcwMTg3Nn0.utDJAdzfDqqKRpYyNQDhoP4uCxvJVG0lwBtUCUM1Zns'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

