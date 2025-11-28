'use client';

import { ChevronRight, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useCurrentHealthGoal, useRemoveHealthGoal } from '../hooks';
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';
import { ConfirmDialog } from './confirm-dialog';

export function CurrentGoalHero() {
  const { data: currentGoal = null, isLoading } = useCurrentHealthGoal();
  const removeGoal = useRemoveHealthGoal();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    try {
      await removeGoal.mutateAsync();
      toast.success('Mục tiêu sức khỏe đã được xóa');
      setIsRemoveDialogOpen(false);
    } catch (_error) {
      toast.error('Không thể xóa mục tiêu sức khỏe');
    }
  };

  const getValidityInfo = () => {
    if (!currentGoal?.expiredAtUtc) {
      return {
        isExpired: false,
        daysRemaining: null,
        displayText: 'Không có thời hạn',
      };
    }

    const expireDate = new Date(currentGoal.expiredAtUtc);
    const now = new Date();
    const daysRemaining = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isExpired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      displayText: daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Đã hết hạn',
    };
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  // Check if we have a current goal (the API returns the goal data directly, not nested)
  const hasGoal = currentGoal && currentGoal.name;
  const isCustomGoal = !!currentGoal?.customHealthGoalId;
  const validityInfo = getValidityInfo();

  if (!hasGoal) {
    return (
      <Card className="border-2 border-dashed border-[#99b94a]/30 bg-gradient-to-br from-[#99b94a]/5 to-transparent">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
          <Target className="mb-4 h-14 w-14 text-[#99b94a]" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa Có Mục Tiêu Nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            Hãy chọn một mục tiêu sức khỏe từ thư viện hoặc tạo một mục tiêu riêng để bắt đầu theo
            dõi.
          </p>
          <div className="inline-flex items-center text-sm font-medium text-[#99b94a]">
            Nhấp vào bên dưới để bắt đầu
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-[#99b94a]/20 bg-gradient-to-br from-white to-[#99b94a]/3 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-2xl font-bold text-[#99b94a] sm:text-3xl">
                  {currentGoal.name}
                </CardTitle>
                <div className="flex gap-1.5">
                  <Badge
                    variant="secondary"
                    className="ml-3 bg-[#99b94a] text-xs font-semibold text-white sm:text-sm"
                  >
                    ✓ Hoạt Động Hiện Tại
                  </Badge>
                  {isCustomGoal && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      Tùy Chỉnh
                    </Badge>
                  )}
                </div>
              </div>
              {currentGoal.description && (
                <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                  {currentGoal.description}
                </CardDescription>
              )}
            </div>
            {/* Remove Button - Top Right */}
            <Button
              onClick={() => setIsRemoveDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex-shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Hủy Mục Tiêu</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Validity Section */}
          <div
            className={`rounded-lg p-4 sm:p-6 ${
              validityInfo.isExpired
                ? 'border-2 border-red-200 bg-red-50'
                : 'border-2 border-[#99b94a]/20 bg-[#99b94a]/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide text-gray-600 uppercase">
                  Hiệu Lực
                </p>
                <p
                  className={`mt-2 text-xl font-bold sm:text-2xl ${
                    validityInfo.isExpired ? 'text-red-600' : 'text-[#99b94a]'
                  }`}
                >
                  {validityInfo.displayText}
                </p>
                {validityInfo.daysRemaining !== null && !validityInfo.isExpired && (
                  <p className="mt-1 text-xs text-gray-500">
                    Ngày hết hạn: {new Date(currentGoal.expiredAtUtc!).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              {validityInfo.isExpired && (
                <div className="text-red-600">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* All Targets - 4 per row */}
          {currentGoal.targets && currentGoal.targets.length > 0 && (
            <div>
              <p className="mb-4 text-xs font-semibold tracking-wide text-gray-700 uppercase">
                Các Chỉ Số Dinh Dưỡng
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {currentGoal.targets.map((target) => (
                  <div
                    key={target.nutrientId}
                    className="flex flex-col rounded-lg border border-[#99b94a]/20 bg-[#99b94a]/5 p-3 transition-colors hover:border-[#99b94a]/40 sm:p-4"
                  >
                    <span className="mb-2 truncate text-xs font-medium text-gray-600">
                      {getVietnameseNutrientName(target.name)}
                    </span>
                    <span className="text-sm font-bold text-[#99b94a]">
                      {formatNutrientTargetValue(target)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        title="Hủy Mục Tiêu Sức Khỏe"
        description={`Bạn có chắc chắn muốn hủy mục tiêu "${currentGoal.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Hủy Mục Tiêu"
        cancelText="Giữ Lại"
        onConfirm={handleRemove}
        variant="destructive"
        isLoading={removeGoal.isPending}
      />
    </>
  );
}
