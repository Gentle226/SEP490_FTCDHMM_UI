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
  const { data: currentGoals = [], isLoading } = useCurrentHealthGoal();
  const removeGoal = useRemoveHealthGoal();

  const handleRemove = async (goalId: string) => {
    try {
      await removeGoal.mutateAsync(goalId);
      toast.success('Mục tiêu sức khỏe đã được xóa');
    } catch (_error) {
      toast.error('Không thể xóa mục tiêu sức khỏe');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!currentGoals || currentGoals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-center">
            Hiện tại chưa có mục tiêu sức khỏe nào được thiết lập.
            <br />
            Hãy đặt một mục tiêu sức khỏe để theo dõi các chỉ số dinh dưỡng của bạn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {currentGoals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{goal.name}</CardTitle>
                  <Badge variant="default" className="bg-[#99b94a]">
                    Hiện Tại
                  </Badge>
                </div>
                <CardDescription>{goal.description || 'Mục tiêu sức khỏe của bạn'}</CardDescription>
              </div>
              <Button onClick={() => handleRemove(goal.id)} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm font-semibold">Chỉ Số Dinh Dưỡng Hàng Ngày</h4>
                <div className="space-y-2">
                  {goal.targets && goal.targets.length > 0 ? (
                    goal.targets.map((target) => (
                      <div
                        key={target.nutrientId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{target.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {target.minValue} - {target.maxValue}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Không có chỉ số dinh dưỡng nào</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
