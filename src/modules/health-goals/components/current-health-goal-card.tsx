'use client';

import { Target, X } from 'lucide-react';
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

export function CurrentHealthGoalCard() {
  const { data: currentGoal = null, isLoading } = useCurrentHealthGoal();
  const removeGoal = useRemoveHealthGoal();

  const handleRemove = async () => {
    try {
      await removeGoal.mutateAsync();
      toast.success('Mục tiêu sức khỏe đã được xóa');
    } catch (_error) {
      toast.error('Không thể xóa mục tiêu sức khỏe');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full sm:h-64" />;
  }

  // Check if we have a current goal (the API returns the goal data directly, not nested)
  const hasGoal = currentGoal && currentGoal.name;

  if (!hasGoal) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Target className="text-muted-foreground mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" />
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            Hiện tại chưa có mục tiêu sức khỏe nào được thiết lập.
            <br />
            Hãy đặt một mục tiêu sức khỏe để theo dõi các chỉ số dinh dưỡng của bạn.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentGoal) return null;

  return (
    <Card className="flex flex-col bg-white dark:bg-slate-950">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <CardTitle className="truncate text-base sm:text-lg">{currentGoal.name}</CardTitle>
              <Badge variant="default" className="flex-shrink-0 bg-[#99b94a] text-xs sm:text-sm">
                Hiện Tại
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-xs sm:text-sm">
              {currentGoal.description || 'Mục tiêu sức khỏe của bạn'}
            </CardDescription>
          </div>
          <Button
            onClick={handleRemove}
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium sm:text-sm">Chỉ Số Dinh Dưỡng (Trên 100g):</p>
            <div className="space-y-1 sm:space-y-2">
              {currentGoal.targets && currentGoal.targets.length > 0 ? (
                currentGoal.targets.map((target) => (
                  <div
                    key={target.nutrientId}
                    className="flex items-center justify-between rounded-lg border p-1.5 text-xs sm:p-2 sm:text-sm"
                  >
                    <span className="truncate pr-2 font-medium">{target.name}</span>
                    <span className="text-muted-foreground flex-shrink-0 whitespace-nowrap">
                      {target.minValue} - {target.maxValue} g
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Không có chỉ số dinh dưỡng nào
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
