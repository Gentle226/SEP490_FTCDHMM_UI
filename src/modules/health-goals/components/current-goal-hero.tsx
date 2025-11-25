'use client';

import { ChevronRight, Target, X } from 'lucide-react';
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

export function CurrentGoalHero() {
  const { data: currentGoal = null, isLoading } = useCurrentHealthGoal();
  const removeGoal = useRemoveHealthGoal();

  const handleRemove = async () => {
    try {
      const goalId = currentGoal?.healthGoalId || currentGoal?.customHealthGoalId;
      if (!goalId) return;
      await removeGoal.mutateAsync(goalId);
      toast.success('Mục tiêu sức khỏe đã được xóa');
    } catch (_error) {
      toast.error('Không thể xóa mục tiêu sức khỏe');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  // Check if we have a current goal (the API returns the goal data directly, not nested)
  const hasGoal = currentGoal && currentGoal.name;
  const isCustomGoal = !!currentGoal?.customHealthGoalId;

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

  const mainTarget = currentGoal.targets?.[0];

  return (
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
                  className="bg-[#99b94a] text-xs font-semibold text-white sm:text-sm"
                >
                  ✓ Hoạt Động
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
          <Button
            onClick={handleRemove}
            size="icon"
            variant="ghost"
            className="h-9 w-9 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Summary Stats */}
        {mainTarget && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#99b94a]/10 p-4 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600">{mainTarget.name}</p>
              <p className="mt-1 text-lg font-bold text-[#99b94a] sm:text-xl">
                {mainTarget.minValue}-{mainTarget.maxValue}
              </p>
              <p className="text-xs text-gray-500">trên 100g</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Tổng Chỉ Số</p>
              <p className="mt-1 text-lg font-bold text-[#99b94a] sm:text-xl">
                {currentGoal.targets?.length ?? 0}
              </p>
              <p className="text-xs text-gray-500">dinh dưỡng</p>
            </div>
          </div>
        )}

        {/* All Targets */}
        {currentGoal.targets && currentGoal.targets.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-700 uppercase">
              Tất Cả Chỉ Số Dinh Dưỡng
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {currentGoal.targets.map((target) => (
                <div
                  key={target.nutrientId}
                  className="flex items-center justify-between rounded-lg border border-[#99b94a]/20 bg-[#99b94a]/5 px-3 py-2 sm:px-4 sm:py-3"
                >
                  <span className="truncate text-xs font-medium sm:text-sm">{target.name}</span>
                  <span className="ml-2 flex-shrink-0 text-xs font-semibold whitespace-nowrap text-[#99b94a]">
                    {target.minValue}-{target.maxValue}g
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
