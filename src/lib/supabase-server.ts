import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

/**
 * Create a Supabase client for server-side operations with service role key
 * This client bypasses RLS policies - use carefully
 * IMPORTANT: Only use this for admin operations, never expose to client
 */
export function createServerSupabaseAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
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
 * Create Supabase client for Server Components
 * Automatically handles cookie-based auth with RLS
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    publicAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client for API Routes with proper cookie handling
 * Handles both cookies and Authorization header
 */
export function createServerSupabaseClientFromRequest(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    publicAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Get authenticated user from request
 * Returns user object or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const { supabase } = createServerSupabaseClientFromRequest(request);
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authenticated user or return 401 response
 * Use in API routes that need authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please log in to access this resource',
        },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use createServerSupabaseClient instead
 */
export async function createServerSupabaseClientWithAuth() {
  return createServerSupabaseClient();
}

