'use client';

import { GripVertical, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent } from '@/base/components/ui/card';
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
import { CookingStep } from '../types';
import { ImageCropDialog } from './image-crop-dialog';

interface SelectedIngredient {
  id: string;
  name: string;
}

interface SelectedLabel {
  id: string;
  name: string;
  colorCode: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RecipeFormProps {}

export function RecipeForm({}: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { stepOrder: 1, instruction: '', image: undefined },
  ]);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [focusedStepIndex, setFocusedStepIndex] = useState<number | null>(null);

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

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else if (file) {
      toast.error('Vui lòng chỉ tải lên tệp ảnh');
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
      { stepOrder: cookingSteps.length + 1, instruction: '', image: undefined },
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
      setSelectedIngredients((prev) => [...prev, { id: ingredient.id, name: ingredient.name }]);
    }
    setIsIngredientPopoverOpen(false);
    setIngredientSearch('');
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
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

    if (!mainImage) {
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
      await recipeService.createRecipe({
        name,
        description,
        difficulty,
        cookTime,
        image: mainImage || undefined,
        ration,
        labelIds: selectedLabels.map((l) => l.id),
        ingredientIds: selectedIngredients.map((i) => i.id),
        cookingSteps,
      });

      toast.success('Công thức đã được tạo thành công');
      router.push('/profile');
    } catch (error) {
      console.error('Create recipe error:', error);
      toast.error('Có lỗi xảy ra khi tạo công thức');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Image and Basic Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
        {/* Image Section - Left */}
        <div className="space-y-2">
          <Label>Hình ảnh món ăn</Label>
          {mainImagePreview ? (
            <div className="relative h-64 w-full overflow-hidden rounded-lg border">
              <Image src={mainImagePreview} alt="Recipe preview" fill className="object-cover" />
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
              className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
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
        <div className="space-y-4">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên món</Label>
            <Input
              id="name"
              placeholder="Tên món ăn của bạn"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 100))}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              maxLength={100}
              required
            />
            <p
              className={`text-right text-xs transition-opacity ${isNameFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {name.length}/100
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
              onChange={(e) => setDescription(e.target.value.slice(0, 1500))}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              maxLength={1500}
              className="break-words sm:min-h-24 md:min-h-28"
            />
            <p
              className={`text-right text-xs transition-opacity ${isDescriptionFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
            >
              {description.length}/1500
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
                  onChange={(e) => setCookTime(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
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
                  min="1"
                  className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
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
        <div className="flex min-h-[40px] flex-wrap gap-2 rounded-lg border p-3">
          {selectedLabels.length === 0 ? (
            <span className="text-sm text-gray-400">Chưa có nhãn nào được chọn</span>
          ) : (
            selectedLabels.map((label) => {
              const labelStyle = { backgroundColor: label.colorCode } as React.CSSProperties;
              return (
                <div
                  key={label.id}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white"
                  style={labelStyle}
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

      {/* Ingredients */}
      <div className="space-y-2">
        <Label>Nguyên liệu</Label>

        {/* Selected Ingredients */}
        <div className="min-h-[100px] rounded-lg border p-3">
          {selectedIngredients.length === 0 ? (
            <div className="flex h-full items-center justify-center pt-5 text-sm text-gray-400">
              Chưa có nguyên liệu nào được chọn
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {selectedIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between gap-2 rounded border bg-gray-50 px-3 py-2"
                >
                  <span className="flex-1 truncate text-sm">{ingredient.name}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="flex-shrink-0 rounded-full p-1 hover:bg-gray-200"
                    aria-label={`Remove ${ingredient.name}`}
                  >
                    <X className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
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
          <PopoverContent className="w-[400px] p-0" align="start">
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

      {/* Cooking Steps */}
      <div className="space-y-4">
        <Label>Các bước nấu</Label>

        {cookingSteps.map((step, index) => (
          <Card
            key={index}
            className={`relative cursor-move transition-all ${
              dragOverIndex === index ? 'border-green-500 bg-green-50' : ''
            }`}
            draggable
            onDragStart={() => handleCookStepDragStart(index)}
            onDragOver={(e) => handleCookStepDragOver(e, index)}
            onDragLeave={handleCookStepDragLeave}
            onDrop={(e) => handleCookStepDrop(e, index)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                {/* Left Column: Step Number and Drag Handle */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#99b94a] text-2xl font-semibold text-white">
                    {step.stepOrder}
                  </div>
                  <div className="cursor-grab text-gray-400 active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Ướp cá hồi với mật ong, dầu oliu và tiêu 15 phút."
                      value={step.instruction}
                      onChange={(e) => updateStepDescription(index, e.target.value.slice(0, 500))}
                      onFocus={() => setFocusedStepIndex(index)}
                      onBlur={() => setFocusedStepIndex(null)}
                      maxLength={500}
                      rows={3}
                      className="break-words"
                    />
                    <p
                      className={`text-right text-xs transition-opacity ${focusedStepIndex === index ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
                    >
                      {step.instruction.length}/500
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {step.image ? (
                      <div className="relative h-32 w-48 overflow-hidden rounded-lg border">
                        <Image
                          src={
                            step.image instanceof File
                              ? URL.createObjectURL(step.image)
                              : step.image
                          }
                          alt={`Step ${step.stepOrder}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSteps = [...cookingSteps];
                            newSteps[index].image = undefined;
                            setCookingSteps(newSteps);
                          }}
                          className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          aria-label="Remove step image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleStepImageChange(index, file);
                          }}
                          aria-label={`Upload image for step ${step.stepOrder}`}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {cookingSteps.length > 1 && (
                <div className="absolute right-3 bottom-3">
                  <button
                    type="button"
                    onClick={() => removeCookingStep(index)}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
                    aria-label={`Remove step ${step.stepOrder}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button type="button" onClick={addCookingStep} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Bước Làm
        </Button>
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
          {isSubmitting ? 'Đang lưu...' : 'Lên bài'}
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
