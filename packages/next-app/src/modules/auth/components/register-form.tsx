'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Form } from '@/base/components/ui/form';
import { Gender, UpdateUserSchema, gender, updateUserSchema, userService } from '@/modules/users';

import { authService } from '../services/auth.service';
import { RegisterSchema, registerSchema } from '../types';

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
  onStepChange?: (step: number) => void;
}

export function RegisterForm({ onRegisterSuccess, onStepChange }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    mutate: triggerRegister,
    error: step1Error,
    isPending: step1Loading,
  } = useMutation({
    mutationFn: (payload: RegisterSchema) => authService.register(payload),
    onSuccess: async ({ data }) => {
      await axios.post('/api/auth/set-cookie', {
        data: {
          ...data,
          user: {
            ...data.user,
            fullName: data.user.fullName && encodeURIComponent(data.user.fullName),
          },
        },
      });

      // Move to step 2 to collect additional info instead of navigating to homepage
      setStep(2);
      onStepChange?.(2);
    },
  });

  const {
    mutate: triggerUpdateUser,
    error: step2Error,
    isPending: step2Loading,
  } = useMutation({
    mutationFn: (payload: UpdateUserSchema) => userService.updateUserProfile(payload),
    onSuccess: async () => {
      // Navigate to homepage after completing profile setup
      router.replace('/');
      onRegisterSuccess?.();
      onStepChange?.(3);
    },
  });

  switch (step) {
    case 1:
      return (
        <RegisterStep1
          loading={step1Loading}
          error={step1Error}
          onStepComplete={({ email, password }) => {
            triggerRegister({ email, password });
          }}
        />
      );
    case 2:
      return (
        <RegisterStep2
          loading={step2Loading}
          error={step2Error}
          onStepComplete={({ fullName, gender }) => {
            triggerUpdateUser({
              fullName,
              gender,
            });
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
  onStepComplete?: (data: { email: string; password: string }) => void;
};

function RegisterStep1({ onStepComplete, error, loading }: RegisterStep1Props) {
  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="danger" className="bg-danger/10">
          <AlertCircleIcon />
          <AlertTitle>Không thể đăng ký</AlertTitle>
          <AlertDescription>
            {error instanceof AxiosError && error.status === HttpStatusCode.Conflict
              ? 'Email đã được đăng ký. Vui lòng sử dụng email khác.'
              : 'Đã xảy ra lỗi bất ngờ khi đăng ký. Vui lòng thử lại sau.'}
          </AlertDescription>
        </Alert>
      )}
      <Form
        loading={loading}
        className="flex flex-col gap-4"
        schema={registerSchema
          .pick({
            email: true,
            password: true,
          })
          .extend({
            confirmPassword: z.string().trim().nonempty('Mật khẩu xác nhận không được để trống'),
          })
          .refine(({ password, confirmPassword }) => password === confirmPassword, {
            message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
            path: ['confirmPassword'],
          })}
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
            name: 'confirmPassword',
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

type RegisterFormStep2Props = {
  error?: Error | null;
  loading?: boolean;
  onStepComplete?: (data: { fullName: string; gender?: Gender }) => void;
};

function RegisterStep2({ loading, onStepComplete, error }: RegisterFormStep2Props) {
  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="danger" className="bg-danger/10">
          <AlertCircleIcon />
          <AlertTitle>Không thể cập nhật thông tin</AlertTitle>
          <AlertDescription>
            Đã xảy ra lỗi bất ngờ khi cập nhật thông tin. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}
      <Form
        loading={loading}
        className="flex flex-col gap-4"
        schema={updateUserSchema
          .pick({
            fullName: true,
            gender: true,
          })
          .required({
            fullName: true,
          })}
        fields={[
          {
            name: 'fullName',
            type: 'text',
            label: 'Tên đầy đủ',
            placeholder: '',
          },
          {
            name: 'gender',
            type: 'select',
            label: 'Giới tính',
            placeholder: 'Chọn giới tính',
            searchable: false,
            clearable: false,
            options: Object.entries(gender).map(([value, label]) => ({
              value,
              label,
            })),
          },
        ]}
        renderSubmitButton={(Button) => <Button>Tiếp tục</Button>}
        onSuccessSubmit={(data) => onStepComplete?.(data)}
      />
    </div>
  );
}
