'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AlertCircleIcon, ArrowLeft, CheckCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { Form } from '@/base/components/ui/form';
import {
  ForgotPasswordSchema,
  ResendOtpSchema,
  ResetPasswordWithOtpSchema,
  Step,
  VerifyEmailOtpSchema,
  forgotPasswordSchema,
  otpOnlySchema,
  passwordOnlySchema,
} from '@/modules/auth/types';

import { authService } from '../services/auth.service';

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
    <div className="mb-4 flex items-center justify-center sm:mb-6">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
            currentStep === 'email'
              ? 'bg-green-500 text-white'
              : ['otp', 'password', 'success'].includes(currentStep)
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {['otp', 'password', 'success'].includes(currentStep) ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
        <div
          className={`h-0.5 w-10 sm:w-16 ${['otp', 'password', 'success'].includes(currentStep) ? 'bg-lime-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
            currentStep === 'otp'
              ? 'bg-green-500 text-white'
              : ['password', 'success'].includes(currentStep)
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {['password', 'success'].includes(currentStep) ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <span className="text-xs sm:text-sm">2</span>
          )}
        </div>
        <div
          className={`h-0.5 w-10 sm:w-16 ${['password', 'success'].includes(currentStep) ? 'bg-lime-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
            currentStep === 'password'
              ? 'bg-green-500 text-white'
              : currentStep === 'success'
                ? 'bg-lime-500 text-white'
                : 'bg-gray-200'
          }`}
        >
          {currentStep === 'success' ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
      </div>
    </div>
  );

  if (currentStep === 'success') {
    return (
      <div className="space-y-4 text-center sm:space-y-6">
        {renderStepIndicator()}
        <div className="space-y-3 sm:space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
            <CheckCircle className="h-7 w-7 text-[#99b94a] sm:h-8 sm:w-8" />
          </div>
          <h3 className="text-xl font-semibold text-[#99b94a] sm:text-2xl">
            Mật khẩu đã được đặt lại thành công!
          </h3>
          <p className="text-sm text-gray-600 sm:text-base">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới của
            mình.
          </p>
          <Button
            onClick={onBackToLogin}
            className="w-full bg-[#99b94a] text-white hover:bg-[#7a8f3a]"
          >
            Về trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {renderStepIndicator()}

      {/* Step 1: Email Input */}
      {currentStep === 'email' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#99b94a] sm:text-xl">Quên mật khẩu?</h3>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm">
              Nhập email của bạn và chúng tôi sẽ
              <br /> gửi mã xác nhận để đặt lại mật khẩu.
            </p>
          </div>

          {renderError(sendCodeError)}

          <Form
            className="flex flex-col gap-3 sm:gap-4"
            loading={isSendingCode}
            schema={forgotPasswordSchema}
            fields={[
              {
                name: 'email',
                type: 'text',
                label: 'Email',
                placeholder: 'Nhập email của bạn',
                disabled: isSendingCode,
                required: true,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white hover:bg-[#7a8f3a]">
                Gửi mã xác minh
              </Button>
            )}
            onSuccessSubmit={(data) => {
              setEmail(data.email);
              sendResetCode(data);
            }}
          />

          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full text-xs text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a] sm:text-sm"
            disabled={isSendingCode}
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Về trang đăng nhập
          </Button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 'otp' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#99b94a] sm:text-xl">
              Xác minh email của bạn
            </h3>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm">
              Chúng tôi đã gửi mã xác minh 6 chữ số đến{' '}
              <strong className="text-[#99b94a]">{email}</strong>
            </p>
          </div>

          {renderError(verifyOtpError)}

          <Form
            className="flex flex-col gap-3 sm:gap-4"
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
                required: true,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white hover:bg-[#7a8f3a]">Xác minh mã</Button>
            )}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email };
              setCode(data.code);
              verifyOtp(payload);
            }}
          />

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-xs text-gray-600 sm:text-sm">Gửi lại mã trong {countdown} giây</p>
            ) : (
              <Button
                variant="ghost"
                onClick={() => resendOtp({ email })}
                disabled={isResendingOtp}
                className="text-xs text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a] sm:text-sm"
              >
                {isResendingOtp ? 'Đang gửi...' : 'Gửi lại mã'}
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('email')}
            className="w-full text-xs text-[#99b94a] underline-offset-2 hover:text-[#7a8f3a] sm:text-sm"
            disabled={isVerifyingOtp}
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Đổi email
          </Button>
        </div>
      )}

      {/* Step 3: Reset Password */}
      {currentStep === 'password' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#99b94a] sm:text-xl">Tạo mật khẩu mới</h3>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm">
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </p>
          </div>

          {renderError(resetPasswordError)}

          <Form
            className="flex flex-col gap-3 sm:gap-4"
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
                required: true,
              },
              {
                name: 'rePassword',
                type: 'password',
                label: 'Xác nhận mật khẩu mới',
                placeholder: 'Xác nhận mật khẩu mới',
                disabled: isResettingPassword,
                required: true,
              },
            ]}
            renderSubmitButton={(Button) => (
              <Button className="bg-[#99b94a] text-white hover:bg-[#7a8f3a]">
                Đặt lại mật khẩu
              </Button>
            )}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email, token: resetToken };
              resetPassword(payload);
            }}
          />

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('otp')}
            className="w-full text-xs text-[#99b94a] underline-offset-2 sm:text-sm"
            disabled={isResettingPassword}
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Quay lại bước xác minh mã
          </Button>
        </div>
      )}
    </div>
  );
}
