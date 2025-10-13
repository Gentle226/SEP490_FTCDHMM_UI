'use client';

import { useState } from 'react';

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
import { Select } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';

interface Ingredient {
  id?: string;
  name: string;
  category: string;
  description?: string;
  unit?: string;
}

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient;
  onSave: (ingredient: Ingredient) => void;
}

const categoryOptions = [
  { value: 'gia-vi', label: 'Gia vị' },
  { value: 'thit', label: 'Thịt' },
  { value: 'ca', label: 'Cá' },
  { value: 'rau-cu', label: 'Rau củ' },
  { value: 'trai-cay', label: 'Trái cây' },
  { value: 'sua-trung', label: 'Sữa - Trứng' },
  { value: 'hat-dau', label: 'Hạt - Đậu' },
  { value: 'ngu-coc', label: 'Ngũ cốc' },
];

const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Lít (l)' },
  { value: 'ml', label: 'Mililít (ml)' },
  { value: 'con', label: 'Con' },
  { value: 'cai', label: 'Cái' },
  { value: 'qua', label: 'Quả' },
  { value: 'cu', label: 'Củ' },
  { value: 'canh', label: 'Cành' },
];

export function IngredientDialog({
  open,
  onOpenChange,
  ingredient,
  onSave,
}: IngredientDialogProps) {
  const [formData, setFormData] = useState<Ingredient>({
    name: ingredient?.name || '',
    category: ingredient?.category || '',
    description: ingredient?.description || '',
    unit: ingredient?.unit || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!ingredient?.id;

  const handleInputChange = (field: keyof Ingredient, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nguyên liệu là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên nguyên liệu phải có ít nhất 2 ký tự';
    }

    if (!formData.category) {
      newErrors.category = 'Phân loại là bắt buộc';
    }

    if (!formData.unit) {
      newErrors.unit = 'Đơn vị tính là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const ingredientToSave: Ingredient = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
    };

    if (isEditing && ingredient?.id) {
      ingredientToSave.id = ingredient.id;
    }

    onSave(ingredientToSave);
    onOpenChange(false);

    // Reset form
    setFormData({
      name: '',
      category: '',
      description: '',
      unit: '',
    });
    setErrors({});
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      name: ingredient?.name || '',
      category: ingredient?.category || '',
      description: ingredient?.description || '',
      unit: ingredient?.unit || '',
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#99b94a]">
            {isEditing ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin nguyên liệu.'
              : 'Nhập thông tin nguyên liệu mới vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Ingredient Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên nguyên liệu"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Phân loại <span className="text-red-500">*</span>
            </Label>
            <Select
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => handleInputChange('category', value || '')}
              placeholder="Chọn phân loại"
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Unit */}
          <div className="grid gap-2">
            <Label htmlFor="unit" className="text-sm font-medium">
              Đơn vị tính <span className="text-red-500">*</span>
            </Label>
            <Select
              options={unitOptions}
              value={formData.unit}
              onChange={(value) => handleInputChange('unit', value || '')}
              placeholder="Chọn đơn vị tính"
              className={errors.unit ? 'border-red-500' : ''}
            />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Mô tả (tùy chọn)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Nhập mô tả nguyên liệu"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-[#99b94a] text-white hover:bg-[#8aa63f]">
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
