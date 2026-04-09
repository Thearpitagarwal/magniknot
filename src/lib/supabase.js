import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Stop app immediately if env is missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase env variables missing. Check your .env file.");
}

// Optional debug in development
if (import.meta.env.DEV) {
  console.log("Supabase initialized with URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);