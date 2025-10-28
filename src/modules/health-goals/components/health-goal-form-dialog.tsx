'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Select, SelectOption } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';
import { NutrientInfo, nutrientService } from '@/modules/nutrients/services/nutrient.service';

import { useCreateHealthGoal, useUpdateHealthGoal } from '../hooks';
import { HealthGoalResponse } from '../types';

const healthGoalSchema = z.object({
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

type HealthGoalFormData = z.infer<typeof healthGoalSchema>;

interface HealthGoalFormDialogProps {
  goal?: HealthGoalResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HealthGoalFormDialog({ goal, isOpen, onClose }: HealthGoalFormDialogProps) {
  const [nutrients, setNutrients] = useState<NutrientInfo[]>([]);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const createHealthGoal = useCreateHealthGoal();
  const updateHealthGoal = useUpdateHealthGoal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<HealthGoalFormData>({
    resolver: zodResolver(healthGoalSchema),
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
        toast.error('Failed to load nutrients');
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

  const onSubmit = async (data: HealthGoalFormData) => {
    try {
      if (goal) {
        await updateHealthGoal.mutateAsync({
          id: goal.id,
          data,
        });
        toast.success('Health goal updated successfully');
      } else {
        await createHealthGoal.mutateAsync(data);
        toast.success('Health goal created successfully');
      }
      onClose();
      reset();
    } catch {
      toast.error(`Failed to ${goal ? 'update' : 'create'} health goal`);
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
            {goal ? 'Chỉnh Sửa Mục Tiêu Sức Khỏe' : 'Tạo Mục Tiêu Sức Khỏe'}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? 'Cập nhật chi tiết mục tiêu sức khỏe và chỉ số dinh dưỡng'
              : 'Tạo mục tiêu sức khỏe mới với các chỉ số dinh dưỡng'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <div className="flex h-6 items-center justify-between">
              <Label htmlFor="name">Tên</Label>
              <span className={`text-xs ${isNameFocused ? 'text-muted-foreground' : 'invisible'}`}>
                {watch('name')?.length || 0}/100
              </span>
            </div>
            <Input
              id="name"
              placeholder="Tăng cơ bắp"
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
              placeholder="Mô tả mục tiêu sức khỏe..."
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
              return (
                <div key={field.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Chỉ Số {index + 1}</p>
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
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Hủy
            </Button>
            <Button
              disabled={createHealthGoal.isPending || updateHealthGoal.isPending}
              type="submit"
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
            >
              {(createHealthGoal.isPending || updateHealthGoal.isPending) && (
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
