'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ChefHat, HelpCircle, Lock, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// 5MB

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

import {
  Ingredient,
  Nutrient,
  ingredientManagementService,
} from '../services/ingredient-management.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface ApiErrorResponse {
  code?: string;
  statusCode?: number;
  message?: string;
}

interface EditIngredientDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NutrientRow {
  nutrientId: string;
  min?: number;
  max?: number;
  median?: number;
}

export function EditIngredientDialog({
  ingredient,
  open,
  onOpenChange,
}: EditIngredientDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutrientRows, setNutrientRows] = useState<NutrientRow[]>([]);
  const [showNutrientHelp, setShowNutrientHelp] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  // Fetch ingredient details when dialog opens
  const { data: detailedIngredient } = useQuery({
    queryKey: ['ingredient-detail', ingredient?.id],
    queryFn: () => {
      if (!ingredient?.id) throw new Error('No ingredient ID');
      return ingredientManagementService.getIngredientById(ingredient.id);
    },
    enabled: open && !!ingredient?.id,
    staleTime: Infinity, // Data never becomes stale while dialog is open
    gcTime: 0, // Don't garbage collect while dialog is open
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Reset form when dialog opens or detailed ingredient loads
  useEffect(() => {
    if (open && detailedIngredient && nutrients.length > 0) {
      console.warn('Loading ingredient:', detailedIngredient);

      setName(detailedIngredient.name);
      setSelectedCategoryIds(detailedIngredient.ingredientCategoryIds || []);
      setDescription(detailedIngredient.description || '');
      setImagePreview(detailedIngredient.image || null);
      setImageFile(null);

      // Load nutrients - match API response nutrients with the nutrients list by vietnameseName
      const allNutrientRows =
        detailedIngredient.nutrients?.map((n) => {
          // Find the matching nutrient by vietnameseName to get the nutrient ID
          const matchedNutrient = nutrients.find(
            (nutrient) => nutrient.vietnameseName === n.vietnameseName,
          );

          return {
            nutrientId: matchedNutrient?.id || '', // Use matched nutrient ID or empty string
            vietnameseName: n.vietnameseName,
            min: n.min,
            max: n.max,
            median: n.median,
          };
        }) || [];

      // Separate macronutrients and others
      const macroKeywords = [
        'protein',
        'chất đạm',
        'fat',
        'tổng chất béo',
        'carbohydrate',
        'tinh bột',
      ];
      const macroNutrients = allNutrientRows.filter((n) =>
        macroKeywords.some((keyword) => (n.vietnameseName || '').toLowerCase().includes(keyword)),
      );
      const otherNutrients = allNutrientRows.filter(
        (n) =>
          !macroKeywords.some((keyword) =>
            (n.vietnameseName || '').toLowerCase().includes(keyword),
          ),
      );

      // Combine: macronutrients first, then others
      const sortedNutrientRows = [...macroNutrients.slice(0, 3), ...otherNutrients];

      console.warn('Loaded nutrients:', sortedNutrientRows);
      setNutrientRows(sortedNutrientRows);
    }
  }, [open, ingredient?.id, detailedIngredient, nutrients]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setSelectedCategoryIds([]);
      setDescription('');
      setImagePreview(null);
      setImageFile(null);
      setNutrientRows([]);
      setHasUnsavedChanges(false);
      setShowCancelConfirm(false);
    }
  }, [open]);

  // Track unsaved changes
  const handleInputChange = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: {
      description?: string;
      image?: File;
      nutrients?: Nutrient[];
      ingredientCategoryIds?: string[];
    }) => {
      if (!ingredient) throw new Error('No ingredient selected');
      return ingredientManagementService.updateIngredient(ingredient.id, data);
    },
    onSuccess: () => {
      toast.success('Cập nhật nguyên liệu thành công');
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient-detail', ingredient?.id] });
      onOpenChange(false);
    },
    onError: (error: AxiosError) => {
      console.warn('Update error:', error);
      // Check if error is due to duplicate name (EXISTS error code)
      const responseData = error?.response?.data as ApiErrorResponse;
      if (responseData?.code === 'EXISTS' || responseData?.statusCode === 415) {
        toast.error('Tên nguyên liệu đã tồn tại');
      } else {
        toast.error(error?.message || 'Không thể cập nhật nguyên liệu');
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Chỉ hỗ trợ hình ảnh JPG, PNG và GIF. Bạn đã tải lên ${file.type}`);
        return;
      }

      // Validate file extension
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.split('.').pop();
      if (!fileExtension || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
        toast.error('Định dạng tệp không hợp lệ. Vui lòng tải lên JPG, PNG hoặc GIF');
        return;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast.error(
          `Kích thước hình ảnh không được vượt quá 5MB. Hình ảnh hiện tại là ${sizeMB}MB`,
        );
        return;
      }

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

    // Validate all nutrients have required fields
    const incompletNutrients = nutrientRows.filter(
      (row) => row.nutrientId && (row.median === undefined || row.median === null),
    );

    if (incompletNutrients.length > 0) {
      toast.error('Vui lòng điền giá trị Median cho tất cả thành phần dinh dưỡng');
      return;
    }

    // Validate nutrient value constraints: only median is required, median must >= 0
    // If min/max are provided: min >= 0, max >= 0, min < median <= max
    for (const row of nutrientRows) {
      if (row.nutrientId && row.median !== undefined) {
        const median = row.median;

        if (median < 0) {
          const nutrientName =
            nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
          toast.error(`${nutrientName}: Median phải lớn hơn 0`);
          return;
        }

        // If min is provided, validate: min >= 0 and min < median
        if (row.min !== undefined && row.min !== null) {
          if (row.min < 0) {
            const nutrientName =
              nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
            toast.error(`${nutrientName}: Min không được âm`);
            return;
          }
          if (row.min >= median) {
            const nutrientName =
              nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
            toast.error(`${nutrientName}: Min phải nhỏ hơn Median`);
            return;
          }
        }

        // If max is provided, validate: max >= 0 and median <= max
        if (row.max !== undefined && row.max !== null) {
          if (row.max < 0) {
            const nutrientName =
              nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
            toast.error(`${nutrientName}: Max không được âm`);
            return;
          }
          if (median > row.max) {
            const nutrientName =
              nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
            toast.error(`${nutrientName}: Median phải nhỏ hơn hoặc bằng Max`);
            return;
          }
        }
      }
    }

    const updateData: {
      description?: string;
      image?: File;
      nutrients?: Nutrient[];
      ingredientCategoryIds?: string[];
    } = {};

    if (description !== ingredient?.description) {
      updateData.description = description;
    }

    if (imageFile) {
      updateData.image = imageFile;
    }

    // Always send all nutrients (required and optional) as they are all needed
    if (nutrientRows.length > 0) {
      updateData.nutrients = nutrientRows
        .filter((row) => row.nutrientId) // Only include rows with a nutrient selected
        .map((row) => ({
          id: row.nutrientId,
          min: row.min,
          max: row.max,
          median: row.median,
        }));
    }

    // Always send ingredient categories if any are selected
    if (selectedCategoryIds.length > 0) {
      updateData.ingredientCategoryIds = selectedCategoryIds;
    }

    // Debug log
    console.warn('Submitting ingredient update:', {
      ingredientId: ingredient?.id,
      updateData,
    });

    updateMutation.mutate(updateData);
    setHasUnsavedChanges(false);
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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (newOpen === false && hasUnsavedChanges) {
          setShowCancelConfirm(true);
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#99b94a]">
            Chỉnh sửa nguyên liệu
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin nguyên liệu</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên nguyên liệu <span className="font-bold text-red-500">*</span>
            </Label>
            <Input id="name" value={name} readOnly className="bg-muted" />
          </div>

          {/* Category (multi-select with tags) */}
          <div className="space-y-2">
            <Label htmlFor="categories">
              Phân loại <span className="font-bold text-red-500">*</span>
            </Label>
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
              onChange={(e) => {
                setDescription(e.target.value.slice(0, 1000));
                handleInputChange();
              }}
              placeholder="Nguồn protein nạc, ít chất béo..."
              maxLength={1000}
              rows={3}
              className="resize-none break-words"
            />
            <p className="text-xs text-gray-500">{description.length}/1000</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Hình ảnh nguyên liệu <span className="font-bold text-red-500">*</span>
            </Label>
            <div className="flex justify-center">
              {imagePreview && imagePreview.trim() ? (
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
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Thành phần Dinh Dưỡng (Trên 100g)</Label>
                <span className="font-bold text-red-500">*</span>
                <button
                  type="button"
                  onClick={() => setShowNutrientHelp(!showNutrientHelp)}
                  className="ml-auto rounded-md p-1 transition-colors hover:bg-gray-100"
                  title="Xem hướng dẫn"
                >
                  <HelpCircle className="size-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              {showNutrientHelp && (
                <div className="animate-in fade-in rounded-lg border border-lime-200 bg-lime-50 p-3">
                  <div className="space-y-1 text-sm text-lime-900">
                    <p className="font-medium">
                      <ChefHat className="inline-block h-4 w-4" /> Hướng dẫn:
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs">
                      <li>
                        <span className="font-semibold">3 Macronutrients bắt buộc:</span> Protein,
                        Chất béo, Tinh bột
                      </li>
                      <li>
                        <span className="font-semibold">Min:</span> Giá trị tối thiểu (tùy chọn)
                      </li>
                      <li>
                        <span className="font-semibold">Median:</span> Giá trị trung bình
                        <span className="font-bold text-red-600"> (bắt buộc)</span>
                      </li>
                      <li>
                        <span className="font-semibold">Max:</span> Giá trị tối đa (tùy chọn)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {nutrientRows.length > 0 && (
              <div className="space-y-3">
                {/* Table header */}
                <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_0.9fr_0.6fr] gap-2 rounded-t-lg border-b-2 bg-lime-50 px-3 py-2">
                  <div className="text-sm font-bold text-lime-900">Tên Dinh Dưỡng</div>
                  <div className="text-center text-sm font-bold text-lime-900">Min</div>
                  <div className="text-center text-sm font-bold text-lime-900">
                    Median
                    <span className="ml-1 text-red-500">*</span>
                  </div>
                  <div className="text-center text-sm font-bold text-lime-900">Max</div>
                  <div className="text-center text-sm font-bold text-lime-900">Xóa</div>
                </div>

                {/* Nutrient rows */}
                {nutrientRows.map((row, index) => {
                  const isRequired = isRequiredNutrient(row.nutrientId);
                  const unit = getNutrientUnit(row.nutrientId);
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[1.8fr_0.9fr_0.9fr_0.9fr_0.6fr] items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all ${
                        isRequired
                          ? 'border-lime-200 bg-lime-50'
                          : 'border-gray-200 bg-white hover:border-lime-300'
                      }`}
                    >
                      {/* Nutrient dropdown - Tên dinh dưỡng */}
                      <div className="flex items-center gap-2">
                        <Select
                          options={getAvailableNutrientOptions(index)}
                          value={row.nutrientId}
                          onChange={(value) =>
                            handleNutrientChange(index, 'nutrientId', value || '')
                          }
                          placeholder="Chọn dinh dưỡng..."
                          className="w-full"
                          disabled={isRequired}
                        />
                      </div>

                      {/* Min input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="min"
                          value={row.min ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'min', e.target.value)}
                          className="w-full text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          title="Tối thiểu"
                        />
                        <span className="text-muted-foreground w-5 shrink-0 text-xs font-medium">
                          {unit}
                        </span>
                      </div>

                      {/* Median input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="median"
                          value={row.median ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'median', e.target.value)}
                          className={`w-full border-2 text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                            !row.median ? 'border-red-300 bg-red-50' : 'border-lime-300 bg-lime-50'
                          }`}
                          title="Bắt buộc"
                        />
                        <span className="text-muted-foreground w-5 shrink-0 text-xs font-medium">
                          {unit}
                        </span>
                      </div>

                      {/* Max input */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="max"
                          value={row.max ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'max', e.target.value)}
                          className="w-full text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          title="Tối đa"
                        />
                        <span className="text-muted-foreground w-5 shrink-0 text-xs font-medium">
                          {unit}
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
                            ? 'text-muted-foreground cursor-not-allowed justify-center hover:bg-transparent'
                            : 'justify-center text-red-600 hover:bg-red-50 hover:text-red-700'
                        }
                        title={isRequired ? 'Không thể xóa dinh dưỡng bắt buộc' : 'Xóa'}
                      >
                        {isRequired ? <Lock className="size-4" /> : <Trash2 className="size-4" />}
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
              className="w-full border-2 border-dashed border-lime-300 text-lime-700 hover:border-lime-400 hover:bg-lime-50"
            >
              <Plus className="mr-2 size-4" />
              Thêm Micronutrient (Khác)
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setShowCancelConfirm(true);
                } else {
                  onOpenChange(false);
                }
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#99b94a] hover:bg-[#88a839]"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>

          {/* Cancel confirmation dialog - overlay the whole form */}
          {showCancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Bạn có chắc muốn thoát?
                </h3>
                <p className="mb-6 text-base text-gray-600">
                  Bạn có thay đổi chưa lưu, bạn có chắc muốn thoát?
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    className="min-w-[140px]"
                  >
                    Tiếp tục chỉnh sửa
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCancelConfirm(false);
                      setHasUnsavedChanges(false);
                      onOpenChange(false);
                    }}
                    className="min-w-[140px] bg-red-600 hover:bg-red-700"
                  >
                    Thoát không lưu
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
