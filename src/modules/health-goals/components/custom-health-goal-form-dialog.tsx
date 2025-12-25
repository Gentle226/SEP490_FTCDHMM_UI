'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/base/components/ui/button';
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

import { getNutrientLimit, validateNutrientValue } from '../constants/nutrient-limits';
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
        minValue: z.coerce
          .number({
            required_error: 'Giá trị tối thiểu là bắt buộc',
            invalid_type_error: 'Giá trị tối thiểu là bắt buộc',
          })
          .min(0, 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0'),
        medianValue: z.coerce.number().min(0).optional(),
        maxValue: z.coerce
          .number({
            required_error: 'Giá trị tối đa là bắt buộc',
            invalid_type_error: 'Giá trị tối đa là bắt buộc',
          })
          .min(0, 'Giá trị tối đa phải lớn hơn 0'),
        minEnergyPct: z.coerce
          .number({ invalid_type_error: 'Giá trị % năng lượng tối thiểu là bắt buộc' })
          .min(0)
          .max(100)
          .optional(),
        medianEnergyPct: z.coerce.number().min(0).max(100).optional(),
        maxEnergyPct: z.coerce
          .number({ invalid_type_error: 'Giá trị % năng lượng tối đa là bắt buộc' })
          .min(0)
          .max(100)
          .optional(),
        weight: z.coerce.number().int().min(1).max(5).optional(),
      }),
    )
    .refine(
      (targets) =>
        targets.every((t) => {
          // For ENERGYPERCENT type, validate energy percentages
          if (t.targetType === 'ENERGYPERCENT') {
            if (t.minEnergyPct === undefined || t.maxEnergyPct === undefined) return false;
            return t.maxEnergyPct > t.minEnergyPct;
          }
          // For ABSOLUTE type or when targetType is not set, validate absolute values
          return t.maxValue > t.minValue;
        }),
      {
        message: 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
      },
    ),
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
  const [pendingFormData, setPendingFormData] = useState<CustomHealthGoalFormData | null>(null);
  const [safetyWarningDialog, setSafetyWarningDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });
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

  // Show validation errors as toast (sequentially - only first error)
  useEffect(() => {
    const getFirstValidationError = (): string | null => {
      // Check for name errors first
      if (errors.name?.message) {
        return errors.name.message;
      }
      // Check for description errors
      if (errors.description?.message) {
        return errors.description.message;
      }
      // Check for array-level targets errors (min > max validation)
      if (errors.targets?.root?.message) {
        return errors.targets.root.message;
      }
      // Check for individual target field errors
      if (errors.targets && Array.isArray(errors.targets)) {
        for (let i = 0; i < errors.targets.length; i++) {
          const target = errors.targets[i];
          if (target?.nutrientId?.message) {
            return `Chỉ số ${i + 1}: ${target.nutrientId.message}`;
          }
          if (target?.minValue?.message) {
            return `Chỉ số ${i + 1}: ${target.minValue.message}`;
          }
          if (target?.maxValue?.message) {
            return `Chỉ số ${i + 1}: ${target.maxValue.message}`;
          }
          if (target?.minEnergyPct?.message) {
            return `Chỉ số ${i + 1}: ${target.minEnergyPct.message}`;
          }
          if (target?.maxEnergyPct?.message) {
            return `Chỉ số ${i + 1}: ${target.maxEnergyPct.message}`;
          }
        }
      }
      return null;
    };

    const firstError = getFirstValidationError();
    if (firstError) {
      toast.error(firstError);
    }
  }, [errors]);

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

        // For micronutrients (non-required nutrients), auto set targetType to Absolute
        if (!isMacronutrient) {
          return {
            nutrientId: target.nutrientId,
            targetType: 'Absolute' as const,
            minValue: target.minValue,
            maxValue: target.maxValue,
            medianValue: target.medianValue || 0,
            // Clear energy percentage values for Absolute type
            minEnergyPct: 0,
            maxEnergyPct: 0,
            medianEnergyPct: 0,
            weight: target.weight || 1,
          };
        }

        // For macronutrients, always use EnergyPercentage
        return {
          nutrientId: target.nutrientId,
          targetType: 'EnergyPercentage' as const,
          // Clear absolute values for EnergyPercentage type
          minValue: 0,
          maxValue: 0,
          medianValue: 0,
          minEnergyPct: target.minEnergyPct || 0,
          maxEnergyPct: target.maxEnergyPct || 0,
          medianEnergyPct: target.medianEnergyPct || 0,
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
        await createGoal.mutateAsync(processedData);
        toast.success('Mục tiêu sức khỏe tùy chỉnh đã được tạo thành công');
      }
      onClose();
      reset();
    } catch {
      // toast.error(`Lỗi khi ${goal ? 'cập nhật' : 'tạo'} mục tiêu sức khỏe tùy chỉnh`);
    }
  };

  // Check for safety limit violations and return warning messages
  const checkSafetyLimitViolations = (data: CustomHealthGoalFormData): string[] => {
    const warnings: string[] = [];

    for (const target of data.targets) {
      const nutrient = nutrients.find((n) => n.id === target.nutrientId);
      if (!nutrient) continue;

      const isMacronutrient = requiredNutrients.some((n) => n.id === target.nutrientId);

      // Only check absolute values for micronutrients (macronutrients use energy percentage)
      if (!isMacronutrient) {
        const maxValidation = validateNutrientValue(nutrient.vietnameseName, target.maxValue);
        if (maxValidation.exceedsSafetyLimit) {
          warnings.push(`${nutrient.vietnameseName}: ${maxValidation.safetyWarning}`);
        }
      }
    }

    return warnings;
  };

  const onSubmit = async (data: CustomHealthGoalFormData) => {
    // Check for safety limit violations first
    const warnings = checkSafetyLimitViolations(data);

    if (warnings.length > 0) {
      // Show safety warning dialog
      setSafetyWarningDialog({
        open: true,
        message: `Các chỉ số sau vượt quá ngưỡng an toàn:\n\n${warnings.join('\n')}\n\nBạn có chắc chắn muốn tiếp tục?`,
        onConfirm: async () => {
          setSafetyWarningDialog({ open: false, message: '', onConfirm: () => {} });
          // Continue with the normal flow after confirming safety warning
          const hasCurrentGoal = currentGoal && currentGoal.name;
          if (!goal && hasCurrentGoal) {
            setPendingFormData(data);
            setIsConfirmDialogOpen(true);
            return;
          }
          await executeSubmit(data);
        },
      });
      return;
    }

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

  // Get all currently selected nutrient IDs
  const selectedNutrientIds =
    watch('targets')
      ?.map((t) => t.nutrientId)
      .filter(Boolean) || [];

  // Filter out already selected nutrients for each target
  const getAvailableNutrientOptions = (currentIndex: number): SelectOption[] => {
    const currentNutrientId = watch(`targets.${currentIndex}.nutrientId`);
    return nutrients
      .filter((nutrient) => {
        // Include if it's the currently selected nutrient for this target
        if (nutrient.id === currentNutrientId) return true;
        // Exclude if it's selected in another target
        return !selectedNutrientIds.includes(nutrient.id);
      })
      .map((nutrient) => ({
        value: nutrient.id,
        label: `${nutrient.vietnameseName} (${nutrient.unit})`,
      }));
  };

  // const nutrientOptions: SelectOption[] = nutrients.map((nutrient) => ({
  //   value: nutrient.id,
  //   label: `${nutrient.vietnameseName} (${nutrient.unit})`,
  // }));

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
              <Label htmlFor="name">
                Tên <span className="text-red-500">*</span>
              </Label>
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

          <div className="space-y-4">
            <Label>
              Chỉ Số Dinh Dưỡng (Trên 100g) <span className="text-red-500">*</span>
            </Label>

            {fields.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Chưa thêm chỉ số dinh dưỡng nào
              </p>
            )}

            {fields.map((field, index) => {
              const currentNutrientId = watch(`targets.${index}.nutrientId`);
              const currentNutrient = nutrients.find((n) => n.id === currentNutrientId);
              const isMacronutrient = requiredNutrients.some((n) => n.id === currentNutrientId);
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
                    <Label>
                      Chất Dinh Dưỡng <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      options={getAvailableNutrientOptions(index)}
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

                  {/* Micronutrients Section - Only for non-macro nutrients - Use inputs for ABSOLUTE */}
                  {!isMacronutrient && (
                    <div className="space-y-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-900">
                        Vi Chất (Micronutrients)
                      </p>

                      {(() => {
                        const nutrientLimit = currentNutrient
                          ? getNutrientLimit(currentNutrient.vietnameseName)
                          : null;
                        const minValidation = currentNutrient
                          ? validateNutrientValue(currentNutrient.vietnameseName, minValue)
                          : null;
                        const maxValidation = currentNutrient
                          ? validateNutrientValue(currentNutrient.vietnameseName, maxValue)
                          : null;

                        return (
                          <div className="space-y-3">
                            {nutrientLimit && (
                              <p className="text-xs text-gray-600">
                                RDA: {nutrientLimit.rda} {currentNutrient?.unit}
                                {nutrientLimit.safetyLimit !== null &&
                                  ` | Giới hạn an toàn: ${nutrientLimit.safetyLimit} ${currentNutrient?.unit}`}
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`targets.${index}.minValue`} className="text-xs">
                                  Giá Trị Tối Thiểu ({currentNutrient?.unit || 'g'})
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`targets.${index}.minValue`}
                                  placeholder="0"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register(`targets.${index}.minValue`, {
                                    valueAsNumber: true,
                                  })}
                                />
                                {minValidation?.belowRda && (
                                  <p className="flex items-center gap-1 text-xs text-amber-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    {minValidation.rdaWarning}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`targets.${index}.maxValue`} className="text-xs">
                                  Giá Trị Tối Đa ({currentNutrient?.unit || 'g'})
                                </Label>
                                <Input
                                  id={`targets.${index}.maxValue`}
                                  placeholder="100"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register(`targets.${index}.maxValue`, {
                                    valueAsNumber: true,
                                  })}
                                />
                                {maxValidation?.exceedsSafetyLimit && (
                                  <p className="flex items-center gap-1 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    {maxValidation.safetyWarning}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-2">
                        <Label htmlFor={`targets.${index}.weight`}>
                          Ưu Tiên (1-5, 5 là cao nhất) <span className="text-red-500">*</span>
                        </Label>
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
                        Đa Chất (Macronutrients) - Phần Trăm Năng Lượng
                      </p>

                      {/* Energy Percentage Fields - always shown for macronutrients */}
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
                          themeColor="#99b94a"
                        />

                        <div className="space-y-2">
                          <Label htmlFor={`targets.${index}.weight-energy`} className="text-xs">
                            Ưu Tiên (1-5, 5 là cao nhất) <span className="text-red-500">*</span>
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

      {/* Safety Warning Confirmation Dialog */}
      <ConfirmDialog
        open={safetyWarningDialog.open}
        onOpenChange={(open) => setSafetyWarningDialog((prev) => ({ ...prev, open }))}
        title="Cảnh Báo Vượt Ngưỡng An Toàn"
        description={safetyWarningDialog.message}
        confirmText="Tiếp Tục"
        cancelText="Hủy"
        onConfirm={safetyWarningDialog.onConfirm}
        variant="destructive"
      />
    </Dialog>
  );
}
