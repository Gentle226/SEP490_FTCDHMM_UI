'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Form } from '@/base/components/ui/form';

import { authService } from '../services/auth.service';
import { RegisterSchema, ResendOtpSchema, registerSchema, verifyEmailOtpSchema } from '../types';

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
  onStepChange?: (step: number) => void;
}

export function RegisterForm({ onRegisterSuccess, onStepChange }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const {
    mutate: triggerRegister,
    error: step1Error,
    isPending: step1Loading,
  } = useMutation({
    mutationFn: (payload: RegisterSchema) => authService.register(payload),
    onSuccess: (_data, variables) => {
      setRegisteredEmail(variables.email);
      // Move to step 2 to verify OTP
      setStep(2);
      onStepChange?.(2);
    },
  });

  switch (step) {
    case 1:
      return (
        <RegisterStep1
          loading={step1Loading}
          error={step1Error}
          onStepComplete={(data) => {
            triggerRegister(data);
          }}
        />
      );
    case 2:
      return (
        <VerifyEmailStep
          email={registeredEmail}
          onVerified={() => {
            router.replace('/');
            onRegisterSuccess?.();
            onStepChange?.(3);
          }}
        />
      );
    default:
      return <div>Unknown step</div>;
  }
}

type RegisterStep1Props = {
  loading?: boolean;
  error?: Error | null;
  onStepComplete?: (data: { email: string; password: string; rePassword: string }) => void;
};

function RegisterStep1({ onStepComplete, error, loading }: RegisterStep1Props) {
  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="danger" className="bg-danger/10">
          <AlertCircleIcon />
          <AlertTitle>Không thể đăng ký</AlertTitle>
          <AlertDescription>
            {(() => {
              if (error instanceof AxiosError) {
                const status = error.status ?? error.response?.status;
                const responseData = error.response?.data as {
                  success?: boolean;
                  errors?: string[];
                };

                if (status === HttpStatusCode.Conflict) {
                  return 'Email đã được đăng ký. Vui lòng sử dụng email khác.';
                }

                if (status === HttpStatusCode.BadRequest && responseData?.errors) {
                  return (
                    <div className="space-y-1">
                      <div>Mật khẩu không đáp ứng yêu cầu:</div>
                      <ul className="list-inside list-disc space-y-1">
                        {responseData.errors.map((errorMsg, index) => (
                          <li key={index} className="text-sm">
                            {errorMsg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              }
              return 'Đã xảy ra lỗi bất ngờ khi đăng ký. Vui lòng thử lại sau.';
            })()}
          </AlertDescription>
        </Alert>
      )}
      <Form
        loading={loading}
        className="flex flex-col gap-4"
        schema={registerSchema}
        fields={[
          {
            name: 'email',
            type: 'text',
            label: 'Email',
            placeholder: '',
          },
          {
            name: 'password',
            type: 'password',
            label: 'Mật khẩu',
            placeholder: '',
          },
          {
            name: 'rePassword',
            type: 'password',
            label: 'Xác nhận mật khẩu',
            placeholder: '',
          },
        ]}
        renderSubmitButton={(Button) => <Button>Tiếp tục</Button>}
        onSuccessSubmit={(data) => onStepComplete?.(data)}
      />
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
      const payload: ResendOtpSchema = { email, purpose: 'confirm' };
      return authService.resendOtp(payload);
    },
    onSuccess: () => setCooldown(30),
  });
  return (
    <div className="space-y-2">
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
        renderSubmitButton={(Button) => <Button>Xác thực</Button>}
        onSuccessSubmit={(data: { code: string }) => verifyOtp({ code: data.code })}
      />

      <button
        type="button"
        className="disabled:text-muted-foreground text-sm text-blue-600 hover:underline disabled:cursor-not-allowed"
        disabled={cooldown > 0 || isResending}
        onClick={() => resendCode()}
      >
        {cooldown > 0 ? `Resend code (${cooldown}s)` : isResending ? 'Sending…' : 'Resend code'}
      </button>
    </div>
  );
}
