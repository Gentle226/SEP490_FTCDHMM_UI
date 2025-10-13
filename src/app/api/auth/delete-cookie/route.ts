export async function DELETE() {
  try {
    return Response.json(
      { message: 'Cookies deleted successfully' },
      {
        status: 200,
        // @ts-expect-error Array of cookies does work in runtime
        headers: {
          'Set-Cookie': [
            `accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
            `refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
            `user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
          ],
        },
      },
    );
  } catch (error) {
    console.error('Error deleting cookies:', error);
    return Response.json(
      { message: 'Error deleting cookies', error: error.message },
      { status: 500 },
    );
  }
}
