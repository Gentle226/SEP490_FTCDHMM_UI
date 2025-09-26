import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const cookieStore = await cookies();

    // Delete the access token and refresh token cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json({ message: 'Cookies cleared successfully' });
  } catch (error) {
    console.error('Delete cookie error:', error);
    return NextResponse.json({ message: 'Failed to clear cookies' }, { status: 500 });
  }
}
