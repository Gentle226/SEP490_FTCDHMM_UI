'use client';

import { AlertCircle, AlertTriangle, Utensils } from 'lucide-react';

import { RESTRICTION_TYPE_CONFIG } from '../types';
import { IngredientRestrictionMatch } from '../utils';

interface RestrictionBadgeProps {
  restrictions: IngredientRestrictionMatch[];
  className?: string;
  compact?: boolean;
}

/**
 * Badge component to display ingredient dietary restrictions
 * Shows visual indicator of whether ingredient has diet restrictions
 */
export function IngredientRestrictionBadge({
  restrictions,
  className = '',
  compact = false,
}: RestrictionBadgeProps) {
  const activeRestrictions = restrictions.filter((r) => !r.isExpired);

  if (activeRestrictions.length === 0) {
    return null;
  }

  // Get the most critical restriction
  const primaryRestriction = activeRestrictions[0];
  const config =
    RESTRICTION_TYPE_CONFIG[primaryRestriction.type as keyof typeof RESTRICTION_TYPE_CONFIG] ||
    RESTRICTION_TYPE_CONFIG.ALLERGY;

  // Icon based on restriction type
  const getIcon = () => {
    switch (primaryRestriction.type) {
      case 'ALLERGY':
        return <AlertTriangle className="h-4 w-4" />;
      case 'DISLIKE':
        return <AlertCircle className="h-4 w-4" />;
      case 'TEMPORARYAVOID':
        return <Utensils className="h-4 w-4" />;
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
        {activeRestrictions.length > 1 && <span>+{activeRestrictions.length - 1}</span>}
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
      {activeRestrictions.length > 1 && (
        <span className="ml-1 text-xs">({activeRestrictions.length})</span>
      )}
    </div>
  );
}
