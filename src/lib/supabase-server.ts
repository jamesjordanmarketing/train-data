import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

/**
 * Create a Supabase client for server-side operations (API routes)
 * This client uses the service role key to bypass RLS policies
 * IMPORTANT: Only use this in API routes, never expose to client
 */
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key');
    return createClient(supabaseUrl, publicAnonKey);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create a Supabase client that reads auth from cookies
 * This is for API routes that need to check user authentication
 */
export async function createServerSupabaseClientWithAuth() {
  const cookieStore = await cookies();
  
  return createClient(supabaseUrl, publicAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });
}

