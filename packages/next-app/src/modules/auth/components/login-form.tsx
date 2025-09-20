'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
import { AlertCircleIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/base/components/ui/alert';
import { Form } from '@/base/components/ui/form';
import { LoginSchema, loginSchema } from '@/modules/auth/types';

import { authService } from '../services/auth.service';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
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
    <div className="space-y-6">
      {error && (
        <Alert variant="danger" className="bg-danger/10">
          <AlertCircleIcon />
          <AlertTitle>Không thể đăng nhập</AlertTitle>
          <AlertDescription>
            {error instanceof AxiosError && error.status === HttpStatusCode.Unauthorized
              ? 'Email hoặc mật khẩu không chính xác.'
              : 'Đã xảy ra lỗi bất ngờ khi đăng ký. Vui lòng thử lại sau.'}
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
            placeholder: '',
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
        renderSubmitButton={(Button) => <Button>Đăng nhập</Button>}
        onSuccessSubmit={(data) => triggerLogin(data)}
      />
    </div>
  );
}
