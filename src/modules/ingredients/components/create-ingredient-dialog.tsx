'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { HelpCircle, Lock, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

import { Nutrient, ingredientManagementService } from '../services/ingredient-management.service';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface ApiErrorResponse {
  code?: string;
  statusCode?: number;
  message?: string;
}

interface CreateIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NutrientRow {
  nutrientId: string;
  value?: number;
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

  // Initialize form with required nutrients when dialog opens
  useEffect(() => {
    if (open && requiredNutrients.length > 0 && !initializedRef.current) {
      // Initialize with required nutrients
      const initialRows = requiredNutrients.map((nutrient) => ({
        nutrientId: nutrient.id,
        value: undefined,
      }));
      setNutrientRows(initialRows);
      initializedRef.current = true;
    }
  }, [open, requiredNutrients]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open && initializedRef.current) {
      setName('');
      setSelectedCategoryIds([]);
      setDescription('');
      setImagePreview(null);
      setImageFile(null);
      setNutrientRows([]);
      setHasUnsavedChanges(false);
      setShowCancelConfirm(false);
      initializedRef.current = false;
    }
  }, [open]);

  // Track unsaved changes
  const handleInputChange = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

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
    onError: (error: AxiosError) => {
      console.warn('Create error:', error);
      // Check if error is due to duplicate name (EXISTS error code)
      const responseData = error?.response?.data as ApiErrorResponse;
      if (responseData?.code === 'EXISTS' || responseData?.statusCode === 415) {
        toast.error('Tên nguyên liệu đã tồn tại');
      } else {
        toast.error(error?.message || 'Không thể thêm nguyên liệu');
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
    setNutrientRows([...nutrientRows, { nutrientId: '', value: undefined }]);
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
      if (value === '') {
        updatedRows[index][field] = undefined;
      } else {
        const numValue = Number(value);
        // Validate nutrient values: max 9999999.999 (decimal precision constraint)
        if (numValue > 9999999.999) {
          toast.error('Giá trị không được vượt quá 9999999.999');
          return;
        }
        // Validate non-negative values
        if (numValue < 0) {
          toast.error('Giá trị không được âm');
          return;
        }
        updatedRows[index][field] = numValue;
      }
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
      (row) => row.nutrientId && (row.value === undefined || row.value === null),
    );

    if (incompletNutrients.length > 0) {
      toast.error('Vui lòng điền giá trị cho tất cả thành phần dinh dưỡng');
      return;
    }

    // Validate nutrient value constraints: value must be between 0 and 9999999.999
    for (const row of nutrientRows) {
      if (row.nutrientId && row.value !== undefined) {
        const value = row.value;

        if (value < 0 || value > 9999999.999) {
          const nutrientName =
            nutrients.find((n) => n.id === row.nutrientId)?.vietnameseName || 'Thành phần';
          toast.error(`${nutrientName}: Giá trị phải từ 0 đến 9999999.999`);
          return;
        }
      }
    }

    // Validate all required macronutrients are present
    const requiredMacroKeywords = {
      protein: ['protein', 'chất đạm'],
      fat: ['fat', 'lipid', 'tổng chất béo', 'chất béo'],
      carbohydrate: ['carbohydrate', 'tinh bột'],
    };

    const missingMacros: string[] = [];

    Object.entries(requiredMacroKeywords).forEach(([_, keywords]) => {
      const exists = nutrientRows.some((row) => {
        if (!row.nutrientId) return false;
        const nutrientInfo = nutrients.find((n) => n.id === row.nutrientId);
        return (
          nutrientInfo &&
          keywords.some((keyword) => nutrientInfo.vietnameseName.toLowerCase().includes(keyword))
        );
      });

      if (!exists) {
        // Find the macro name to display
        const macroNutrient = requiredNutrients.find((rn) =>
          keywords.some((keyword) => rn.vietnameseName.toLowerCase().includes(keyword)),
        );
        if (macroNutrient) {
          missingMacros.push(macroNutrient.vietnameseName);
        }
      }
    });

    if (missingMacros.length > 0) {
      toast.error(
        `Thiếu các chất dinh dưỡng bắt buộc: ${missingMacros.join(', ')}. Vui lòng thêm các thành phần này.`,
      );
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
        value: row.value,
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
            Thêm nguyên liệu mới
          </DialogTitle>
          <DialogDescription>Nhập thông tin nguyên liệu mới</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-w-0 space-y-5" noValidate>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên nguyên liệu <span className="font-bold text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 100));
                handleInputChange();
              }}
              placeholder="Nhập tên nguyên liệu..."
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500">{name.length}/100</p>
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
                    <p className="font-medium">📌 Hướng dẫn:</p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs">
                      <li>
                        <span className="font-semibold">4 Macronutrients bắt buộc:</span> Protein,
                        Chất béo, Tinh bột, Calories
                      </li>
                      <li>
                        <span className="font-semibold">Giá trị:</span> Giá trị dinh dưỡng
                        <span className="font-bold text-red-600">
                          {' '}
                          (bắt buộc, từ 0 đến 9999999.999)
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {nutrientRows.length > 0 && (
              <div className="space-y-3">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.2fr_0.6fr] gap-2 rounded-t-lg border-b-2 bg-lime-50 px-3 py-2">
                  <div className="text-sm font-bold text-lime-900">Tên Dinh Dưỡng</div>
                  <div className="text-center text-sm font-bold text-lime-900">
                    Giá trị
                    <span className="ml-1 text-red-500">*</span>
                  </div>
                  <div className="text-center text-sm font-bold text-lime-900">Xóa</div>
                </div>

                {/* Nutrient rows */}
                {nutrientRows.map((row, index) => {
                  const isRequired = isRequiredNutrient(row.nutrientId);
                  const unit = getNutrientUnit(row.nutrientId);
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[2fr_1.2fr_0.6fr] items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all ${
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

                      {/* Value input - BẮT BUỘC */}
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Giá trị"
                          value={row.value ?? ''}
                          onChange={(e) => handleNutrientChange(index, 'value', e.target.value)}
                          className={`w-full border-2 text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                            !row.value && row.value !== 0
                              ? 'border-red-300 bg-red-50'
                              : 'border-lime-300 bg-lime-50'
                          }`}
                          title="Bắt buộc (0 - 9999999.999)"
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
              disabled={createMutation.isPending}
              className="bg-[#99b94a] hover:bg-[#88a839]"
            >
              {createMutation.isPending ? 'Đang lưu...' : 'Thêm nguyên liệu'}
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
