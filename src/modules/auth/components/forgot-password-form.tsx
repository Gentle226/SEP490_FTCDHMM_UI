'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AlertCircleIcon, ArrowLeft, CheckCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { Form } from '@/base/components/ui/form';
import {
  ForgotPasswordSchema,
  ResendOtpSchema,
  ResetPasswordWithOtpSchema,
  VerifyEmailOtpSchema,
  forgotPasswordSchema,
} from '@/modules/auth/types';

import { authService } from '../services/auth.service';

// Simplified schemas for the form steps
const otpOnlySchema = z.object({
  code: z.string().trim().nonempty('Verification code is required'),
});

const passwordOnlySchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ thường',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ hoa',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ số',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (@$!%*?&)',
      }),
    rePassword: z.string().trim().min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
  })
  .refine((v) => v.newPassword === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });

type Step = 'email' | 'otp' | 'password' | 'success';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send reset code
  const {
    mutate: sendResetCode,
    isPending: isSendingCode,
    error: sendCodeError,
  } = useMutation({
    mutationFn: (payload: ForgotPasswordSchema) => authService.forgotPassword(payload),
    onSuccess: () => {
      setCurrentStep('otp');
      startCountdown();
    },
  });

  // Step 2: Verify OTP
  const {
    mutate: verifyOtp,
    isPending: isVerifyingOtp,
    error: verifyOtpError,
  } = useMutation({
    mutationFn: (payload: VerifyEmailOtpSchema) =>
      authService.verifyEmailOtpForReset(payload, 'reset'),
    onSuccess: (response: { token: string }) => {
      setResetToken(response.token);
      setCurrentStep('password');
    },
  });

  // Step 3: Reset password
  const {
    mutate: resetPassword,
    isPending: isResettingPassword,
    error: resetPasswordError,
  } = useMutation({
    mutationFn: (payload: ResetPasswordWithOtpSchema) => authService.resetPasswordWithOtp(payload),
    onSuccess: () => {
      setCurrentStep('success');
    },
  });

  // Step 2: Resend OTP
  const { mutate: resendOtp, isPending: isResendingOtp } = useMutation({
    mutationFn: (payload: ResendOtpSchema) => authService.resendOtp(payload),
    onSuccess: () => {
      startCountdown();
    },
  });

  const renderError = (error: unknown) => {
    if (!error) return null;

    let message = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';

    if (error instanceof AxiosError) {
      const status = error.status ?? error.response?.status;
      const errorMessage = (error.response?.data as { message: string })?.message;
      const errorCode = (error.response?.data as { code: string })?.code;

      if (status === 408) {
        message = 'Mật khẩu mới không thể giống mật khẩu cũ.';
      } else if (errorCode === 'OTP_INVALID' || status === 406) {
        message = 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
      } else {
        message = errorMessage || message;
      }
    }

    return (
      <Alert variant="danger" className="bg-danger/10">
        <AlertCircleIcon />
        <AlertTitle>Đã xảy ra lỗi</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };

  const renderStepIndicator = () => (
    <div className="mb-6 flex items-center justify-center">
      <div className="flex items-center space-x-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentStep === 'email'
              ? 'bg-green-500 text-white'
              : ['otp', 'password', 'success'].includes(currentStep)
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {['otp', 'password', 'success'].includes(currentStep) ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
        </div>
        <div
          className={`h-0.5 w-16 ${['otp', 'password', 'success'].includes(currentStep) ? 'bg-lime-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentStep === 'otp'
              ? 'bg-green-500 text-white'
              : ['password', 'success'].includes(currentStep)
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {['password', 'success'].includes(currentStep) ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <span className="text-sm">2</span>
          )}
        </div>
        <div
          className={`h-0.5 w-16 ${['password', 'success'].includes(currentStep) ? 'bg-lime-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentStep === 'password'
              ? 'bg-green-500 text-white'
              : currentStep === 'success'
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {currentStep === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );

  if (currentStep === 'success') {
    return (
      <div className="space-y-6 text-center">
        {renderStepIndicator()}
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-[#99b94a]" />
          </div>
          <h3 className="text-2xl font-semibold text-[#99b94a]">
            Mật khẩu đã được đặt lại thành công!
          </h3>
          <p className="text-gray-600">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới của
            mình.
          </p>
          <Button onClick={onBackToLogin} className="w-full bg-[#99b94a] text-white">
            Về trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {/* Step 1: Email Input */}
      {currentStep === 'email' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#99b94a]">Quên mật khẩu?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Nhập email của bạn và chúng tôi sẽ
              <br /> gửi mã xác nhận để đặt lại mật khẩu.
            </p>
          </div>

          {renderError(sendCodeError)}

          <Form
            className="flex flex-col gap-4"
            loading={isSendingCode}
            schema={forgotPasswordSchema}
            fields={[
              {
                name: 'email',
                type: 'text',
                label: 'Email',
                placeholder: 'Nhập email của bạn',
                disabled: isSendingCode,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white">Gửi mã xác minh</Button>
            )}
            onSuccessSubmit={(data) => {
              setEmail(data.email);
              sendResetCode(data);
            }}
          />

          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full text-sm text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a]"
            disabled={isSendingCode}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về trang đăng nhập
          </Button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#99b94a]">Xác minh email của bạn</h3>
            <p className="mt-2 text-sm text-gray-600">
              Chúng tôi đã gửi mã xác minh 6 chữ số đến{' '}
              <strong className="text-[#99b94a]">{email}</strong>
            </p>
          </div>

          {renderError(verifyOtpError)}

          <Form
            className="flex flex-col gap-4"
            loading={isVerifyingOtp}
            schema={otpOnlySchema}
            defaultValues={{ code }}
            fields={[
              {
                name: 'code',
                type: 'text',
                label: 'Mã xác minh',
                placeholder: 'Nhập mã 6 chữ số',
                disabled: isVerifyingOtp,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white">Xác minh mã</Button>
            )}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email };
              setCode(data.code);
              verifyOtp(payload);
            }}
          />

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600">Gửi lại mã trong {countdown} giây</p>
            ) : (
              <Button
                variant="ghost"
                onClick={() => resendOtp({ email, purpose: 'FORGOTPASSWORD' })}
                disabled={isResendingOtp}
                className="text-sm text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a]"
              >
                {isResendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('email')}
            className="w-full text-sm text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a]"
            disabled={isVerifyingOtp}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Đổi email
          </Button>
        </div>
      )}

      {/* Step 3: Reset Password */}
      {currentStep === 'password' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-[#99b94a]">Tạo mật khẩu mới</h3>
            <p className="mt-2 text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </p>
          </div>

          {renderError(resetPasswordError)}

          <Form
            className="flex flex-col gap-4"
            loading={isResettingPassword}
            schema={passwordOnlySchema}
            defaultValues={{ newPassword: '', rePassword: '' }}
            fields={[
              {
                name: 'newPassword',
                type: 'password',
                label: 'Mật khẩu mới',
                placeholder: 'Nhập mật khẩu mới',
                disabled: isResettingPassword,
              },
              {
                name: 'rePassword',
                type: 'password',
                label: 'Xác nhận mật khẩu mới',
                placeholder: 'Xác nhận mật khẩu mới',
                disabled: isResettingPassword,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white">Đặt lại mật khẩu</Button>
            )}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email, token: resetToken };
              resetPassword(payload);
            }}
          />

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('otp')}
            className="w-full text-sm text-[#99b94a] underline-offset-2"
            disabled={isResettingPassword}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại bước xác minh mã
          </Button>
        </div>
      )}
    </div>
  );
}
