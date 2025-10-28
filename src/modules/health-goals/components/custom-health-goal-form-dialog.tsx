'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Sliders, Trash2 } from 'lucide-react';
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

import { useCreateCustomHealthGoal, useUpdateCustomHealthGoal } from '../hooks';
import { CustomHealthGoalResponse } from '../types';

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
        minValue: z.coerce.number().min(0, 'Giá trị tối thiểu phải lớn hơn hoặc bằng 0'),
        maxValue: z.coerce.number().min(0, 'Giá trị tối đa phải lớn hơn 0'),
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
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [useSliderMode, setUseSliderMode] = useState<Record<number, boolean>>({});
  const createGoal = useCreateCustomHealthGoal();
  const updateGoal = useUpdateCustomHealthGoal();

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
        const data = await nutrientService.getNutrients();
        setNutrients(data);
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
          minValue: t.minValue,
          maxValue: t.maxValue,
        })),
      });
    } else {
      reset({
        name: '',
        description: '',
        targets: [
          {
            nutrientId: '',
            minValue: 0,
            maxValue: 0,
          },
        ],
      });
    }
  }, [goal, reset]);

  const onSubmit = async (data: CustomHealthGoalFormData) => {
    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data,
        });
        toast.success('Mục tiêu sức khỏe tùy chỉnh đã được cập nhật thành công');
      } else {
        await createGoal.mutateAsync(data);
        toast.success('Mục tiêu sức khỏe tùy chỉnh đã được tạo thành công');
      }
      onClose();
      reset();
    } catch {
      toast.error(`Lỗi khi ${goal ? 'cập nhật' : 'tạo'} mục tiêu sức khỏe tùy chỉnh`);
    }
  };

  const handleAddTarget = () => {
    append({
      nutrientId: '',
      minValue: 0,
      maxValue: 0,
    });
  };

  const nutrientOptions: SelectOption[] = nutrients.map((nutrient) => ({
    value: nutrient.id,
    label: `${nutrient.vietnameseName} (${nutrient.unit})`,
  }));

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
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Chỉ Số Dinh Dưỡng</Label>
              <Button onClick={handleAddTarget} size="sm" type="button" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Thêm Chỉ Số
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Chưa thêm chỉ số dinh dưỡng nào
              </p>
            )}

            {fields.map((field, index) => {
              const currentNutrientId = watch(`targets.${index}.nutrientId`);
              const currentNutrient = nutrients.find((n) => n.id === currentNutrientId);
              const minValue = watch(`targets.${index}.minValue`) || 0;
              const maxValue = watch(`targets.${index}.maxValue`) || 0;
              const isSliderMode = useSliderMode[index] || false;

              // Determine slider range based on nutrient type
              const getSliderMax = () => {
                if (!currentNutrient) return 500;
                // Common ranges for different nutrients
                if (currentNutrient.vietnameseName.includes('Protein')) return 300;
                if (currentNutrient.vietnameseName.includes('Carb')) return 500;
                if (currentNutrient.vietnameseName.includes('Fat')) return 150;
                if (currentNutrient.vietnameseName.includes('Calo')) return 5000;
                return 500; // Default
              };

              return (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Chỉ Số {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          setUseSliderMode((prev) => ({ ...prev, [index]: !prev[index] }))
                        }
                        size="sm"
                        type="button"
                        variant={isSliderMode ? 'default' : 'outline'}
                        className={isSliderMode ? 'bg-[#99b94a] hover:bg-[#7a8f3a]' : ''}
                      >
                        <Sliders className="mr-2 h-4 w-4" />
                        {isSliderMode ? 'Ẩn Slider' : 'Hiện Slider'}
                      </Button>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`targets.${index}.minValue`}>Giá Trị Tối Thiểu</Label>
                      <Input
                        id={`targets.${index}.minValue`}
                        placeholder="0"
                        type="number"
                        {...register(`targets.${index}.minValue`)}
                      />
                      {errors.targets?.[index]?.minValue && (
                        <p className="text-sm text-red-600">
                          {errors.targets[index]?.minValue?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`targets.${index}.maxValue`}>Giá Trị Tối Đa</Label>
                      <Input
                        id={`targets.${index}.maxValue`}
                        placeholder="0"
                        type="number"
                        {...register(`targets.${index}.maxValue`)}
                      />
                      {errors.targets?.[index]?.maxValue && (
                        <p className="text-sm text-red-600">
                          {errors.targets[index]?.maxValue?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSliderMode && currentNutrientId && (
                    <div className="space-y-2 border-t pt-4">
                      <Label>Điều Chỉnh Bằng Slider</Label>
                      <RangeSlider
                        min={0}
                        max={getSliderMax()}
                        step={1}
                        value={[minValue, maxValue]}
                        onChange={(value) => {
                          setValue(`targets.${index}.minValue`, value[0]);
                          setValue(`targets.${index}.maxValue`, value[1]);
                        }}
                        numberFormat={(value) =>
                          currentNutrient ? `${value} ${currentNutrient.unit}` : value.toString()
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
    </Dialog>
  );
}
