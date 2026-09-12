import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Realtime/Storage features will not work.');
}

// Anon client — safe to use in browser (Realtime, Storage signed URLs)
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
