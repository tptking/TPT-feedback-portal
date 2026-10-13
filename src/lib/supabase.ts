import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://welaaaqfbgqxhpjjbmzl.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGFhYXFmYmdxeGhwampibXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTI2ODgsImV4cCI6MjEwNjc4ODY4OH0.AC12UcCKErlPNO5i3LKH5BrLB3YlDELqPPnFJ_AJ8aI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const realSupabase = supabase;

