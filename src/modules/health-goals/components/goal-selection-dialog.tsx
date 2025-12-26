'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/base/components/ui/alert';
import { Button } from '@/base/components/ui/button';
import { DatePickerWithDaysDisplay } from '@/base/components/ui/date-picker-with-days-display';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/base/components/ui/radio-group';

import { useCurrentHealthGoal, useSetHealthGoal } from '../hooks';
import { UserHealthGoalResponse } from '../types';
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';
import { ConfirmDialog } from './confirm-dialog';

interface GoalSelectionDialogProps {
  goal: UserHealthGoalResponse;
  type: 'SYSTEM' | 'CUSTOM'; // Type of health goal
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DurationType = '4weeks' | '8weeks' | '12weeks' | 'custom';

export function GoalSelectionDialog({ goal, type, open, onOpenChange }: GoalSelectionDialogProps) {
  const [durationType, setDurationType] = useState<DurationType>('4weeks');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [dateValidation, setDateValidation] = useState<{
    type: 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const setGoal = useSetHealthGoal();
  const { data: currentGoal } = useCurrentHealthGoal();

  const hasCurrentGoal = currentGoal && currentGoal.name;

  const getExpirationDate = (): Date | undefined => {
    const today = new Date();

    switch (durationType) {
      case '4weeks':
        const fourWeeks = new Date(today);
        fourWeeks.setDate(fourWeeks.getDate() + 28);
        return fourWeeks;
      case '8weeks':
        const eightWeeks = new Date(today);
        eightWeeks.setDate(eightWeeks.getDate() + 56);
        return eightWeeks;
      case '12weeks':
        const twelveWeeks = new Date(today);
        twelveWeeks.setDate(twelveWeeks.getDate() + 84);
        return twelveWeeks;
      case 'custom':
        return customDate;
      default:
        return undefined;
    }
  };

  const validateCustomDate = (date: Date | undefined) => {
    if (!date) {
      setDateValidation({ type: null, message: '' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDifference < 7) {
      setDateValidation({
        type: 'error',
        message: 'Mục tiêu sức khỏe cần ít nhất 7 ngày để thấy hiệu quả.',
      });
    } else if (daysDifference <= 21) {
      setDateValidation({
        type: 'warning',
        message:
          'Thời gian này khá ngắn, kết quả có thể chưa rõ rệt. Chúng tôi khuyên bạn nên thử ít nhất 4 tuần.',
      });
    } else {
      setDateValidation({ type: null, message: '' });
    }
  };

  const handleCustomDateChange = (date: Date | undefined) => {
    setCustomDate(date);
    validateCustomDate(date);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDurationType('4weeks');
      setCustomDate(undefined);
      setDateValidation({ type: null, message: '' });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    const expirationDate = getExpirationDate();

    if (!expirationDate) {
      toast.error('Vui lòng chọn thời gian cho mục tiêu');
      return;
    }

    if (durationType === 'custom' && dateValidation.type === 'error') {
      toast.error('Vui lòng chọn ngày hợp lệ (ít nhất 7 ngày)');
      return;
    }

    // Show confirm dialog if there's an existing goal
    if (hasCurrentGoal) {
      setIsConfirmDialogOpen(true);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    const expirationDate = getExpirationDate();

    if (!expirationDate) {
      toast.error('Vui lòng chọn thời gian cho mục tiêu');
      return;
    }

    try {
      const goalId = goal.healthGoalId || goal.customHealthGoalId;
      if (!goalId) {
        toast.error('ID mục tiêu không hợp lệ');
        return;
      }
      const expirationDateTime = expirationDate.toISOString();
      await setGoal.mutateAsync({
        goalId,
        type,
        expiredAtUtc: expirationDateTime,
      });
      toast.success('Đã đặt mục tiêu sức khỏe thành công');
      setIsConfirmDialogOpen(false);
      handleOpen(false);
    } catch (_error) {
      // toast.error('Lỗi khi đặt mục tiêu sức khỏe');
    }
  };

  const disableExpiredDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
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
              <p className="mb-3 text-sm text-gray-700">
                {goal.description || 'Mục tiêu sức khỏe'}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-gray-600 uppercase">
                  Chỉ Số Dinh Dưỡng
                </p>
                {goal.targets && goal.targets.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {goal.targets.map((target) => (
                      <div
                        key={target.nutrientId}
                        className="flex flex-col rounded border border-[#99b94a]/20 bg-white p-2"
                      >
                        <span className="text-xs font-medium text-gray-700">
                          {getVietnameseNutrientName(target.name)}
                        </span>
                        <span className="text-xs font-bold text-[#99b94a]">
                          {formatNutrientTargetValue(target)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Expiration Date Picker */}
            <div className="space-y-4">
              <Label className="font-semibold">
                Bạn muốn duy trì mục tiêu này trong bao lâu? <span className="text-red-500">*</span>
              </Label>

              <RadioGroup
                value={durationType}
                onValueChange={(value) => setDurationType(value as DurationType)}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <RadioGroupItem value="4weeks" id="4weeks" />
                    <Label htmlFor="4weeks" className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">4 Tuần</span>
                      <span className="ml-2 text-xs text-[#99b94a]">(Khuyên dùng)</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <RadioGroupItem value="8weeks" id="8weeks" />
                    <Label htmlFor="8weeks" className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">8 Tuần</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <RadioGroupItem value="12weeks" id="12weeks" />
                    <Label htmlFor="12weeks" className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">12 Tuần</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">Tùy chọn ngày</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {durationType === 'custom' && (
                <div className="space-y-2 pl-1">
                  <DatePickerWithDaysDisplay
                    date={customDate}
                    onDateChange={handleCustomDateChange}
                    placeholder="Chọn ngày hết hạn"
                    themeColor="#99b94a"
                    disabledDays={disableExpiredDates}
                  />

                  {dateValidation.type === 'error' && (
                    <Alert variant="danger" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {dateValidation.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {dateValidation.type === 'warning' && (
                    <Alert className="border-amber-200 bg-amber-50 py-2 text-amber-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800">
                        {dateValidation.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {durationType !== 'custom' && (
                <p className="text-xs text-gray-600">
                  Mục tiêu sẽ hết hạn vào ngày{' '}
                  <span className="font-medium text-gray-900">
                    {getExpirationDate()?.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              )}
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
              onClick={handleSubmit}
              disabled={
                setGoal.isPending ||
                (durationType === 'custom' && (!customDate || dateValidation.type === 'error'))
              }
            >
              {setGoal.isPending ? 'Đang Lưu...' : 'Xác Nhận'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Thay Thế Mục Tiêu Hiện Tại"
        description={`Bạn đang có mục tiêu "${currentGoal?.name}" đang hoạt động. Nếu tiếp tục, mục tiêu mới "${goal.name}" sẽ thay thế mục tiêu hiện tại. Bạn có chắc chắn muốn tiếp tục?`}
        confirmText="Thay Thế"
        cancelText="Hủy"
        onConfirm={handleConfirm}
        isLoading={setGoal.isPending}
      />
    </>
  );
}
