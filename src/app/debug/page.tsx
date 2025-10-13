'use client';

export default function DebugPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Environment Debug</h1>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> {googleClientId || 'NOT FOUND'}
        </p>
        <p>
          <strong>All env vars starting with NEXT_PUBLIC:</strong>
        </p>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(
            Object.keys(process.env)
              .filter((key) => key.startsWith('NEXT_PUBLIC'))
              .reduce(
                (obj, key) => {
                  obj[key] = process.env[key];
                  return obj;
                },
                {} as Record<string, any>,
              ),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}
