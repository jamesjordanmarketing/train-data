import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

/**
 * Middleware to handle Supabase authentication
 * Refreshes the user's session on every request
 */
export async function middleware(request: NextRequest) {
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

  // Refresh session if needed
  // This will automatically update cookies if the session is refreshed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optional: Redirect to login if accessing protected routes without auth
  // Uncomment and customize based on your needs
  // const isAuthRoute = request.nextUrl.pathname.startsWith('/signin') || 
  //                     request.nextUrl.pathname.startsWith('/signup');
  // const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
  //                          request.nextUrl.pathname.startsWith('/conversations');
  
  // if (!user && isProtectedRoute) {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = '/signin';
  //   redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
  //   return NextResponse.redirect(redirectUrl);
  // }

  // if (user && isAuthRoute) {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = '/dashboard';
  //   return NextResponse.redirect(redirectUrl);
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

