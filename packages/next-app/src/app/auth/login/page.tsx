import { Metadata } from 'next';

import { LoginPage } from '@/modules/auth';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default function Login() {
  return <LoginPage />;
}
