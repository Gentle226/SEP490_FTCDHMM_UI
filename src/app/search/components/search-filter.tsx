'use-client';

import { useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Label } from '@/base/components/ui/label';
import { ScrollArea } from '@/base/components/ui/scroll-area';
import { Separator } from '@/base/components/ui/separator';
import { Slider } from '@/base/components/ui/slider';

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

  useEffect(() => {
    onFilterChange({
      difficulty,
      sortBy,
      ration,
      maxCookTime,
    });
  }, [difficulty, sortBy, ration, maxCookTime]);

  const handleReset = () => {
    setDifficulty(undefined);
    setSortBy(undefined);
    setRation(undefined);
    setMaxCookTime(120);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 pr-4">
      <style>{themeStyles}</style>
      <h2 className="mb-6 text-lg font-bold text-[#99b94a]">Lọc Kết Quả</h2>

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

        {/* Reset Button */}
        <Button
          onClick={handleReset}
          className="w-full bg-[#99b94a] text-white hover:bg-[#8aa83f] active:bg-[#7a9835]"
        >
          Đặt lại bộ lọc
        </Button>
      </ScrollArea>
    </div>
  );
}
