import { createBrowserClient } from '@supabase/ssr';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

/**
 * Create a Supabase client for browser-side operations
 * This client automatically handles cookie-based authentication
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    supabaseUrl,
    publicAnonKey
  );
}

// Singleton instance for client-side use
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get singleton Supabase client for client-side use
 * Use this in React components and client-side code
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientSupabaseClient();
  }
  return supabaseClient;
}

