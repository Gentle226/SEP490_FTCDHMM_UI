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
    <div className="flex grow items-center justify-center p-4">
      <Card className="border-border/60 m-auto w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12zM4.5 20.25a7.5 7.5 0 0115 0V21H4.5v-.75z" />
            </svg>
          </div>
          <CardTitle className="text-center text-3xl">Create your account</CardTitle>
          <CardDescription className="text-muted-foreground text-center text-sm">
            Sign up to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RegisterForm />
          <div className="text-muted-foreground text-center text-sm">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
