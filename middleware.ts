import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/login';
  const isClientRoute = request.nextUrl.pathname.startsWith('/client') && request.nextUrl.pathname !== '/client/login';
  const isClientLoginRoute = request.nextUrl.pathname === '/client/login';

  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (isClientRoute && !session) {
    return NextResponse.redirect(new URL('/client/login', request.url));
  }

  if (isClientLoginRoute && session) {
    return NextResponse.redirect(new URL('/client', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/client/:path*'],
};
