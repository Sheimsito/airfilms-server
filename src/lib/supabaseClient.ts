import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import config from '../config/config';

const url = config.databaseUrl;
const serviceRoleKey = config.serviceRoleKey;
if (!url || !serviceRoleKey) {
  throw new Error('Supabase URL or service role key is not set');
}
// This is the supabase client with typed Database, but allowing flexibility for dynamic tables
export const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false },
});

// This is the supabase client without strict types for the generic BaseDAO
export const supabaseGeneric = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});



