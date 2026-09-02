import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.delete('admin_token');
  return response;
}
