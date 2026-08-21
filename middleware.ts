import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply auth guard to /admin routes (except /admin/login)
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (!isAdminRoute || isLoginPage) {
    return NextResponse.next();
  }

  // Build response object that we can set cookies on
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client using SSR pattern (reads session from cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check session validity
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirected', '1');
    return NextResponse.redirect(loginUrl);
  }

  // Check that the user has admin role in profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    // Valid session but not an admin — redirect to login with error
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all /admin routes.
     * Exclude Next.js internals and static files.
     */
    '/admin/:path*',
  ],
};
