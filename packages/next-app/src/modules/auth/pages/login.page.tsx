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
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v2.25H6a2.25 2.25 0 00-2.25 2.25v6.75A2.25 2.25 0 006 20.25h12a2.25 2.25 0 002.25-2.25V11.25A2.25 2.25 0 0018 9H17.25V6.75A5.25 5.25 0 0012 1.5zm-3.75 6.75A3.75 3.75 0 0112 4.5a3.75 3.75 0 013.75 3.75V9H8.25V8.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <CardTitle className="text-center text-3xl">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground text-center text-sm">
            Sign in to continue using our service
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm />
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">or</span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
