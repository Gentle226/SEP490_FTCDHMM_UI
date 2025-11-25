'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { DatePickerWithInput } from '@/base/components/ui/date-picker-with-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';

import { useSetHealthGoal } from '../hooks';
import { CustomHealthGoalResponse, HealthGoalResponse } from '../types';

interface GoalSelectionDialogProps {
  goal: HealthGoalResponse | CustomHealthGoalResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalSelectionDialog({ goal, open, onOpenChange }: GoalSelectionDialogProps) {
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const setGoal = useSetHealthGoal();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Set default expiration date to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setExpirationDate(defaultDate);
    } else {
      setExpirationDate(undefined);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = async () => {
    if (!expirationDate) {
      toast.error('Vui lòng chọn ngày hết hạn');
      return;
    }

    try {
      const goalId = goal.id;
      const expirationDateTime = expirationDate.toISOString();
      await setGoal.mutateAsync({
        goalId,
        expiredAtUtc: expirationDateTime,
      });
      toast.success('Đã đặt mục tiêu sức khỏe thành công');
      handleOpen(false);
    } catch (_error) {
      toast.error('Lỗi khi đặt mục tiêu sức khỏe');
    }
  };

  const disableExpiredDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Đặt Mục Tiêu</DialogTitle>
          <DialogDescription>
            Đặt <span className="font-semibold text-gray-900">{goal.name}</span> làm mục tiêu hiện
            tại của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Goal Details */}
          <div className="rounded-lg bg-[#99b94a]/10 p-4">
            <h4 className="mb-3 font-semibold text-gray-900">{goal.name}</h4>
            <p className="mb-3 text-sm text-gray-700">{goal.description || 'Mục tiêu sức khỏe'}</p>
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-gray-600 uppercase">
                Chỉ Số Dinh Dưỡng
              </p>
              {goal.targets && goal.targets.length > 0 ? (
                <div className="space-y-1">
                  {goal.targets.slice(0, 3).map((target) => (
                    <div
                      key={target.nutrientId}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-gray-700">{target.name}</span>
                      <span className="text-[#99b94a]">
                        {target.minValue}-{target.maxValue}g
                      </span>
                    </div>
                  ))}
                  {goal.targets.length > 3 && (
                    <p className="pt-1 text-xs text-gray-600">
                      + {goal.targets.length - 3} chỉ số khác
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Expiration Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="expiration-date" className="font-semibold">
              Ngày Hết Hạn <span className="text-red-500">*</span>
            </Label>
            <DatePickerWithInput
              date={expirationDate}
              onDateChange={setExpirationDate}
              placeholder="Chọn ngày"
              disabledDays={disableExpiredDates}
            />
            <p className="text-xs text-gray-600">Chọn khi nào mục tiêu này sẽ hết hạn</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpen(false)}
            disabled={setGoal.isPending}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 bg-[#99b94a] hover:bg-[#7a8f3a]"
            onClick={handleConfirm}
            disabled={setGoal.isPending || !expirationDate}
          >
            {setGoal.isPending ? 'Đang Lưu...' : 'Xác Nhận'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
