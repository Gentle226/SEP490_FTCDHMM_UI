'use client';

import { Target } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { DatePickerWithDaysDisplay } from '@/base/components/ui/date-picker-with-days-display';
import { Label } from '@/base/components/ui/label';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useCurrentHealthGoal, useHealthGoals, useSetHealthGoal } from '../hooks';

export function HealthGoalLibrary() {
  const { data: healthGoals, isLoading } = useHealthGoals();
  const { data: currentGoal } = useCurrentHealthGoal();
  const setGoal = useSetHealthGoal();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id);
    setShowDatePicker(true);
    // Set default expiration date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setExpirationDate(defaultDate);
  };

  const handleConfirmGoal = async () => {
    if (!selectedGoalId || !expirationDate) {
      toast.error('Vui lòng chọn ngày hết hạn');
      return;
    }

    try {
      const expirationDateTime = expirationDate.toISOString();
      await setGoal.mutateAsync({
        goalId: selectedGoalId,
        type: 'SYSTEM', // System health goal from admin library
        expiredAtUtc: expirationDateTime,
      });
      toast.success('Đã chọn mục tiêu sức khỏe thành công');
      setShowDatePicker(false);
      setSelectedGoalId(null);
      setExpirationDate(undefined);
    } catch (_error) {
      toast.error('Lỗi khi chọn mục tiêu sức khỏe');
    }
  };

  // Check if a goal is already selected as current
  const isGoalSelected = (goalId: string) => {
    return currentGoal?.healthGoalId === goalId;
  };

  // Only allow dates from today onwards for health goal expiration
  const disableExpiredDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <p className="mb-2 text-sm font-medium">Chỉ Số Dinh Dưỡng (Trên 100g):</p>
                  <div className="space-y-2">
                    {goal.targets.map((target) => (
                      <div
                        key={target.nutrientId}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <span className="font-medium">{target.name}</span>
                        <span className="text-muted-foreground">
                          {target.minValue} - {target.maxValue} g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-[#99b94a] hover:bg-[#7a8f3a]"
                  disabled={setGoal.isPending || (isGoalSelected(goal.id) ?? false)}
                  onClick={() => handleSelectGoal(goal.id)}
                >
                  {isGoalSelected(goal.id) ? 'Đã Chọn' : 'Chọn Mục Tiêu Này'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && selectedGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Chọn Ngày Hết Hạn</CardTitle>
              <CardDescription>Chọn khi nào mục tiêu sức khỏe này sẽ hết hạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiration-date">
                  Ngày Hết Hạn <span className="text-red-500">*</span>
                </Label>
                <DatePickerWithDaysDisplay
                  date={expirationDate}
                  onDateChange={setExpirationDate}
                  placeholder="Chọn ngày"
                  themeColor="#99b94a"
                  disabledDays={disableExpiredDates}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDatePicker(false);
                    setSelectedGoalId(null);
                    setExpirationDate(undefined);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-[#99b94a] hover:bg-[#7a8f3a]"
                  onClick={handleConfirmGoal}
                  disabled={setGoal.isPending || !expirationDate}
                >
                  {setGoal.isPending ? 'Đang Lưu...' : 'Xác Nhận'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
