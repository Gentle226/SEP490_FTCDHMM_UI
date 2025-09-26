import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch('http://localhost:5142/api/Auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(data ? JSON.parse(data) : { message: 'Change password failed' }, {
        status: response.status,
      });
    }

    return NextResponse.json(
      data ? JSON.parse(data) : { message: 'Password changed successfully' },
    );
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
