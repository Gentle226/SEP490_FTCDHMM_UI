import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const userCookie = cookieStore.get('user')?.value;

    if (!accessToken || !userCookie) {
      return Response.json({ user: null }, { status: 200 });
    }

    // Verify token is not expired
    try {
      const { exp } = decodeJwt(accessToken);
      if (exp && exp * 1000 < Date.now()) {
        return Response.json({ user: null }, { status: 200 });
      }
    } catch {
      return Response.json({ user: null }, { status: 200 });
    }

    // Parse and return user data
    const user = JSON.parse(userCookie);
    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error getting user:', error);
    return Response.json({ user: null }, { status: 200 });
  }
}
