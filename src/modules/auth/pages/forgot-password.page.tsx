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
import styles from './forgot-password.page.module.css';

export function ForgotPasswordPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div
      className={`flex min-h-svh grow items-center justify-center p-4 sm:p-6 md:p-10 lg:p-24 ${styles.backgroundContainer}`}
    >
      <Card className={`border-border/60 w-full max-w-md shadow-xl ${styles.cardContainer}`}>
        <CardHeader className="space-y-2 sm:space-y-3">
          <div className="flex justify-center">
            <Image
              src="/fitfood-tracker-logo.png"
              alt="Logo"
              width={150}
              height={150}
              className="h-24 w-auto sm:h-32"
            />
          </div>
          <CardTitle className="text-center text-2xl text-[#99b94a] sm:text-3xl">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center text-xs sm:text-sm">
            Khôi phục quyền truy cập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
        </CardContent>
      </Card>
    </div>
  );
}
