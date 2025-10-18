'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Card, CardContent } from '@/base/components/ui/card';
import { Form } from '@/base/components/ui/form';
import { cn } from '@/base/lib/cn.lib';
import { LoginSchema, loginSchema } from '@/modules/auth/types';

import { authService } from '../services/auth.service';
import { GoogleSignInButton } from './google-signin-button';

interface LoginFormProps extends React.ComponentProps<'div'> {
  onLoginSuccess?: () => void;
}

export function LoginForm({ className, onLoginSuccess, ...props }: LoginFormProps) {
  const searchParams = useSearchParams();

  const {
    mutate: triggerLogin,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: LoginSchema) => authService.login(payload),
    onSuccess: async () => {
      const redirect = searchParams.get('redirect');
      if (URL.canParse(redirect as string)) {
        const redirectUrl = new URL(redirect as string);

        if (redirectUrl.origin === window.location.origin) {
          window.location.replace(redirectUrl.href);
          return;
        }
      }

      window.location.replace('/');
      onLoginSuccess?.();
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Logo for mobile - hidden on desktop */}
              <div className="flex justify-center md:hidden">
                <Image
                  src="/FitFood Tracker Logo.png"
                  alt="FitFood Tracker Logo"
                  width={120}
                  height={120}
                  className="h-24 w-auto"
                  priority
                />
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-[#99b94a]">Chào mừng trở lại</h1>
                <p className="text-muted-foreground text-balance">
                  Đăng nhập vào tài khoản của bạn
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="bg-danger/10">
                  <AlertCircleIcon />
                  <AlertTitle>Không thể đăng nhập</AlertTitle>
                  <AlertDescription>
                    {(() => {
                      if (error instanceof AxiosError) {
                        const status = error.status ?? error.response?.status;
                        if (status === 404) {
                          return 'Email hoặc mật khẩu không đúng.';
                        } else if (status === 402) {
                          return 'Email chưa được xác thực.';
                        } else if (status === 403) {
                          return 'Tài khoản đã bị khóa.';
                        } else if (status === 410) {
                          return 'Tài khoản không tồn tại.';
                        }
                      }
                      return 'Đã xảy ra lỗi bất ngờ. Vui lòng thử lại sau.';
                    })()}
                  </AlertDescription>
                </Alert>
              )}

              <Form
                className="flex flex-col gap-4"
                loading={isPending}
                schema={loginSchema}
                fields={[
                  {
                    name: 'email',
                    type: 'text',
                    label: 'Email',
                    placeholder: 'your@example.com',
                    disabled: isPending,
                  },
                  {
                    name: 'password',
                    type: 'password',
                    label: 'Mật khẩu',
                    placeholder: '',
                    disabled: isPending,
                  },
                ]}
                renderSubmitButton={(ButtonComponent) => (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a] hover:underline"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <ButtonComponent className="w-full border-[#99b94a] bg-[#99b94a] hover:bg-[#7a8f3a]">
                      Đăng nhập
                    </ButtonComponent>

                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Hoặc tiếp tục với
                      </span>
                    </div>

                    <div className="flex w-full">
                      <div className="flex w-full max-w-[400px] items-center justify-center">
                        <GoogleSignInButton
                          theme="outline"
                          size="large"
                          text="signin_with"
                          disabled={isPending}
                          onSuccess={() => {
                            const redirect = searchParams.get('redirect');
                            if (URL.canParse(redirect as string)) {
                              const redirectUrl = new URL(redirect as string);

                              if (redirectUrl.origin === window.location.origin) {
                                window.location.replace(redirectUrl.href);
                                return;
                              }
                            }

                            window.location.replace('/');
                            onLoginSuccess?.();
                          }}
                          onError={(error) => {
                            console.error('Google login error:', error);
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-center text-sm">
                      Chưa có tài khoản?{' '}
                      <Link
                        href="/auth/register"
                        className="text-[#99b94a] underline underline-offset-4 hover:text-[#7a8f3a]"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  </div>
                )}
                onSuccessSubmit={(data) => triggerLogin(data)}
              />
            </div>
          </div>

          <div className="relative hidden md:block">
            <Image
              src="/Web Background.png"
              alt="Login illustration"
              className="absolute inset-0 h-full w-full object-cover"
              width={576}
              height={512}
              quality={100}
              priority
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance">
        Bằng cách tiếp tục, bạn đồng ý với{' '}
        <a href="#" className="hover:text-primary underline underline-offset-4">
          Điều khoản dịch vụ
        </a>{' '}
        và{' '}
        <a href="#" className="hover:text-primary underline underline-offset-4">
          Chính sách bảo mật
        </a>
        .
      </div>
    </div>
  );
}
