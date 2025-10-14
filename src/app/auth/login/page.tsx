import { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginPage } from '@/modules/auth';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default function Login() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <LoginPage />
    </Suspense>
  );
}
