'use client';

import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';

import { LoginForm } from '../components/login-form';

export function LoginPage() {
  return (
    <div className="flex grow items-center justify-center">
      <Card className="m-auto w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Đăng nhập để trải nghiệm dịch vụ của chúng tôi
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm />
          <div className="text-center">
            Bạn chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-blue-500 hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
