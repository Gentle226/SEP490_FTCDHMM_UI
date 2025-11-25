'use client';

import { RestrictionType } from '../types';

interface RestrictionBadgeProps {
  type: RestrictionType | string;
  className?: string;
}

/**
 * Badge component for displaying restriction types
 */
export function RestrictionBadge({ type, className }: RestrictionBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let label = '';

  switch (type) {
    case RestrictionType.ALLERGY:
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      label = 'Dị ứng';
      break;
    case RestrictionType.DISLIKE:
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      label = 'Không thích';
      break;
    case RestrictionType.TEMPORARYAVOID:
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      label = 'Tạm tránh';
      break;
    default:
      return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${bgColor} ${textColor} ${className}`}
    >
      {label}
    </span>
  );
}
