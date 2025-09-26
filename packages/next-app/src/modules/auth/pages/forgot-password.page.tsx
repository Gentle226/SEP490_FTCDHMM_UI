'use client';

import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';

import { ForgotPasswordForm } from '../components/forgot-password-form';

export function ForgotPasswordPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

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
                d="M15.75 1.5A6.75 6.75 0 0 0 9 8.25v2.25H8.25A2.25 2.25 0 0 0 6 12.75v6A2.25 2.25 0 0 0 8.25 21h7.5A2.25 2.25 0 0 0 18 18.75v-6a2.25 2.25 0 0 0-2.25-2.25H15V8.25A1.5 1.5 0 0 0 13.5 6.75h-3A1.5 1.5 0 0 0 9 8.25v2.25h6V8.25a6.75 6.75 0 0 0-6.75-6.75Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M12 15a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 12 15Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <CardTitle className="text-center text-3xl">Reset Password</CardTitle>
          <CardDescription className="text-muted-foreground text-center text-sm">
            Recover access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
        </CardContent>
      </Card>
    </div>
  );
}
