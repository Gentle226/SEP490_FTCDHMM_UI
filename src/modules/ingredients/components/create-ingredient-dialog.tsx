'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
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
import { Select, SelectOption } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';
import { nutrientService } from '@/modules/nutrients';

import { Nutrient, ingredientManagementService } from '../services/ingredient-management.service';

interface CreateIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NutrientRow {
  nutrientId: string;
  min?: number;
  max?: number;
  median?: number;
}

export function CreateIngredientDialog({ open, onOpenChange }: CreateIngredientDialogProps) {
  const queryClient = useQueryClient();

  const initializedRef = useRef(false);

  const [name, setName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutrientRows, setNutrientRows] = useState<NutrientRow[]>([]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: () => ingredientManagementService.getCategories(),
  });

  // Fetch nutrients
  const { data: nutrients = [] } = useQuery({
    queryKey: ['nutrients'],
    queryFn: () => nutrientService.getNutrients(),
  });

  // Fetch required nutrients
  const { data: requiredNutrients = [] } = useQuery({
    queryKey: ['required-nutrients'],
    queryFn: () => nutrientService.getRequiredNutrients(),
  });

  // Initialize form with required nutrients when dialog opens
  useEffect(() => {
    if (open && requiredNutrients.length > 0) {
      initializedRef.current = false;
      if (!initializedRef.current) {
        // Initialize with required nutrients
        const initialRows = requiredNutrients.map((nutrient) => ({
          nutrientId: nutrient.id,
          min: undefined,
          max: undefined,
          median: undefined,
        }));
        setNutrientRows(initialRows);
        initializedRef.current = true;
      }
    } else if (!open) {
      // Reset form when dialog closes
      setName('');
      setSelectedCategoryIds([]);
      setDescription('');
      setImagePreview(null);
      setImageFile(null);
      setNutrientRows([]);
      initializedRef.current = false;
    }
  }, [open, requiredNutrients]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      image: File;
      nutrients: Nutrient[];
      ingredientCategoryIds: string[];
    }) => {
      return ingredientManagementService.createIngredient(data);
    },
    onSuccess: () => {
      toast.success('Thêm nguyên liệu thành công');
      // Invalidate ingredients list
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.warn('Create error:', error);
      toast.error(error.message || 'Không thể thêm nguyên liệu');
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
    setNutrientRows([
      ...nutrientRows,
      { nutrientId: '', min: undefined, max: undefined, median: undefined },
    ]);
  };

  const handleRemoveNutrient = (index: number) => {
    // Check if this is a required nutrient
    const nutrientToRemove = nutrientRows[index];
    const isRequired = requiredNutrients.some((req) => req.id === nutrientToRemove.nutrientId);

    if (isRequired) {
      toast.error('Không thể xóa thành phần dinh dưỡng bắt buộc');
      return;
    }

    setNutrientRows(nutrientRows.filter((_, i) => i !== index));
  };

  const handleNutrientChange = (
    index: number,
    field: keyof NutrientRow,
    value: string | number,
  ) => {
    const updatedRows = [...nutrientRows];
    if (field === 'nutrientId') {
      updatedRows[index][field] = value as string;
    } else {
      updatedRows[index][field] = value === '' ? undefined : Number(value);
    }
    setNutrientRows(updatedRows);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nguyên liệu');
      return;
    }

    if (!imageFile) {
      toast.error('Vui lòng chọn hình ảnh');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phân loại');
      return;
    }

    // Validate all nutrients have required fields
    const incompletNutrients = nutrientRows.filter(
      (row) => row.nutrientId && (row.median === undefined || row.median === null),
    );

    if (incompletNutrients.length > 0) {
      toast.error('Vui lòng điền giá trị Median cho tất cả thành phần dinh dưỡng');
      return;
    }

    // Validate all required nutrients are filled
    const filledNutrientIds = nutrientRows
      .filter((row) => row.nutrientId)
      .map((row) => row.nutrientId);
    const missingRequired = requiredNutrients.filter((req) => !filledNutrientIds.includes(req.id));

    if (missingRequired.length > 0) {
      toast.error('Vui lòng điền đầy đủ 4 thành phần dinh dưỡng bắt buộc');
      return;
    }

    const mappedNutrients = nutrientRows
      .filter((row) => row.nutrientId)
      .map((row) => ({
        id: row.nutrientId,
        min: row.min,
        max: row.max,
        median: row.median,
      }));

    // Debug log
    console.warn('Submitting ingredient create:', {
      name,
      description,
      imageFile,
      selectedCategoryIds,
      nutrients: mappedNutrients,
    });

    createMutation.mutate({
      name,
      description: description || undefined,
      image: imageFile,
      nutrients: mappedNutrients,
      ingredientCategoryIds: selectedCategoryIds,
    });
  };

  // Get category options for multi-select
  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  // Get nutrient options for dropdown (filter out already selected)
  const getAvailableNutrientOptions = (currentIndex: number): SelectOption[] => {
    const selectedNutrientIds = nutrientRows
      .map((row, idx) => (idx !== currentIndex ? row.nutrientId : null))
      .filter(Boolean);

    return nutrients
      .filter((n) => !selectedNutrientIds.includes(n.id))
      .map((n) => ({
        value: n.id,
        label: n.vietnameseName,
      }));
  };

  const getNutrientUnit = (nutrientId: string): string => {
    const nutrient = nutrients.find((n) => n.id === nutrientId);
    return nutrient?.unit || 'g';
  };

  const isRequiredNutrient = (nutrientId: string): boolean => {
    return requiredNutrients.some((req) => req.id === nutrientId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#99b94a]">
            Thêm nguyên liệu mới
          </DialogTitle>
          <DialogDescription>Nhập thông tin nguyên liệu mới</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên nguyên liệu *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nguyên liệu..."
              required
            />
          </div>

          {/* Category (multi-select with tags) */}
          <div className="space-y-2">
            <Label htmlFor="categories">Phân loại *</Label>
            <div className="space-y-2">
              {/* Display selected categories as badges */}
              <div className="flex min-h-[42px] flex-wrap gap-2 rounded-md border p-3">
                {selectedCategoryIds.length > 0 ? (
                  selectedCategoryIds.map((categoryId) => {
                    const category = categories.find((c) => c.id === categoryId);
                    return (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="flex items-center gap-1 bg-[#99b94a]/10 text-[#99b94a] hover:bg-[#99b94a]/20"
                      >
                        {category?.name || 'Unknown'}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(categoryId)}
                          className="ml-1 hover:text-red-600"
                          aria-label="Remove category"
                          title="Remove category"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground text-sm">Chưa có phân loại nào</span>
                )}
              </div>

              {/* Multi-select dropdown */}
              <Select
                multiple
                options={categoryOptions}
                value={selectedCategoryIds}
                onChange={(value) => setSelectedCategoryIds(value)}
                placeholder="Chọn phân loại..."
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nguồn protein nạc, ít chất béo..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Hình ảnh nguyên liệu *</Label>
            <div className="flex justify-center">
              {imagePreview ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="group relative rounded-lg border-2 border-dashed border-gray-300 p-0 transition-colors hover:border-[#99b94a]"
                    title="Click để thay đổi ảnh"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="size-40 rounded-lg object-cover group-hover:opacity-75"
                      onError={(e) => {
                        console.warn('Image load error:', imagePreview);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="size-8 text-[#99b94a]" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-3 -right-3 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                    aria-label="Remove image"
                    title="Xóa ảnh"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="group flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-[#99b94a]"
                  title="Click để tải ảnh lên"
                >
                  <Upload className="text-muted-foreground mb-2 size-8 group-hover:text-[#99b94a]" />
                  <span className="text-sm text-gray-500 group-hover:text-[#99b94a]">
                    Nhấn để tải ảnh
                  </span>
                </button>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload ingredient image"
              />
            </div>
          </div>

          {/* Nutrients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Thành phần dinh dưỡng</Label>
              <span className="text-muted-foreground text-xs">
                <Badge variant="warning" className="mr-1 text-xs">
                  *
                </Badge>
                Bắt buộc
              </span>
            </div>

            {nutrientRows.length > 0 && (
              <div className="space-y-2">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 border-b pb-2 text-sm font-medium">
                  <div>Tên dinh dưỡng</div>
                  <div>Tối thiểu (Min)</div>
                  <div>Trung bình (Median)</div>
                  <div>Tối đa (Max)</div>
                  <div>Hành động</div>
                </div>

                {/* Nutrient rows */}
                {nutrientRows.map((row, index) => {
                  const isRequired = isRequiredNutrient(row.nutrientId);
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 ${
                        isRequired ? 'rounded bg-yellow-50/50 p-2' : ''
                      }`}
                    >
                      {/* Nutrient dropdown */}
                      <div className="flex items-center gap-2">
                        <Select
                          options={getAvailableNutrientOptions(index)}
                          value={row.nutrientId}
                          onChange={(value) =>
                            handleNutrientChange(index, 'nutrientId', value || '')
                          }
                          placeholder="Chọn: Dinh dưỡng..."
                          className="w-full"
                          disabled={isRequired}
                        />
                      </div>

                      {/* Min input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="30"
                          value={row.min ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'min', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-muted-foreground text-xs">
                          {getNutrientUnit(row.nutrientId)}
                        </span>
                      </div>

                      {/* Median input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="31"
                          value={row.median ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'median', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-muted-foreground text-xs">
                          {getNutrientUnit(row.nutrientId)}
                        </span>
                      </div>

                      {/* Max input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="32"
                          value={row.max ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'max', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-muted-foreground text-xs">
                          {getNutrientUnit(row.nutrientId)}
                        </span>
                      </div>

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNutrient(index)}
                        disabled={isRequired}
                        className={
                          isRequired
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }
                        title={isRequired ? 'Không thể xóa thành phần bắt buộc' : 'Xóa'}
                      >
                        Hủy
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add nutrient button */}
            <Button
              type="button"
              onClick={handleAddNutrient}
              variant="outline"
              size="sm"
              className="w-full border-dashed"
            >
              <Plus className="mr-2 size-4" />
              Thêm thành phần dinh dưỡng
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#99b94a] hover:bg-[#88a839]"
            >
              {createMutation.isPending ? 'Đang lưu...' : 'Thêm nguyên liệu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
