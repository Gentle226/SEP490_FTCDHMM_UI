import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();
    const cookieStore = await cookies();

    if (!accessToken) {
      return NextResponse.json({ message: 'Access token is required' }, { status: 400 });
    }

    // Set the access token cookie (expires in 1 hour)
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    // Set the refresh token cookie (expires in 30 days)
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ message: 'Cookies set successfully' });
  } catch (error) {
    console.error('Set cookie error:', error);
    return NextResponse.json({ message: 'Failed to set cookies' }, { status: 500 });
  }
}
