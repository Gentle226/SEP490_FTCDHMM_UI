'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';

import { RegisterForm } from '../components/register-form';
import styles from './register.page.module.css';

export function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div
      className={`flex min-h-svh flex-col items-center justify-center p-6 md:p-10 ${styles.backgroundContainer}`}
    >
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <Image src="/fitfood-tracker-logo.png" alt="Logo" width={150} height={150} />
            </div>
            <CardTitle className="text-center text-3xl text-[#99b94a]">Tạo tài khoản</CardTitle>
            <CardDescription className="text-muted-foreground text-center text-sm">
              Đăng ký để bắt đầu sử dụng dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <RegisterForm onStepChange={setCurrentStep} />
            {currentStep !== 3 && (
              <div className="text-muted-foreground text-center text-sm">
                Đã có tài khoản?{' '}
                <Link
                  href="/auth/login"
                  className="text-[#99b94a] hover:text-[#7a8f3a] hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
