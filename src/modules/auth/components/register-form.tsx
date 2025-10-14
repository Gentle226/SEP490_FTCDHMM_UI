'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { Form } from '@/base/components/ui/form';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import {
  RegisterSchema,
  ResendOtpSchema,
  registerSchema,
  verifyEmailOtpSchema,
} from '@/modules/auth/types';

import { authService } from '../services/auth.service';

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
            setStep(3);
            onStepChange?.(3);
          }}
        />
      );
    case 3:
      return (
        <SuccessStep
          onGoToLogin={() => {
            router.replace('/auth/login');
            onRegisterSuccess?.();
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
  onStepComplete?: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rePassword: string;
    phoneNumber: string;
  }) => void;
};

function RegisterStep1({ onStepComplete, error, loading }: RegisterStep1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterSchema) => {
    onStepComplete?.(data);
  };

  return (
    <div className="space-y-4">
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
                  errors?: string[] | string | Record<string, string[]>;
                  message?: string;
                  code?: string;
                };

                if (status === 415) {
                  return 'Email đã được đăng ký. Vui lòng sử dụng email khác.';
                }

                if (status === HttpStatusCode.BadRequest && responseData?.errors) {
                  // Handle different error formats
                  let errorMessages: string[] = [];

                  if (Array.isArray(responseData.errors)) {
                    errorMessages = responseData.errors;
                  } else if (typeof responseData.errors === 'string') {
                    errorMessages = [responseData.errors];
                  } else if (typeof responseData.errors === 'object') {
                    // Handle ASP.NET Core model validation errors format
                    errorMessages = Object.values(responseData.errors)
                      .flat()
                      .filter((msg): msg is string => typeof msg === 'string');
                  }

                  return (
                    <div className="space-y-1">
                      <div>Thông tin không hợp lệ:</div>
                      <ul className="list-inside list-disc space-y-1">
                        {errorMessages.map((errorMsg, index) => (
                          <li key={index} className="text-sm">
                            {errorMsg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                // Handle AppException format from middleware
                if (responseData?.message) {
                  return responseData.message;
                }
              }
              return 'Đã xảy ra lỗi bất ngờ khi đăng ký. Vui lòng thử lại sau.';
            })()}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và Tên trên cùng một hàng - sử dụng flex để không ảnh hưởng width của form */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="firstName">Họ</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Nhập họ"
              disabled={loading}
              {...register('firstName')}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="lastName">Tên</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Nhập tên"
              disabled={loading}
              {...register('lastName')}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="text"
            placeholder="Nhập email của bạn"
            disabled={loading}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <Input
            id="phoneNumber"
            type="text"
            placeholder="Nhập số điện thoại của bạn"
            disabled={loading}
            {...register('phoneNumber')}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt"
            disabled={loading}
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="rePassword">Xác nhận mật khẩu</Label>
          <Input
            id="rePassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            disabled={loading}
            {...register('rePassword')}
          />
          {errors.rePassword && <p className="text-sm text-red-500">{errors.rePassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full border-[#99b94a] bg-[#99b94a] hover:bg-[#7a8f3a]"
        >
          {loading ? 'Đang xử lý...' : 'Tiếp tục'}
        </Button>
      </form>
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
      const payload: ResendOtpSchema = { email, purpose: 'ConfirmAccountEmail' };
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
          {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : isResending ? 'Đang gửi…' : 'Gửi lại mã'}
        </button>
      </div>
    </div>
  );
}

type SuccessStepProps = {
  onGoToLogin?: () => void;
};

function SuccessStep({ onGoToLogin }: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[#99b94a]">Đăng ký thành công!</h3>
          <p className="text-gray-600">
            Tài khoản của bạn đã được tạo và xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.
          </p>
        </div>
      </div>

      <Button
        onClick={onGoToLogin}
        className="w-full border-[#99b94a] bg-[#99b94a] hover:bg-[#7a8f3a]"
      >
        Đi đến trang đăng nhập
      </Button>
    </div>
  );
}
