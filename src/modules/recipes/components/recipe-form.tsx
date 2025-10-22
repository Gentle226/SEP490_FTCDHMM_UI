'use client';

import { Plus, Trash2, Upload, X } from 'lucide-react';
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

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { stepOrder: 1, instruction: '', image: undefined },
  ]);

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
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      {/* Recipe Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Tên món <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Nhập tên món ăn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Hãy chia sẻ với mọi người về món này của bạn nhé - ai đã truyền cảm hứng cho bạn, tại sao nó đặc biệt, bạn thích thưởng thức nó như thế nào để đề cập đến đó."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Main Image */}
      <div className="space-y-2">
        <Label>Hình ảnh món ăn</Label>
        <div className="flex items-center gap-4">
          {mainImagePreview ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
              <Image src={mainImagePreview} alt="Recipe preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setMainImage(null);
                  setMainImagePreview(null);
                }}
                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-xs text-gray-500">Tải ảnh lên</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">
            Độ khó <span className="text-red-500">*</span>
          </Label>
          <Select
            options={[
              { value: 'Easy', label: 'Dễ' },
              { value: 'Medium', label: 'Trung bình' },
              { value: 'Hard', label: 'Khó' },
            ]}
            value={difficulty}
            onChange={(value) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard')}
            placeholder="Chọn độ khó"
          />
        </div>

        {/* Cook Time */}
        <div className="space-y-2">
          <Label htmlFor="cookTime">Thời gian nấu (phút)</Label>
          <Input
            id="cookTime"
            type="number"
            placeholder="30"
            value={cookTime}
            onChange={(e) => setCookTime(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>

        {/* Ration */}
        <div className="space-y-2">
          <Label htmlFor="ration">
            Khẩu phần (người) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ration"
            type="number"
            placeholder="2"
            value={ration}
            onChange={(e) => setRation(parseInt(e.target.value) || 1)}
            min="1"
            required
          />
        </div>
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <Label>
          Nhãn <span className="text-red-500">*</span>
        </Label>

        {/* Selected Labels */}
        <div className="flex min-h-[40px] flex-wrap gap-2 rounded-lg border p-3">
          {selectedLabels.length === 0 ? (
            <span className="text-sm text-gray-400">Chưa có nhãn nào được chọn</span>
          ) : (
            selectedLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white"
                style={{ backgroundColor: label.colorCode }}
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
            ))
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
                              style={{ backgroundColor: label.colorCode }}
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
        <Label>
          Nguyên liệu <span className="text-red-500">*</span>
        </Label>

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
        <Label>
          Các bước nấu <span className="text-red-500">*</span>
        </Label>

        {cookingSteps.map((step, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] font-semibold text-white">
                  {step.stepOrder}
                </div>

                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Trộn bột và nước đến khi đặc lại và để ở nhiệt độ phòng trong vòng 24-36 tiếng"
                    value={step.instruction}
                    onChange={(e) => updateStepDescription(index, e.target.value)}
                    rows={3}
                  />

                  <div className="flex items-center gap-4">
                    {step.image ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
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
                      <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
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

                {cookingSteps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCookingStep(index)}
                    className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                    aria-label={`Remove step ${step.stepOrder}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
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
    </form>
  );
}
