'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
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
  resetPasswordWithOtpSchema,
  verifyEmailOtpSchema,
} from '@/modules/auth/types';

import { authService } from '../services/auth.service';

// Simplified schemas for the form steps
const otpOnlySchema = z.object({
  code: z.string().trim().nonempty('Verification code is required'),
});

const passwordOnlySchema = z
  .object({
    newPassword: z.string().trim().min(8, 'Password must be at least 8 characters'),
    reNewPassword: z.string().trim().min(8, 'Password confirmation is required'),
  })
  .refine((v) => v.newPassword === v.reNewPassword, {
    message: 'Password confirmation does not match',
    path: ['reNewPassword'],
  });

type Step = 'email' | 'otp' | 'password' | 'success';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
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
    mutationFn: (payload: VerifyEmailOtpSchema) => authService.verifyEmailOtp(payload, 'forgot'),
    onSuccess: () => {
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

  const renderError = (error: any) => {
    if (!error) return null;

    let message = 'An unexpected error occurred. Please try again later.';

    if (error instanceof AxiosError) {
      const status = error.status ?? error.response?.status;
      const errorMessage = (error.response?.data as { message: string })?.message;

      if (status === HttpStatusCode.BadRequest) {
        if (errorMessage === 'Invalid OTP' || errorMessage === 'Invalid action') {
          message = 'Invalid verification code. Please check and try again.';
        } else if (errorMessage === 'OTP expired') {
          message = 'Verification code has expired. Please request a new one.';
        } else if (errorMessage === 'Email not found') {
          message = 'No account found with this email address.';
        } else {
          message = errorMessage || message;
        }
      }
    }

    return (
      <Alert variant="danger" className="bg-danger/10">
        <AlertCircleIcon />
        <AlertTitle>Error</AlertTitle>
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
              ? 'bg-blue-500 text-white'
              : ['otp', 'password', 'success'].includes(currentStep)
                ? 'bg-green-500 text-white'
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
          className={`h-0.5 w-16 ${['otp', 'password', 'success'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentStep === 'otp'
              ? 'bg-blue-500 text-white'
              : ['password', 'success'].includes(currentStep)
                ? 'bg-green-500 text-white'
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
          className={`h-0.5 w-16 ${['password', 'success'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-200'}`}
        />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentStep === 'password'
              ? 'bg-blue-500 text-white'
              : currentStep === 'success'
                ? 'bg-green-500 text-white'
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
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-semibold text-green-600">Password Reset Successful!</h3>
          <p className="text-gray-600">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <Button onClick={onBackToLogin} className="w-full">
            Back to Sign In
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
            <h3 className="text-xl font-semibold">Forgot Password?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a verification code to reset your
              password.
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
                placeholder: 'Enter your email address',
                disabled: isSendingCode,
              },
            ]}
            renderSubmitButton={(Button) => <Button>Send Verification Code</Button>}
            onSuccessSubmit={(data) => {
              setEmail(data.email);
              sendResetCode(data);
            }}
          />

          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="w-full text-sm"
            disabled={isSendingCode}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Verify Your Email</h3>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit verification code to <strong>{email}</strong>
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
                label: 'Verification Code',
                placeholder: 'Enter 6-digit code',
                disabled: isVerifyingOtp,
              },
            ]}
            renderSubmitButton={(Button) => <Button>Verify Code</Button>}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email };
              setCode(data.code);
              verifyOtp(payload);
            }}
          />

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600">Resend code in {countdown} seconds</p>
            ) : (
              <Button
                variant="ghost"
                onClick={() => resendOtp({ email, purpose: 'forgot' })}
                disabled={isResendingOtp}
                className="text-sm"
              >
                {isResendingOtp ? 'Sending...' : 'Resend Code'}
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('email')}
            className="w-full text-sm"
            disabled={isVerifyingOtp}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Email
          </Button>
        </div>
      )}

      {/* Step 3: Reset Password */}
      {currentStep === 'password' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold">Create New Password</h3>
            <p className="mt-2 text-sm text-gray-600">Please enter your new password below.</p>
          </div>

          {renderError(resetPasswordError)}

          <Form
            className="flex flex-col gap-4"
            loading={isResettingPassword}
            schema={passwordOnlySchema}
            defaultValues={{ newPassword: '', reNewPassword: '' }}
            fields={[
              {
                name: 'newPassword',
                type: 'password',
                label: 'New Password',
                placeholder: 'Enter new password (min. 8 characters)',
                disabled: isResettingPassword,
              },
              {
                name: 'reNewPassword',
                type: 'password',
                label: 'Confirm New Password',
                placeholder: 'Confirm your new password',
                disabled: isResettingPassword,
              },
            ]}
            renderSubmitButton={(Button) => <Button>Reset Password</Button>}
            onSuccessSubmit={(data) => {
              const payload = { ...data, email, code };
              resetPassword(payload);
            }}
          />

          <Button
            variant="ghost"
            onClick={() => setCurrentStep('otp')}
            className="w-full text-sm"
            disabled={isResettingPassword}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Verification
          </Button>
        </div>
      )}
    </div>
  );
}
