'use client';

import { Target } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useHealthGoals, useSetHealthGoal } from '../hooks';

export function HealthGoalLibrary() {
  const { data: healthGoals, isLoading } = useHealthGoals();
  const setGoal = useSetHealthGoal();

  const handleSelectGoal = async (id: string) => {
    try {
      await setGoal.mutateAsync(id);
      toast.success('Đã chọn mục tiêu sức khỏe thành công');
    } catch (_error) {
      toast.error('Lỗi khi chọn mục tiêu sức khỏe');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Chọn một mục tiêu sức khỏe được thiết kế sẵn phù hợp với nhu cầu của bạn
        </p>
      </div>

      {(!healthGoals || healthGoals.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-center">
              Chưa có mục tiêu sức khỏe nào trong thư viện.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthGoals?.map((goal) => (
          <Card key={goal.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {goal.description || 'Mục tiêu sức khỏe được thiết kế sẵn'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Chỉ Số Dinh Dưỡng:</p>
                  <div className="space-y-2">
                    {goal.targets.map((target) => (
                      <div
                        key={target.nutrientId}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <span className="font-medium">{target.name}</span>
                        <span className="text-muted-foreground">
                          {target.minValue} - {target.maxValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-[#99b94a] hover:bg-[#7a8f3a]"
                  disabled={setGoal.isPending}
                  onClick={() => handleSelectGoal(goal.id)}
                >
                  Chọn Mục Tiêu Này
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
