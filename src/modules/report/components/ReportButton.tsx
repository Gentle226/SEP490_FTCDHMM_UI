'use client';

import { Flag } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/base/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';
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
  tooltipText?: string;
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
  tooltipText = 'Báo cáo',
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
      className={cn('text-muted-foreground hover:text-danger', className)}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      <Flag className="size-4" />
      {showLabel && <span className="ml-1">Báo cáo</span>}
    </Button>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
}
