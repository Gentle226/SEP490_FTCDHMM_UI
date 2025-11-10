'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon, ChevronDownIcon, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { DatePickerWithInput } from '@/base/components/ui/date-picker-with-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
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
import { GoogleSignInButton } from './google-signin-button';

type PasswordInputProps = {
  id: 'password' | 'rePassword';
  label: string;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  register: ReturnType<typeof useForm<RegisterSchema>>['register'];
};

function PasswordInput({ id, label, placeholder, disabled, error, register }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor={id}>
        {label} <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
          {...register(id)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
  onStepChange?: (step: number) => void;
}

export function RegisterForm({ onRegisterSuccess, onStepChange }: RegisterFormProps) {
  const router = useRouter();
  const _searchParams = useSearchParams();
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
          onSkipToEmailVerification={(email) => {
            setRegisteredEmail(email);
            setStep(2);
            onStepChange?.(2);
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
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Other';
  }) => void;
  onSkipToEmailVerification?: (email: string) => void;
};

function RegisterStep1({
  onStepComplete,
  error,
  loading,
  onSkipToEmailVerification,
}: RegisterStep1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const [showEmailVerifyDialog, setShowEmailVerifyDialog] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Mutation to resend OTP
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (email: string) => {
      const payload: ResendOtpSchema = { email, purpose: 'VERIFYACCOUNTEMAIL' };
      return authService.resendOtp(payload);
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    onStepComplete?.(data);
  };

  // Handle email already registered error
  useEffect(() => {
    if (error instanceof AxiosError && error.response?.status === 415) {
      const email = getValues('email');
      setPendingEmail(email);
      setShowEmailVerifyDialog(true);
    }
  }, [error, getValues]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="danger" className="bg-danger/10">
          <AlertCircleIcon />
          <AlertTitle>Không thể đăng ký</AlertTitle>
          <AlertDescription>
            {(() => {
              if (error instanceof AxiosError) {
                const status = error.response?.status;
                const responseData = error.response?.data as {
                  success?: boolean;
                  errors?: string[] | string | Record<string, string[]>;
                  message?: string;
                  code?: string;
                };

                if (status === 415) {
                  return 'Email đã được đăng ký. Vui lòng sử dụng email khác hoặc xác thực email của bạn.';
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
            <Label htmlFor="firstName">
              Họ <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="lastName">
              Tên <span className="text-red-500">*</span>
            </Label>
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
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="phoneNumber">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
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

        {/* Date of Birth and Gender on same line */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Date of Birth with DatePickerWithInput */}
          <div className="space-y-2">
            <Label>
              Ngày sinh <span className="text-red-500">*</span>
            </Label>
            <DatePickerWithInput
              date={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date);
                if (date) {
                  setValue('dateOfBirth', date);
                }
              }}
              disabled={loading}
              placeholder="dd/MM/yyyy"
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Gender with Dropdown */}
          <div className="space-y-2">
            <Label>
              Giới tính <span className="text-red-500">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={loading}
                >
                  <span>
                    {selectedGender === 'Male'
                      ? 'Nam'
                      : selectedGender === 'Female'
                        ? 'Nữ'
                        : selectedGender === 'Other'
                          ? 'Khác'
                          : 'Chọn giới tính'}
                  </span>
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedGender('Male');
                    setValue('gender', 'Male');
                  }}
                >
                  Nam
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedGender('Female');
                    setValue('gender', 'Female');
                  }}
                >
                  Nữ
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedGender('Other');
                    setValue('gender', 'Other');
                  }}
                >
                  Khác
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input type="hidden" {...register('gender')} value={selectedGender} />
            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="flex gap-3">
          <PasswordInput
            id="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            disabled={loading}
            error={errors.password?.message}
            register={register}
          />

          {/* Xác nhận mật khẩu */}
          <PasswordInput
            id="rePassword"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            disabled={loading}
            error={errors.rePassword?.message}
            register={register}
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-[80%] border-[#99b94a] bg-[#99b94a] hover:bg-[#7a8f3a]"
          >
            {loading ? 'Đang xử lý...' : 'Tiếp tục'}
          </Button>
        </div>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Hoặc tiếp tục với
          </span>
        </div>

        <div className="flex w-full justify-center">
          <div className="flex w-full max-w-[400px] items-center justify-center">
            <GoogleSignInButton
              theme="outline"
              size="large"
              text="signup_with"
              disabled={loading}
              onSuccess={() => {
                window.location.replace('/');
              }}
              onError={(error) => {
                console.error('Google register error:', error);
              }}
            />
          </div>
        </div>
      </form>

      {/* Dialog để hỏi người dùng có muốn xác thực email không */}
      <Dialog open={showEmailVerifyDialog} onOpenChange={setShowEmailVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Xác thực Email</DialogTitle>
            <DialogDescription>
              Email này đã được đăng ký nhưng chưa được xác thực. Bạn có muốn xác thực email này
              không?
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
                    onSkipToEmailVerification?.(pendingEmail);
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
      const payload: ResendOtpSchema = { email, purpose: 'VERIFYACCOUNTEMAIL' };
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
