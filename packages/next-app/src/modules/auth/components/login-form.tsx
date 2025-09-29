'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { Card, CardContent } from '@/base/components/ui/card';
import { Form } from '@/base/components/ui/form';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { cn } from '@/base/lib/cn.lib';
import { LoginSchema, loginSchema } from '@/modules/auth/types';

import { authService } from '../services/auth.service';

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
                        const message = (error.response?.data as { message: string })?.message as
                          | string
                          | undefined;

                        if (status === HttpStatusCode.BadRequest) {
                          if (message === 'Email chưa được xác thực')
                            return 'Vui lòng xác thực email trước khi đăng nhập.';
                          if (message === 'Tài khoản đã bị khóa')
                            return 'Tài khoản đã bị khóa. Vui lòng thử lại sau.';
                          if (message === 'Email hoặc mật khẩu chưa chính xác')
                            return 'Email hoặc mật khẩu chưa chính xác.';
                        }
                        if (status === HttpStatusCode.Unauthorized)
                          return 'Email hoặc mật khẩu chưa chính xác.';
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

                    <Button
                      variant="outline"
                      type="button"
                      className="w-full border-[#99b94a] text-[#99b94a] hover:bg-[#99b94a] hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="ml-2">Đăng nhập với Google</span>
                    </Button>

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
            <img
              src="/Web Background.png"
              alt="Login illustration"
              className="absolute inset-0 h-full w-full object-cover"
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
