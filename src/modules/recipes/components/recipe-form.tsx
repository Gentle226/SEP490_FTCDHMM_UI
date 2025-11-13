'use client';

import { Plus, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

// 5MB

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { Select } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';
import { useDebounce } from '@/base/hooks';
import {
  Ingredient,
  ingredientManagementService,
} from '@/modules/ingredients/services/ingredient-management.service';
import {
  Label as LabelType,
  labelManagementService,
} from '@/modules/labels/services/label-management.service';

import { recipeService } from '../services/recipe.service';
import { CookingStep, RecipeDetail } from '../types';
import { CookingStepCard } from './cooking-step-card';
import { ImageCropDialog } from './image-crop-dialog';
import { IngredientCardWithDetails } from './ingredient-card-with-details';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface SelectedIngredient {
  id: string;
  name: string;
  quantityGram: number;
}

interface SelectedLabel {
  id: string;
  name: string;
  colorCode: string;
}

interface RecipeFormProps {
  recipeId?: string;
  initialData?: RecipeDetail;
  mode?: 'create' | 'edit';
}

export function RecipeForm({ recipeId, initialData, mode = 'create' }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [cookTime, setCookTime] = useState(0);
  const [ration, setRation] = useState(1);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: crypto.randomUUID(), stepOrder: 1, instruction: '', image: undefined },
  ]);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Labels state
  const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
  const [labelSearch, setLabelSearch] = useState('');
  const [labelSearchResults, setLabelSearchResults] = useState<LabelType[]>([]);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const debouncedLabelSearch = useDebounce(labelSearch, 300);

  // Ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState<Ingredient[]>([]);
  const [isIngredientPopoverOpen, setIsIngredientPopoverOpen] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const debouncedIngredientSearch = useDebounce(ingredientSearch, 300);

  // Warn user about unsaved changes before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  // Track unsaved changes when form fields change
  useEffect(() => {
    if (mode === 'create') {
      if (
        name ||
        description ||
        difficulty !== 'Easy' ||
        cookTime > 0 ||
        ration !== 1 ||
        mainImage ||
        selectedLabels.length > 0 ||
        selectedIngredients.length > 0 ||
        cookingSteps.length > 1 ||
        cookingSteps.some((s) => s.instruction)
      ) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }
  }, [
    name,
    description,
    difficulty,
    cookTime,
    ration,
    mainImage,
    selectedLabels,
    selectedIngredients,
    cookingSteps,
    mode,
  ]);

  // Search labels
  useEffect(() => {
    async function searchLabels() {
      if (!isLabelPopoverOpen) return;

      setIsLoadingLabels(true);
      try {
        const response = await labelManagementService.getLabels({
          keyword: debouncedLabelSearch,
          pageSize: 50,
        });
        setLabelSearchResults(response.items);
      } catch (error) {
        console.error('Failed to search labels:', error);
      } finally {
        setIsLoadingLabels(false);
      }
    }

    searchLabels();
  }, [debouncedLabelSearch, isLabelPopoverOpen]);

  // Search ingredients
  useEffect(() => {
    async function searchIngredients() {
      if (!isIngredientPopoverOpen) return;

      setIsLoadingIngredients(true);
      try {
        const response = await ingredientManagementService.getIngredients({
          search: debouncedIngredientSearch,
          pageNumber: 1,
          pageSize: 50,
        });
        setIngredientSearchResults(response.items);
      } catch (error) {
        console.error('Failed to search ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    }

    searchIngredients();
  }, [debouncedIngredientSearch, isIngredientPopoverOpen]);

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setDifficulty(initialData.difficulty.value as 'Easy' | 'Medium' | 'Hard');
      setCookTime(initialData.cookTime);
      setRation(initialData.ration);

      // Set labels
      if (initialData.labels && initialData.labels.length > 0) {
        setSelectedLabels(
          initialData.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorCode: label.colorCode,
          })),
        );
      }

      // Set ingredients - API uses 'ingredientId' field
      if (initialData.ingredients && initialData.ingredients.length > 0) {
        setSelectedIngredients(
          initialData.ingredients.map((ingredient) => ({
            id: ingredient.ingredientId || ingredient.id || '',
            name: ingredient.name,
            quantityGram: ingredient.quantityGram,
          })),
        );
      }

      // Set cooking steps
      if (initialData.cookingSteps && initialData.cookingSteps.length > 0) {
        setCookingSteps(
          initialData.cookingSteps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step) => ({
              id: crypto.randomUUID(),
              stepOrder: step.stepOrder,
              instruction: step.instruction,
              image: undefined,
              imagePreview: step.imageUrl,
            })),
        );
      }

      // Set main image preview
      if (initialData.imageUrl) {
        setMainImagePreview(initialData.imageUrl);
      }
    }
  }, [mode, initialData]);

  const validateImageFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Chỉ hỗ trợ hình ảnh JPG, PNG và GIF. Bạn đã tải lên ${file.type}`;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    if (!fileExtension || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
      return `Định dạng tệp không hợp lệ. Vui lòng tải lên JPG, PNG hoặc GIF`;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Kích thước hình ảnh không được vượt quá 5MB. Hình ảnh hiện tại là ${sizeMB}MB`;
    }

    return null;
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      processImageFile(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setMainImage(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setIsCropDialogOpen(false);
    setImageToCrop(null);
  };

  const handleStepImageChange = (index: number, file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newSteps = [...cookingSteps];
      newSteps[index].image = file;
      setCookingSteps(newSteps);
    };
    reader.readAsDataURL(file);
  };

  const addCookingStep = () => {
    setCookingSteps([
      ...cookingSteps,
      {
        id: crypto.randomUUID(),
        stepOrder: cookingSteps.length + 1,
        instruction: '',
        image: undefined,
      },
    ]);
  };

  const removeCookingStep = (index: number) => {
    const newSteps = cookingSteps.filter((_, i) => i !== index);
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepOrder: i + 1,
    }));
    setCookingSteps(renumberedSteps);
  };

  const updateStepDescription = (index: number, instruction: string) => {
    const newSteps = [...cookingSteps];
    newSteps[index].instruction = instruction;
    setCookingSteps(newSteps);
  };

  const reorderCookingSteps = (fromIndex: number, toIndex: number) => {
    const newSteps = [...cookingSteps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);

    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepOrder: i + 1,
    }));
    setCookingSteps(renumberedSteps);
  };

  const handleCookStepDragStart = (index: number) => {
    setDraggedStepIndex(index);
  };

  const handleCookStepDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleCookStepDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleCookStepDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedStepIndex !== null && draggedStepIndex !== toIndex) {
      reorderCookingSteps(draggedStepIndex, toIndex);
    }
    setDraggedStepIndex(null);
    setDragOverIndex(null);
  };

  const addLabel = (label: LabelType) => {
    if (!selectedLabels.some((l) => l.id === label.id)) {
      setSelectedLabels((prev) => [...prev, label]);
    }
    setIsLabelPopoverOpen(false);
    setLabelSearch('');
  };

  const removeLabel = (labelId: string) => {
    setSelectedLabels((prev) => prev.filter((l) => l.id !== labelId));
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.some((i) => i.id === ingredient.id)) {
      setSelectedIngredients((prev) => [
        ...prev,
        { id: ingredient.id, name: ingredient.name, quantityGram: 0 },
      ]);
    }
    setIsIngredientPopoverOpen(false);
    setIngredientSearch('');
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
  };

  const updateIngredientQuantity = (ingredientId: string, quantityGram: number) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) => (ing.id === ingredientId ? { ...ing, quantityGram } : ing)),
    );
  };

  const handleInvalidField = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    if (input.validity.valueMissing) {
      input.setCustomValidity('Vui lòng điền vào trường này');
    } else if (input.validity.rangeUnderflow) {
      input.setCustomValidity('Giá trị phải lớn hơn 0');
    } else if (input.validity.rangeOverflow) {
      input.setCustomValidity('Giá trị quá lớn');
    }
  };

  const handleInvalidTextarea = (e: React.InvalidEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    if (textarea.validity.valueMissing) {
      textarea.setCustomValidity('Vui lòng điền vào trường này');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên món ăn');
      return;
    }

    if (name.length > 100) {
      toast.error('Tên món không được vượt quá 100 ký tự');
      return;
    }

    if (description.length > 1500) {
      toast.error('Mô tả không được vượt quá 1500 ký tự');
      return;
    }

    // In edit mode, image is optional
    if (!mainImage && mode === 'create') {
      toast.error('Vui lòng tải lên hình ảnh món ăn');
      return;
    }

    if (selectedLabels.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nhãn');
      return;
    }

    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    if (selectedIngredients.some((ingredient) => ingredient.quantityGram <= 0)) {
      toast.error('Vui lòng nhập khối lượng cho tất cả các nguyên liệu');
      return;
    }

    if (cookingSteps.some((step) => !step.instruction.trim())) {
      toast.error('Vui lòng nhập mô tả cho tất cả các bước');
      return;
    }

    if (cookTime <= 0) {
      toast.error('Thời gian nấu phải lớn hơn 0');
      return;
    }

    if (ration < 1) {
      toast.error('Khẩu phần phải ít nhất là 1');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate ingredient IDs before submission
      const invalidIngredients = selectedIngredients.filter((i) => !i.id);
      if (invalidIngredients.length > 0) {
        console.error('Invalid ingredients found:', invalidIngredients);
        toast.error('Có lỗi với dữ liệu nguyên liệu. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      const recipeData = {
        name,
        description,
        difficulty,
        cookTime,
        image: mainImage || undefined,
        ration,
        labelIds: selectedLabels.map((l) => l.id),
        ingredients: selectedIngredients.map((i) => ({
          ingredientId: i.id,
          quantityGram: i.quantityGram,
        })),
        cookingSteps,
      };

      if (mode === 'edit' && recipeId) {
        await recipeService.updateRecipe(recipeId, recipeData);
        toast.success('Công thức đã được cập nhật thành công');
      } else {
        await recipeService.createRecipe(recipeData);
        toast.success('Công thức đã được tạo thành công');
      }

      setHasUnsavedChanges(false);
      router.push('/myrecipe');
    } catch (error) {
      console.error('Submit recipe error:', error);
      toast.error(
        mode === 'edit'
          ? 'Có lỗi xảy ra khi cập nhật công thức'
          : 'Có lỗi xảy ra khi tạo công thức',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-screen-2xl space-y-6 px-4">
      {/* Main Image and Basic Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
        {/* Image Section - Left */}
        <div className="space-y-2">
          <Label>Hình ảnh món ăn</Label>
          {mainImagePreview ? (
            <div className="relative h-75 w-full overflow-hidden rounded-lg border">
              <Image
                src={mainImagePreview}
                alt="Recipe preview"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setMainImage(null);
                  setMainImagePreview(null);
                }}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              className={`flex h-75 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                isDragOver
                  ? 'border-[#99b94a] bg-green-50 ring-2 ring-[#b2df3f]'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload
                className={`h-8 w-8 transition-colors ${
                  isDragOver ? 'text-[#99b94a]' : 'text-gray-400'
                }`}
              />
              <span
                className={`mt-2 px-2 text-center text-xs transition-colors ${
                  isDragOver ? 'text-[#99b94a]' : 'text-gray-500'
                }`}
              >
                {isDragOver ? 'Thả ảnh vào đây' : 'Tải ảnh lên hoặc kéo thả'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageChange}
              />
            </label>
          )}
        </div>

        {/* Right Section - Title, Description, Difficulty, Cook Time, Ration */}
        <div className="min-w-0 space-y-4">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên món</Label>
            <Input
              id="name"
              placeholder="Tên món ăn của bạn"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 255))}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              onInvalid={handleInvalidField}
              maxLength={255}
            />
            <p
              className={`text-right text-xs transition-opacity ${isNameFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {name.length}/255
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Hãy chia sẻ với mọi người về món này của bạn nhé - ai đã truyền cảm hứng cho bạn, tại sao nó đặc biệt, bạn thích thưởng thức nó như thế nào..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              onInvalid={handleInvalidTextarea}
              maxLength={2000}
              className="w-full break-words sm:min-h-24 md:min-h-28"
            />
            <p
              className={`text-right text-xs transition-opacity ${isDescriptionFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {description.length}/2000
            </p>
          </div>

          {/* Difficulty, Cook Time, Ration - Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select
                options={[
                  { value: 'Easy', label: 'Dễ' },
                  { value: 'Medium', label: 'Trung bình' },
                  { value: 'Hard', label: 'Khó' },
                ]}
                value={difficulty}
                onChange={(value) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard')}
                placeholder="Chọn độ khó"
                searchable={false}
              />
            </div>

            {/* Cook Time */}
            <div className="space-y-2">
              <Label htmlFor="cookTime">Thời gian nấu</Label>
              <div className="relative">
                <Input
                  id="cookTime"
                  type="number"
                  placeholder="30"
                  value={cookTime}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCookTime(Math.min(Math.max(val, 1), 1440));
                  }}
                  min="1"
                  max="1440"
                  step="1"
                  className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                  phút
                </span>
              </div>
            </div>

            {/* Ration */}
            <div className="space-y-2">
              <Label htmlFor="ration">Khẩu phần</Label>
              <div className="relative">
                <Input
                  id="ration"
                  type="number"
                  placeholder="2"
                  value={ration}
                  onChange={(e) => setRation(parseInt(e.target.value) || 1)}
                  onInvalid={handleInvalidField}
                  min="1"
                  className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                  người
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <Label>Nhãn</Label>

        {/* Selected Labels */}
        <div className="flex min-h-[60px] flex-wrap gap-2 rounded-lg border p-3">
          {selectedLabels.length === 0 ? (
            <span className="flex w-full justify-center pt-2 text-sm text-gray-400">
              Chưa có nhãn nào được chọn
            </span>
          ) : (
            selectedLabels.map((label) => {
              const labelStyle = { backgroundColor: label.colorCode } as React.CSSProperties;
              return (
                <div
                  key={label.id}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white"
                  style={labelStyle}
                  suppressHydrationWarning
                >
                  <span>{label.name}</span>
                  <button
                    type="button"
                    onClick={() => removeLabel(label.id)}
                    className="ml-1 rounded-full hover:bg-white/20"
                    aria-label={`Remove ${label.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Search and Add Labels */}
        <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhãn
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Tìm kiếm nhãn..."
                value={labelSearch}
                onValueChange={setLabelSearch}
              />
              <CommandList>
                {isLoadingLabels ? (
                  <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
                ) : labelSearchResults.length === 0 ? (
                  <CommandEmpty>Không tìm thấy nhãn nào.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {labelSearchResults.map((label) => {
                      const isSelected = selectedLabels.some((l) => l.id === label.id);
                      const colorStyle = {
                        backgroundColor: label.colorCode,
                      } as React.CSSProperties;
                      return (
                        <CommandItem
                          key={label.id}
                          onSelect={() => addLabel(label)}
                          disabled={isSelected}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center gap-2">
                            <div
                              className="h-4 w-4 flex-shrink-0 rounded-full"
                              style={colorStyle}
                              suppressHydrationWarning
                            />
                            <span className="flex-1">{label.name}</span>
                            {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Ingredients and Cooking Steps - Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Ingredients (1/3 width) */}
        <div className="space-y-2">
          <Label>Nguyên liệu</Label>

          {/* Selected Ingredients */}
          <div className="min-h-[150px] rounded-lg border p-3">
            {selectedIngredients.length === 0 ? (
              <div className="flex h-full items-center justify-center pt-13 text-sm text-gray-400">
                Chưa có nguyên liệu nào được chọn
              </div>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ingredient) => (
                  <IngredientCardWithDetails
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdateQuantity={updateIngredientQuantity}
                    onRemove={removeIngredient}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Search and Add Ingredients */}
          <Popover open={isIngredientPopoverOpen} onOpenChange={setIsIngredientPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nguyên liệu
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[354px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Tìm kiếm nguyên liệu..."
                  value={ingredientSearch}
                  onValueChange={setIngredientSearch}
                />
                <CommandList>
                  {isLoadingIngredients ? (
                    <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
                  ) : ingredientSearchResults.length === 0 ? (
                    <CommandEmpty>Không tìm thấy nguyên liệu nào.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {ingredientSearchResults.map((ingredient) => {
                        const isSelected = selectedIngredients.some((i) => i.id === ingredient.id);
                        return (
                          <CommandItem
                            key={ingredient.id}
                            onSelect={() => addIngredient(ingredient)}
                            disabled={isSelected}
                            className="cursor-pointer"
                          >
                            <div className="flex w-full items-center gap-2">
                              <span className="flex-1">{ingredient.name}</span>
                              {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right Column: Cooking Steps (2/3 width) */}
        <div className="space-y-4">
          <Label>Các bước nấu</Label>

          {cookingSteps.map((step, index) => (
            <CookingStepCard
              key={step.id}
              step={step}
              index={index}
              isDragOver={dragOverIndex === index}
              canRemove={cookingSteps.length > 1}
              onDragStart={() => handleCookStepDragStart(index)}
              onDragOver={(e) => handleCookStepDragOver(e, index)}
              onDragLeave={handleCookStepDragLeave}
              onDrop={(e) => handleCookStepDrop(e, index)}
              onUpdateInstruction={(instruction) => updateStepDescription(index, instruction)}
              onAddImage={(file) => handleStepImageChange(index, file)}
              onRemoveImage={() => {
                const newSteps = [...cookingSteps];
                newSteps[index].image = undefined;
                newSteps[index].imagePreview = undefined;
                setCookingSteps(newSteps);
              }}
              onRemoveStep={() => removeCookingStep(index)}
            />
          ))}

          <Button type="button" onClick={addCookingStep} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Bước làm
          </Button>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Lưu và Đóng
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-[#99b94a] hover:bg-[#7a9a3d]">
          {isSubmitting
            ? mode === 'edit'
              ? 'Đang cập nhật...'
              : 'Đang tạo...'
            : mode === 'edit'
              ? 'Cập nhật'
              : 'Lên bài'}
        </Button>
      </div>

      {/* Image Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={isCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropDialogOpen(false);
            setImageToCrop(null);
          }}
        />
      )}
    </form>
  );
}
