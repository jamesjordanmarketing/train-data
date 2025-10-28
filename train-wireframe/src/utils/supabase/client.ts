import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!client) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    client = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return client;
}

export const supabase = createClient();
