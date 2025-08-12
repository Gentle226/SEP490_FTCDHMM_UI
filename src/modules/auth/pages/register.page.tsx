'use client';

import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';

import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  return (
    <div className="flex grow items-center justify-center">
      <Card className="m-auto w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Đăng ký</CardTitle>
          <CardDescription className="text-center">
            Đăng ký để trải nghiệm dịch vụ của chúng tôi
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RegisterForm />
          <div className="text-center">
            Bạn đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
