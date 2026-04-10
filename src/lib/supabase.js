import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Make sure URL is structurally valid to prevent createClient from throwing 'Invalid URL'
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';

export const supabase = createClient(validUrl, supabaseKey || 'public-anon-key');