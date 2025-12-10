'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { Card, CardContent } from '@/base/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Form } from '@/base/components/ui/form';
import { cn } from '@/base/lib/cn.lib';
import {
  LoginSchema,
  ResendOtpSchema,
  loginSchema,
  verifyEmailOtpSchema,
} from '@/modules/auth/types';

import { authService } from '../services/auth.service';
import { GoogleSignInButton } from './google-signin-button';
import styles from './login-form.module.css';

interface LoginFormProps extends React.ComponentProps<'div'> {
  onLoginSuccess?: () => void;
}

export function LoginForm({ className, onLoginSuccess, ...props }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');
  const [loginCredentials, setLoginCredentials] = useState<LoginSchema | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLoginSuccess = () => {
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
  };

  const {
    mutate: triggerLogin,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: LoginSchema) => authService.login(payload),
    onSuccess: handleLoginSuccess,
  });

  switch (step) {
    case 1:
      return (
        <LoginStep1
          className={className}
          props={props}
          isClient={isClient}
          _searchParams={searchParams}
          isPending={isPending}
          error={error}
          triggerLogin={(data) => {
            setLoginCredentials(data);
            triggerLogin(data);
          }}
          onSkipToEmailVerification={(email) => {
            setUnverifiedEmail(email);
            setStep(2);
          }}
          handleLoginSuccess={handleLoginSuccess}
        />
      );
    case 2:
      return (
        <VerifyEmailStep
          email={unverifiedEmail}
          onVerified={() => {
            if (loginCredentials) {
              triggerLogin(loginCredentials);
            }
          }}
        />
      );
    default:
      return null;
  }
}

type LoginStep1Props = {
  className?: string;
  props: React.ComponentProps<'div'>;
  isClient: boolean;
  _searchParams: ReturnType<typeof useSearchParams>;
  isPending: boolean;
  error: Error | null;
  triggerLogin: (data: LoginSchema) => void;
  onSkipToEmailVerification: (email: string) => void;
  handleLoginSuccess: () => void;
};

function LoginStep1({
  className,
  props,
  isClient,
  isPending,
  error,
  triggerLogin,
  onSkipToEmailVerification,
  handleLoginSuccess,
}: LoginStep1Props) {
  const [showEmailVerifyDialog, setShowEmailVerifyDialog] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState<string>('');

  // Mutation to resend OTP
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (email: string) => {
      const payload: ResendOtpSchema = { email };
      return authService.resendOtp(payload);
    },
  });

  // Handle email not verified error (status 402)
  useEffect(() => {
    if (error instanceof AxiosError) {
      const status = error.status ?? error.response?.status;
      if (status === 402) {
        // Email not confirmed - use the email from the last login attempt
        setPendingEmail(lastAttemptedEmail);
        setShowEmailVerifyDialog(true);
      }
    }
  }, [error, lastAttemptedEmail]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className={`overflow-hidden p-0 ${styles.cardContainer}`}>
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* Logo for mobile - hidden on desktop */}
              {isClient && (
                <div className="flex justify-center md:hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fitfood-tracker-logo.png"
                    alt="Fitfood Tracker Logo"
                    className="h-24 w-auto"
                  />
                </div>
              )}

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
                        const message = error.response?.data?.message;

                        if (status === 404) {
                          return 'Email hoặc mật khẩu không đúng.';
                        } else if (status === 402) {
                          return 'Email chưa được xác thực.';
                        } else if (status === 403) {
                          return message || 'Tài khoản đã bị khóa.';
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
                    required: true,
                  },
                  {
                    name: 'password',
                    type: 'password',
                    label: 'Mật khẩu',
                    placeholder: '',
                    disabled: isPending,
                    required: true,
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
                          onSuccess={handleLoginSuccess}
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
                onSuccessSubmit={(data) => {
                  setLastAttemptedEmail(data.email);
                  triggerLogin(data);
                }}
              />
            </div>
          </div>

          <div className="relative hidden md:block">
            <Image
              src="/web-background.png"
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

      <div className="text-center text-xs text-balance text-neutral-50">
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

      {/* Dialog để hỏi người dùng có muốn xác thực email không */}
      <Dialog open={showEmailVerifyDialog} onOpenChange={setShowEmailVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Xác thực Email</DialogTitle>
            <DialogDescription>
              Email của bạn chưa được xác thực. Bạn có muốn xác thực email này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEmailVerifyDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
              disabled={isSendingOtp}
              onClick={() => {
                sendOtp(pendingEmail, {
                  onSuccess: () => {
                    onSkipToEmailVerification(pendingEmail);
                    setShowEmailVerifyDialog(false);
                  },
                });
              }}
            >
              {isSendingOtp ? 'Đang gửi...' : 'Xác thực Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type VerifyEmailStepProps = {
  email: string;
  onVerified?: () => void;
};

function VerifyEmailStep({ email, onVerified }: VerifyEmailStepProps) {
  const {
    mutate: verifyOtp,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: { code: string }) =>
      authService.verifyEmailOtp({ email, code: payload.code }),
    onSuccess: () => onVerified?.(),
  });

  const [cooldown, setCooldown] = useState(30);
  useEffect(() => {
    setCooldown(30);
  }, [email]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const { mutate: resendCode, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const payload: ResendOtpSchema = { email };
      return authService.resendOtp(payload);
    },
    onSuccess: () => setCooldown(30),
  });

  return (
    <div className="space-y-2">
      <Card className={`overflow-hidden p-0 ${styles.cardContainer}`}>
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-[#99b94a] sm:text-xl">
                  Xác minh email của bạn
                </h3>
                <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                  Chúng tôi đã gửi mã xác minh 6 chữ số đến{' '}
                  <strong className="text-[#99b94a]">{email}</strong>
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="bg-danger/10">
                  <AlertCircleIcon />
                  <AlertTitle>Xác minh thất bại</AlertTitle>
                  <AlertDescription>
                    Mã không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới hoặc thử lại sau.
                  </AlertDescription>
                </Alert>
              )}
              <Form
                loading={isPending}
                className="flex flex-col gap-4"
                schema={verifyEmailOtpSchema.pick({ code: true })}
                fields={[
                  {
                    name: 'code',
                    type: 'text',
                    label: 'Mã xác thực',
                    placeholder: 'Nhập mã xác thực đã gửi đến email',
                  },
                ]}
                renderSubmitButton={(Button) => (
                  <Button className="w-full border-[#99b94a] bg-[#99b94a] hover:bg-[#7a8f3a]">
                    Xác thực
                  </Button>
                )}
                onSuccessSubmit={(data: { code: string }) => verifyOtp({ code: data.code })}
              />

              <div className="flex justify-center p-6">
                <button
                  type="button"
                  className="disabled:text-muted-foreground text-sm text-[#99b94a] hover:text-[#7a8f3a] hover:underline disabled:cursor-not-allowed"
                  disabled={cooldown > 0 || isResending}
                  onClick={() => resendCode()}
                >
                  {cooldown > 0
                    ? `Gửi lại mã (${cooldown}s)`
                    : isResending
                      ? 'Đang gửi…'
                      : 'Gửi lại mã'}
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <Image
              src="/web-background.png"
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
    </div>
  );
}
