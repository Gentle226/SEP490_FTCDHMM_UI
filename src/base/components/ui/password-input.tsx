'use client';

import { ClassValue } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { ComponentProps, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { cn } from '@/base/lib';

interface PasswordInputProps extends Omit<ComponentProps<typeof Input>, 'type' | 'className'> {
  defaultShowPassword?: boolean;
  classNames?: {
    container?: ClassValue;
    input?: ClassValue;
    showPasswordButton?: ClassValue;
  };
}

export function PasswordInput({
  classNames = {},
  defaultShowPassword,
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(!!defaultShowPassword);

  const Icon = showPassword ? EyeOff : Eye;

  return (
    <div
      className={cn(
        'border-input flex items-center rounded-md border transition-all',
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px]',
        'has-[input[aria-invalid="true"]]:ring-danger/20 dark:has-[input[aria-invalid="true"]]:ring-danger/40 has-[input[aria-invalid="true"]]:border-danger',
        classNames.container,
      )}
    >
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'rounded-none border-0 shadow-none ring-0 focus-visible:ring-0',
          classNames.input,
        )}
        disabled={disabled}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => setShowPassword(!showPassword)}
        className={cn(classNames?.showPasswordButton)}
      >
        <Icon className="size-4" />
      </Button>
    </div>
  );
}
