'use client';

import { Flag } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/base/components/ui/button';
import { cn } from '@/base/lib';

import type { ReportTargetType } from '../types';

export interface ReportButtonProps {
  targetId: string;
  targetType: ReportTargetType;
  onReport?: (targetId: string, targetType: ReportTargetType) => void;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  showLabel?: boolean;
  disabled?: boolean;
}

export function ReportButton({
  targetId,
  targetType,
  onReport,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  disabled = false,
}: ReportButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onReport?.(targetId, targetType);
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      className={cn('hover:text-danger', className)}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      <Flag className="size-4" />
      {showLabel && <span className="ml-1">Báo cáo</span>}
    </Button>
  );

  return buttonContent;
}
