/**
 * Server-side Supabase client
 * Re-exports from supabase-server.ts for cleaner import paths
 */

export { 
  createServerSupabaseClient,
  createServerSupabaseClientWithAuth
} from '../supabase-server';

// Default export for convenience
import { createServerSupabaseClientWithAuth } from '../supabase-server';
export default createServerSupabaseClientWithAuth;

// Named export as createClient for API route compatibility
export { createServerSupabaseClientWithAuth as createClient };

