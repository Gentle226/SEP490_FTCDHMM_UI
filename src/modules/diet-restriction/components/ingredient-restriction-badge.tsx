'use client';

import { AlertCircle, AlertTriangle, ClockAlert } from 'lucide-react';

import { RESTRICTION_TYPE_CONFIG } from '../types';

interface RestrictionBadgeProps {
  restrictionType: string | { value: string } | null | undefined;
  className?: string;
  compact?: boolean;
}

/**
 * Badge component to display ingredient dietary restrictions
 * Shows visual indicator of whether ingredient has diet restrictions
 */
export function IngredientRestrictionBadge({
  restrictionType,
  className = '',
  compact = false,
}: RestrictionBadgeProps) {
  if (!restrictionType) {
    return null;
  }

  // Extract value from object if needed
  const typeValue = typeof restrictionType === 'string' ? restrictionType : restrictionType?.value;

  if (!typeValue) {
    return null;
  }

  const config =
    RESTRICTION_TYPE_CONFIG[typeValue as keyof typeof RESTRICTION_TYPE_CONFIG] ||
    RESTRICTION_TYPE_CONFIG.ALLERGY;

  // Icon based on restriction type
  const getIcon = () => {
    switch (typeValue) {
      case 'ALLERGY':
        return <AlertTriangle className="h-4 w-4" />;
      case 'DISLIKE':
        return <AlertCircle className="h-4 w-4" />;
      case 'TEMPORARYAVOID':
        return <ClockAlert className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${className}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {getIcon()}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${className}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.color,
        color: config.color,
      }}
    >
      {getIcon()}
      <span>{config.label}</span>
    </div>
  );
}
