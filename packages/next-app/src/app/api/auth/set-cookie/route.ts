import { LoginSuccessResponse } from '@/modules/auth/types';

export async function POST(request: Request) {
  const res = (await request.json()) as LoginSuccessResponse;
  const { accessToken, refreshToken, user } = res.data;

  const userString = JSON.stringify({
    ...user,
    ...(user.fullName && { fullName: encodeURIComponent(user.fullName) }),
  });

  console.log('Setting cookies:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    userId: user?.id,
    userRole: user?.role,
    userStringLength: userString.length,
    userStringPreview: userString.substring(0, 200) + '...',
  });

  if (!accessToken)
    return Response.json({ message: 'Access token not available.' }, { status: 400 });

  return Response.json(
    { res },
    {
      status: 200,
      // @ts-expect-error Array of cookies does work in runtime
      headers: {
        'Set-Cookie': [
          `accessToken=${accessToken}; Path=/; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}Max-Age=31536000; HttpOnly; SameSite=Lax`,
          `refreshToken=${refreshToken}; Path=/; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}Max-Age=31536000; HttpOnly; SameSite=Lax`,
          `user=${userString}; Path=/; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}Max-Age=31536000; HttpOnly; SameSite=Lax`,
        ],
      },
    },
  );
}
