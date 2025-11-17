'use-client';

import { useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { ScrollArea } from '@/base/components/ui/scroll-area';
import { Separator } from '@/base/components/ui/separator';
import { Slider } from '@/base/components/ui/slider';
import { ingredientPublicService } from '@/modules/ingredients/services/ingredient-public.service';
import { labelManagementService } from '@/modules/labels/services/label-management.service';

// Custom styles for theme color
const themeStyles = `
  :root {
    --primary-color: #99b94a;
  }

  /* Checkbox styling */
  [data-state="checked"] {
    background-color: #99b94a !important;
    border-color: #99b94a !important;
  }

  /* Slider styling - radix-ui slider */
  [data-slot="slider-range"] {
    background-color: #99b94a !important;
  }

  [data-slot="slider-thumb"] {
    background-color: #99b94a !important;
    border-color: #99b94a !important;
    box-shadow: 0 0 0 5px rgba(153, 185, 74, 0.1) !important;
  }

  [data-slot="slider-thumb"]:hover {
    background-color: #8aa83f !important;
  }

  [data-slot="slider-thumb"]:focus {
    outline: 2px solid #99b94a !important;
    outline-offset: 2px;
  }

  /* Native input styling fallback */
  input[type="checkbox"]:checked {
    background-color: #99b94a !important;
    border-color: #99b94a !important;
  }

  input[type="range"]::-webkit-slider-thumb {
    background-color: #99b94a !important;
  }

  input[type="range"]::-moz-range-thumb {
    background-color: #99b94a !important;
  }
`;

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  difficulty?: string;
  sortBy?: string;
  ration?: number;
  maxCookTime?: number;
  labelIds?: string[];
  ingredientIds?: string[];
}

const DIFFICULTIES = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

// const SORT_OPTIONS = [
//   { value: 'trending', label: 'Xu hướng' },
//   { value: 'newest', label: 'Mới nhất' },
//   { value: 'popular', label: 'Phổ biến' },
//   { value: 'rating', label: 'Đánh giá cao' },
// ];

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [ration, setRation] = useState<number | undefined>();
  const [maxCookTime, setMaxCookTime] = useState<number>(240);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);
  const [labels, setLabels] = useState<Array<{ id: string; name: string; colorCode: string }>>([]);
  const [ingredients, setIngredients] = useState<Array<{ id: string; name: string }>>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [labelSearchTerm, setLabelSearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');

  // Fetch labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLabelsLoading(true);
        const response = await labelManagementService.getLabels({
          pageNumber: 1,
          pageSize: 50,
        });
        setLabels(response.items);
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setLabelsLoading(false);
      }
    };

    fetchLabels();
  }, []);

  // Fetch ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIngredientsLoading(true);
        const response = await ingredientPublicService.getIngredients({
          pageNumber: 1,
          pageSize: 50,
        });
        setIngredients(response.items.map((item) => ({ id: item.id, name: item.name })));
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      } finally {
        setIngredientsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    onFilterChange({
      difficulty,
      sortBy,
      ration,
      maxCookTime,
      labelIds,
      ingredientIds,
    });
  }, [difficulty, sortBy, ration, maxCookTime, labelIds, ingredientIds, onFilterChange]);

  const handleReset = () => {
    setDifficulty(undefined);
    setSortBy(undefined);
    setRation(undefined);
    setMaxCookTime(240);
    setLabelIds([]);
    setIngredientIds([]);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 pr-4">
      <style>{themeStyles}</style>
      <h2 className="mb-4 text-lg font-bold text-[#99b94a]">Lọc Kết Quả</h2>

      {/* Reset Button */}
      <Button
        onClick={handleReset}
        className="mb-6 w-full bg-[#99b94a] text-white hover:bg-[#8aa83f] active:bg-[#7a9835]"
      >
        Đặt lại bộ lọc
      </Button>

      <ScrollArea className="h-screen pr-4">
        {/* Sort By */}
        {/* <div className="mb-6">
          <Label htmlFor="sort-select" className="mb-3 block text-sm font-semibold text-gray-900">
            Sắp xếp
          </Label>
          <select
            id="sort-select"
            aria-label="Sắp xếp"
            value={sortBy || ''}
            onChange={(e) => setSortBy(e.target.value || undefined)}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#99b94a] focus:outline-none"
          >
            <option value="">-- Chọn --</option>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div> */}

        <Separator className="mb-6" />

        {/* Difficulty */}
        <div className="mb-6">
          <Label className="mb-3 block text-sm font-semibold text-gray-900">Độ khó</Label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(difficulty === diff.value ? undefined : diff.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  difficulty === diff.value
                    ? 'bg-[#99b94a] text-white shadow-md'
                    : 'border border-gray-300 bg-white text-gray-700 hover:border-[#99b94a]'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Ration */}
        <div className="mb-6">
          <Label className="mb-3 block text-sm font-semibold text-gray-900">Khẩu phần</Label>
          <div className="space-y-3 px-2">
            <Slider
              value={[ration || 1]}
              onValueChange={(value) => setRation(value[0])}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-gray-600">{ration ? `${ration} phần` : '1 phần'}</div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Cook Time */}
        <div className="mb-6">
          <Label className="mb-3 block text-sm font-semibold text-gray-900">
            Thời gian nấu tối đa
          </Label>
          <div className="space-y-3 px-2">
            <Slider
              value={[maxCookTime]}
              onValueChange={(value) => setMaxCookTime(value[0])}
              min={5}
              max={240}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-gray-600">
              {maxCookTime === 240 ? 'Không giới hạn' : `${maxCookTime} phút`}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Labels */}
        <div className="mb-6 px-2">
          <Label className="mb-3 block text-sm font-semibold text-gray-900">Nhãn dán</Label>

          {/* Selected Labels Tags */}
          {labelIds.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {labelIds.map((id) => {
                const label = labels.find((l) => l.id === id);
                return label ? (
                  <div
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white"
                    style={{ backgroundColor: label.colorCode }}
                  >
                    {label.name}
                    <button
                      onClick={() => setLabelIds(labelIds.filter((lid) => lid !== id))}
                      className="ml-1 text-white hover:opacity-80"
                      aria-label={`Remove ${label.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {labelsLoading ? (
            <div className="text-xs text-gray-500">Đang tải...</div>
          ) : labels.length > 0 ? (
            <>
              <Input
                type="text"
                placeholder="Tìm nhãn..."
                value={labelSearchTerm}
                onChange={(e) => setLabelSearchTerm(e.target.value)}
                className="mb-3 h-9 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a]"
              />
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {labels
                  .filter(
                    (label) =>
                      label.name.toLowerCase().includes(labelSearchTerm.toLowerCase()) &&
                      !labelIds.includes(label.id),
                  )
                  .map((label) => (
                    <button
                      key={label.id}
                      onClick={() => setLabelIds([...labelIds, label.id])}
                      className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm transition-all hover:border-[#99b94a] hover:bg-green-50"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: label.colorCode }}
                      />
                      <span className="flex-1 text-gray-700">{label.name}</span>
                      <span className="text-gray-400">+</span>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">Không có nhãn</div>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Ingredients */}
        <div className="mb-6 px-2">
          <Label className="mb-3 block text-sm font-semibold text-gray-900">Nguyên liệu</Label>

          {/* Selected Ingredients Tags */}
          {ingredientIds.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {ingredientIds.map((id) => {
                const ingredient = ingredients.find((i) => i.id === id);
                return ingredient ? (
                  <div
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#99b94a] px-3 py-1 text-sm font-medium text-white"
                  >
                    {ingredient.name}
                    <button
                      onClick={() => setIngredientIds(ingredientIds.filter((iid) => iid !== id))}
                      className="ml-1 text-white hover:opacity-80"
                      aria-label={`Remove ${ingredient.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {ingredientsLoading ? (
            <div className="text-xs text-gray-500">Đang tải...</div>
          ) : ingredients.length > 0 ? (
            <>
              <Input
                type="text"
                placeholder="Tìm nguyên liệu..."
                value={ingredientSearchTerm}
                onChange={(e) => setIngredientSearchTerm(e.target.value)}
                className="mb-3 h-9 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a]"
              />
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {ingredients
                  .filter(
                    (ingredient) =>
                      ingredient.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) &&
                      !ingredientIds.includes(ingredient.id),
                  )
                  .map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={() => setIngredientIds([...ingredientIds, ingredient.id])}
                      className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm transition-all hover:border-[#99b94a] hover:bg-green-50"
                    >
                      <span className="flex-1 text-gray-700">{ingredient.name}</span>
                      <span className="text-gray-400">+</span>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">Không có nguyên liệu</div>
          )}
        </div>

        <Separator className="mb-6" />
      </ScrollArea>
    </div>
  );
}
