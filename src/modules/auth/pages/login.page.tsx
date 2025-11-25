'use client';

import { GoogleOneTap } from '../components/google-one-tap';
import { LoginForm } from '../components/login-form';
import { useAuth } from '../contexts/auth.context';
import styles from './login.page.module.css';

export function LoginPage() {
  const { user, isLoading } = useAuth();

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center p-6 md:p-10 ${styles.backgroundContainer}`}
    >
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
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
