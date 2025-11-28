'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/base/components/ui/button';
import { DatePickerWithInput } from '@/base/components/ui/date-picker-with-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { RangeSlider } from '@/base/components/ui/range-slider';
import { Select, SelectOption } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';
import { NutrientInfo, nutrientService } from '@/modules/nutrients/services/nutrient.service';

import {
  useCreateCustomHealthGoal,
  useCurrentHealthGoal,
  useUpdateCustomHealthGoal,
} from '../hooks';
import { CustomHealthGoalResponse } from '../types';
import { ConfirmDialog } from './confirm-dialog';

const customHealthGoalSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên phải có ít nhất 3 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  description: z.string().optional(),
  targets: z
    .array(
      z.object({
        nutrientId: z.string().min(1, 'Bắt buộc phải chọn ít nhất một chất dinh dưỡng'),
        targetType: z.string().optional(),
        minValue: z.coerce.number().min(0, 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0'),
        medianValue: z.coerce.number().min(0).optional(),
        maxValue: z.coerce.number().min(0, 'Giá trị tối đa phải lớn hơn 0'),
        minEnergyPct: z.coerce.number().min(0).max(100).optional(),
        medianEnergyPct: z.coerce.number().min(0).max(100).optional(),
        maxEnergyPct: z.coerce.number().min(0).max(100).optional(),
        weight: z.coerce.number().min(0).optional(),
      }),
    )
    .refine((targets) => targets.every((t) => t.maxValue > t.minValue), {
      message: 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
    }),
});

type CustomHealthGoalFormData = z.infer<typeof customHealthGoalSchema>;

interface CustomHealthGoalFormDialogProps {
  goal?: CustomHealthGoalResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomHealthGoalFormDialog({
  goal,
  isOpen,
  onClose,
}: CustomHealthGoalFormDialogProps) {
  const [nutrients, setNutrients] = useState<NutrientInfo[]>([]);
  const [requiredNutrients, setRequiredNutrients] = useState<NutrientInfo[]>([]);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [pendingFormData, setPendingFormData] = useState<CustomHealthGoalFormData | null>(null);
  const createGoal = useCreateCustomHealthGoal();
  const updateGoal = useUpdateCustomHealthGoal();
  const { data: currentGoal } = useCurrentHealthGoal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CustomHealthGoalFormData>({
    resolver: zodResolver(customHealthGoalSchema),
    defaultValues: {
      name: '',
      description: '',
      targets: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'targets',
  });

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const [allNutrients, required] = await Promise.all([
          nutrientService.getNutrients(),
          nutrientService.getRequiredNutrients(),
        ]);
        setNutrients(allNutrients);
        setRequiredNutrients(required);
      } catch {
        toast.error('Lỗi khi tải dữ liệu dinh dưỡng');
      }
    };
    fetchNutrients();
  }, []);

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        description: goal.description || '',
        targets: goal.targets.map((t) => ({
          nutrientId: t.nutrientId,
          targetType: t.targetType || '',
          minValue: t.minValue,
          medianValue: t.medianValue || 0,
          maxValue: t.maxValue,
          minEnergyPct: t.minEnergyPct || 0,
          medianEnergyPct: t.medianEnergyPct || 0,
          maxEnergyPct: t.maxEnergyPct || 0,
          weight: t.weight || 0,
        })),
      });
    } else {
      reset({
        name: '',
        description: '',
        targets: [
          {
            nutrientId: '',
            targetType: '',
            minValue: 0,
            medianValue: 0,
            maxValue: 220,
            minEnergyPct: 0,
            medianEnergyPct: 0,
            maxEnergyPct: 50,
            weight: 3,
          },
        ],
      });
    }
  }, [goal, reset]);

  const processFormData = (data: CustomHealthGoalFormData) => {
    return {
      ...data,
      targets: data.targets.map((target) => {
        const isMacronutrient = requiredNutrients.some((n) => n.id === target.nutrientId);

        // For micronutrients (non-required nutrients), auto set targetType to ABSOLUTE
        if (!isMacronutrient) {
          return {
            nutrientId: target.nutrientId,
            targetType: 'ABSOLUTE',
            minValue: target.minValue,
            maxValue: target.maxValue,
            medianValue: target.medianValue || 0,
            // Clear energy percentage values for ABSOLUTE type
            minEnergyPct: 0,
            maxEnergyPct: 0,
            medianEnergyPct: 0,
            weight: target.weight || 1,
          };
        }

        // For macronutrients, process based on targetType
        if (target.targetType === 'ENERGYPERCENT') {
          return {
            nutrientId: target.nutrientId,
            targetType: 'ENERGYPERCENT',
            // Clear absolute values for ENERGYPERCENT type
            minValue: 0,
            maxValue: 0,
            medianValue: 0,
            minEnergyPct: target.minEnergyPct || 0,
            maxEnergyPct: target.maxEnergyPct || 0,
            medianEnergyPct: target.medianEnergyPct || 0,
            weight: target.weight || 1,
          };
        }

        // Default to ABSOLUTE for macronutrients
        return {
          nutrientId: target.nutrientId,
          targetType: target.targetType || 'ABSOLUTE',
          minValue: target.minValue,
          maxValue: target.maxValue,
          medianValue: target.medianValue || 0,
          // Clear energy percentage values for ABSOLUTE type
          minEnergyPct: 0,
          maxEnergyPct: 0,
          medianEnergyPct: 0,
          weight: target.weight || 1,
        };
      }),
    };
  };

  const executeSubmit = async (data: CustomHealthGoalFormData) => {
    try {
      const processedData = processFormData(data);

      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data: processedData,
        });
        toast.success('Mục tiêu sức khỏe tùy chỉnh đã được cập nhật thành công');
      } else {
        const expiredAtUtcString = expirationDate ? expirationDate.toISOString() : undefined;
        await createGoal.mutateAsync({
          ...processedData,
          expiredAtUtc: expiredAtUtcString,
        });
        toast.success('Mục tiêu sức khỏe tùy chỉnh đã được tạo và đặt làm mục tiêu hiện tại');
      }
      onClose();
      reset();
      setExpirationDate(undefined);
    } catch {
      toast.error(`Lỗi khi ${goal ? 'cập nhật' : 'tạo'} mục tiêu sức khỏe tùy chỉnh`);
    }
  };

  const onSubmit = async (data: CustomHealthGoalFormData) => {
    // If creating new goal (not editing) and user has current goal, show confirm dialog
    const hasCurrentGoal = currentGoal && currentGoal.name;
    if (!goal && hasCurrentGoal) {
      setPendingFormData(data);
      setIsConfirmDialogOpen(true);
      return;
    }

    await executeSubmit(data);
  };

  const handleConfirmReplace = async () => {
    if (pendingFormData) {
      await executeSubmit(pendingFormData);
      setPendingFormData(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleAddTarget = () => {
    append({
      nutrientId: '',
      targetType: '',
      minValue: 0,
      medianValue: 0,
      maxValue: 220,
      minEnergyPct: 0,
      medianEnergyPct: 0,
      maxEnergyPct: 50,
      weight: 3,
    });
  };

  const nutrientOptions: SelectOption[] = nutrients.map((nutrient) => ({
    value: nutrient.id,
    label: `${nutrient.vietnameseName} (${nutrient.unit})`,
  }));

  const targetTypeOptions: SelectOption[] = [
    { value: 'ABSOLUTE', label: 'Absolute (Tuyệt Đối)' },
    { value: 'ENERGYPERCENT', label: 'Energy Percent (% Năng Lượng)' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Chỉnh Sửa Mục Tiêu Sức Khỏe Tùy Chỉnh' : 'Tạo Mục Tiêu Sức Khỏe Tùy Chỉnh'}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? 'Cập nhật chi tiết mục tiêu sức khỏe tùy chỉnh và chỉ số dinh dưỡng'
              : 'Tạo mục tiêu sức khỏe cá nhân hóa với các chỉ số dinh dưỡng cụ thể'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Tên</Label>
              <span className={`text-xs ${isNameFocused ? 'text-muted-foreground' : 'invisible'}`}>
                {watch('name')?.length || 0}/100
              </span>
            </div>
            <Input
              id="name"
              placeholder="Mục tiêu thể dục của tôi"
              maxLength={100}
              {...register('name', {
                onBlur: () => setIsNameFocused(false),
              })}
              onFocus={() => setIsNameFocused(true)}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô Tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả mục tiêu sức khỏe tùy chỉnh..."
              rows={3}
              {...register('description')}
              className="break-words"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {!goal && (
            <div className="space-y-2">
              <Label htmlFor="expiredAtUtc" className="font-semibold">
                Ngày Hết Hạn <span className="text-red-500">*</span>
              </Label>
              <DatePickerWithInput
                date={expirationDate}
                onDateChange={setExpirationDate}
                placeholder="Chọn ngày"
                disabledDays={(date: Date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  date.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
              <p className="text-xs text-gray-500">Để trống nếu muốn mục tiêu không có thời hạn</p>
            </div>
          )}

          <div className="space-y-4">
            <Label>Chỉ Số Dinh Dưỡng (Trên 100g)</Label>

            {fields.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Chưa thêm chỉ số dinh dưỡng nào
              </p>
            )}

            {fields.map((field, index) => {
              const currentNutrientId = watch(`targets.${index}.nutrientId`);
              const currentNutrient = nutrients.find((n) => n.id === currentNutrientId);
              const isMacronutrient = requiredNutrients.some((n) => n.id === currentNutrientId);
              const currentTargetType = watch(`targets.${index}.targetType`) || 'ABSOLUTE';
              const minValue = watch(`targets.${index}.minValue`) || 0;
              const maxValue = watch(`targets.${index}.maxValue`) || 0;

              return (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Chỉ Số {index + 1}</p>
                    <div className="flex items-center gap-2">
                      {fields.length > 1 && (
                        <Button
                          onClick={() => remove(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Chất Dinh Dưỡng</Label>
                    <Select
                      options={nutrientOptions}
                      placeholder="Chọn chất dinh dưỡng"
                      value={currentNutrientId}
                      onChange={(value) => {
                        if (value) setValue(`targets.${index}.nutrientId`, value);
                      }}
                    />
                    {errors.targets?.[index]?.nutrientId && (
                      <p className="text-sm text-red-600">
                        {errors.targets[index]?.nutrientId?.message}
                      </p>
                    )}
                  </div>

                  {/* Micronutrients Section - Only for non-macro nutrients */}
                  {!isMacronutrient && (
                    <div className="space-y-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-900">
                        Vi Chất (Micronutrients)
                      </p>

                      <div className="space-y-3">
                        <RangeSlider
                          min={0}
                          max={1000}
                          step={0.01}
                          value={[minValue || 0, maxValue || 0]}
                          onChange={(newRange) => {
                            setValue(`targets.${index}.minValue`, newRange[0]);
                            setValue(`targets.${index}.maxValue`, newRange[1]);
                          }}
                          unit={currentNutrient?.unit || 'gam'}
                          numberFormat={(value) => value.toFixed(2)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`targets.${index}.weight`}>Ưu Tiên (1-5)</Label>
                        <Input
                          id={`targets.${index}.weight`}
                          placeholder="1"
                          type="number"
                          step="1"
                          min="1"
                          max="5"
                          {...register(`targets.${index}.weight`)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Macronutrients Section - only show for required nutrients (Fat, Protein, Carbohydrate) */}
                  {isMacronutrient && (
                    <div className="space-y-3 rounded-lg bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-900">
                        Đa Chất (Macronutrients)
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor={`targets.${index}.targetType`}>Loại Mục Tiêu</Label>
                        <Select
                          options={targetTypeOptions}
                          placeholder="Chọn loại mục tiêu"
                          value={watch(`targets.${index}.targetType`)}
                          onChange={(value) => {
                            if (value) setValue(`targets.${index}.targetType`, value);
                          }}
                          searchable={false}
                        />
                      </div>

                      {/* Min, Max, Weight - only for ABSOLUTE */}
                      {currentTargetType === 'ABSOLUTE' && (
                        <div className="space-y-3">
                          <RangeSlider
                            min={0}
                            max={500}
                            step={0.01}
                            value={[minValue || 0, maxValue || 0]}
                            onChange={(newRange) => {
                              setValue(`targets.${index}.minValue`, newRange[0]);
                              setValue(`targets.${index}.maxValue`, newRange[1]);
                            }}
                            unit="gam"
                            numberFormat={(value) => value.toFixed(2)}
                          />

                          <div className="space-y-2">
                            <Label htmlFor={`targets.${index}.weight-macro`} className="text-xs">
                              Ưu Tiên (1-5)
                            </Label>
                            <Input
                              id={`targets.${index}.weight-macro`}
                              placeholder="1"
                              type="number"
                              step="1"
                              min="1"
                              max="5"
                              {...register(`targets.${index}.weight`)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Energy Percentage Fields - only for ENERGYPERCENT */}
                      {currentTargetType === 'ENERGYPERCENT' && (
                        <div className="space-y-3">
                          <RangeSlider
                            min={0}
                            max={100}
                            step={0.1}
                            value={[
                              watch(`targets.${index}.minEnergyPct`) || 0,
                              watch(`targets.${index}.maxEnergyPct`) || 0,
                            ]}
                            onChange={(newRange) => {
                              setValue(`targets.${index}.minEnergyPct`, newRange[0]);
                              setValue(`targets.${index}.maxEnergyPct`, newRange[1]);
                            }}
                            unit="%"
                            numberFormat={(value) => value.toFixed(1)}
                          />

                          <div className="space-y-2">
                            <Label htmlFor={`targets.${index}.weight-energy`} className="text-xs">
                              Ưu Tiên (1-5)
                            </Label>
                            <Input
                              id={`targets.${index}.weight-energy`}
                              placeholder="1"
                              type="number"
                              step="1"
                              min="1"
                              max="5"
                              {...register(`targets.${index}.weight`)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              onClick={handleAddTarget}
              size="sm"
              type="button"
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Chỉ Số
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Hủy
            </Button>
            <Button
              disabled={createGoal.isPending || updateGoal.isPending}
              type="submit"
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
            >
              {(createGoal.isPending || updateGoal.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {goal ? 'Cập Nhật' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Confirm dialog for replacing existing goal */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          setIsConfirmDialogOpen(open);
          if (!open) setPendingFormData(null);
        }}
        title="Thay Thế Mục Tiêu Hiện Tại"
        description={`Bạn đang có mục tiêu "${currentGoal?.name}" đang hoạt động. Tạo mục tiêu tùy chỉnh mới sẽ thay thế mục tiêu hiện tại. Bạn có muốn tiếp tục?`}
        confirmText="Thay Thế"
        cancelText="Hủy"
        onConfirm={handleConfirmReplace}
        isLoading={createGoal.isPending}
      />
    </Dialog>
  );
}
