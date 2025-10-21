'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Textarea } from '@/base/components/ui/textarea';

import {
  Ingredient,
  Nutrient,
  ingredientManagementService,
} from '../services/ingredient-management.service';

interface EditIngredientDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIngredientDialog({
  ingredient,
  open,
  onOpenChange,
}: EditIngredientDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);

  // Reset form when ingredient changes
  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setCategory(ingredient.ingredientCategoryIds?.[0] || '');
      setDescription(ingredient.description || '');
      setImagePreview(ingredient.image || null);
      setImageFile(null);
      setNutrients(ingredient.nutrients || []);
    }
  }, [ingredient]);

  const updateMutation = useMutation({
    mutationFn: async (data: { description?: string; image?: File; nutrients?: Nutrient[] }) => {
      if (!ingredient) throw new Error('No ingredient selected');
      return ingredientManagementService.updateIngredient(ingredient.id, data);
    },
    onSuccess: () => {
      alert('Cập nhật nguyên liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert(error.message || 'Không thể cập nhật nguyên liệu');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddNutrient = () => {
    setNutrients([...nutrients, { name: '', min: undefined, max: undefined, median: undefined }]);
  };

  const handleRemoveNutrient = (index: number) => {
    setNutrients(nutrients.filter((_, i) => i !== index));
  };

  const handleNutrientChange = (index: number, field: keyof Nutrient, value: string | number) => {
    const updatedNutrients = [...nutrients];
    if (field === 'name') {
      updatedNutrients[index][field] = value as string;
    } else {
      updatedNutrients[index][field] = value === '' ? undefined : Number(value);
    }
    setNutrients(updatedNutrients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: { description?: string; image?: File; nutrients?: Nutrient[] } = {};

    if (description !== ingredient?.description) {
      updateData.description = description;
    }

    if (imageFile) {
      updateData.image = imageFile;
    }

    if (JSON.stringify(nutrients) !== JSON.stringify(ingredient?.nutrients)) {
      updateData.nutrients = nutrients;
    }

    updateMutation.mutate(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chỉnh sửa nguyên liệu</DialogTitle>
          <DialogDescription>Cập nhật thông tin nguyên liệu</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên nguyên liệu</Label>
            <Input id="name" value={name} readOnly className="bg-muted" />
          </div>

          {/* Category (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="category">Phân loại</Label>
            <Input
              id="category"
              value={category || 'Chưa phân loại'}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Description (editable) */}
          <div className="space-y-2">
            <Label htmlFor="description">Thông tin dinh dưỡng</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả nguyên liệu..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Thêm thành phần dinh dưỡng</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="size-24 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="flex size-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <Upload className="size-8 text-gray-400" />
                </div>
              )}
              <div>
                <Label htmlFor="image-upload" className="sr-only">
                  Upload image
                </Label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Upload ingredient image"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                </Button>
              </div>
            </div>
          </div>

          {/* Nutrients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Thêm thành phần dinh dưỡng</Label>
              <Button
                type="button"
                onClick={handleAddNutrient}
                variant="outline"
                size="sm"
                className="bg-[#99b94a] text-[#1f2937] hover:bg-[#88a839] hover:text-[#99b94a]"
              >
                Thêm
              </Button>
            </div>

            {nutrients.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có thành phần dinh dưỡng nào</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 text-sm font-medium">
                  <div>Tên dinh dưỡng</div>
                  <div>Định lượng</div>
                  <div>1 kg</div>
                  <div>Hành động</div>
                </div>

                {nutrients.map((nutrient, index) => (
                  <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-2">
                    <Input
                      placeholder="Tên thành phần"
                      value={nutrient.name}
                      onChange={(e) => handleNutrientChange(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Giá trị"
                      value={nutrient.min ?? ''}
                      onChange={(e) => handleNutrientChange(index, 'min', e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-[#99b94a] px-2 py-1 text-xs text-white">gam</span>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveNutrient(index)}
                    >
                      Hủy
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#99b94a] hover:bg-[#88a839]"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
