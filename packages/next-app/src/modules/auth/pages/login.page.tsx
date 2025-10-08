'use client';

import { GoogleOneTap } from '../components/google-one-tap';
import { LoginForm } from '../components/login-form';
import { useAuth } from '../contexts/auth.context';

export function LoginPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
      {/* Google One Tap disabled temporarily to prevent conflicts with login button */}
      {/* Uncomment this after testing the login button works properly */}
      {!user && !isLoading && (
        <GoogleOneTap
          onSuccess={() => {
            window.location.replace('/');
          }}
          onError={(error) => {
            console.error('Google One Tap error:', error);
          }}
        />
      )}
    </div>
  );
}
