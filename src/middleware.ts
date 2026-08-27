import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Protected routes — redirect to /login if not authenticated
  if ((path.startsWith('/patient') || path.startsWith('/doctor')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in — don't show auth pages
  if ((path === '/login' || path === '/register') && user) {
    return NextResponse.redirect(new URL('/patient', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/patient/:path*',
    '/doctor/:path*',
    '/login',
    '/register',
  ],
};
