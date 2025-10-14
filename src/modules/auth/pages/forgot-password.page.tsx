'use client';

import Image from 'next/image';
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
    <div className="flex grow items-center justify-center p-24">
      <Card className="border-border/60 w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Image src="/Fitfood Tracker Logo.png" alt="Logo" width={150} height={150} />
          </div>
          <CardTitle className="text-center text-3xl text-[#99b94a]">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-muted-foreground text-center text-sm">
            Khôi phục quyền truy cập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
        </CardContent>
      </Card>
    </div>
  );
}
