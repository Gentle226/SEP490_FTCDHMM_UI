'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownZA,
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Flame,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Users,
  Wheat,
  X,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { ScrollArea } from '@/base/components/ui/scroll-area';
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
  includeLabelIds?: string[];
  includeIngredientIds?: string[];
  excludeLabelIds?: string[];
  excludeIngredientIds?: string[];
}

const DIFFICULTIES = [
  { value: 'Easy', label: 'Dễ' },
  { value: 'Medium', label: 'Trung bình' },
  { value: 'Hard', label: 'Khó' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Mới nhất', icon: 'sparkles', color: 'text-amber-500' },
  { value: 'rate_desc', label: 'Đánh giá cao nhất', icon: 'star', color: 'text-yellow-500' },
  { value: 'view_desc', label: 'Xem nhiều nhất', icon: 'eye', color: 'text-blue-500' },
  { value: 'time_asc', label: 'Nấu nhanh nhất', icon: 'zap', color: 'text-orange-500' },
  { value: 'time_desc', label: 'Nấu lâu nhất', icon: 'clock', color: 'text-purple-500' },
  { value: 'name_asc', label: 'Tên A → Z', icon: 'arrowDownAZ', color: 'text-emerald-500' },
  { value: 'name_desc', label: 'Tên Z → A', icon: 'arrowDownZA', color: 'text-teal-500' },
] as const;

// Icon mapping for sort options
const SortIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    sparkles: <Sparkles className={className} />,
    star: <Star className={className} />,
    eye: <Eye className={className} />,
    zap: <Zap className={className} />,
    clock: <Clock className={className} />,
    arrowDownAZ: <ArrowDownAZ className={className} />,
    arrowDownZA: <ArrowDownZA className={className} />,
  };
  return <>{icons[icon] || null}</>;
};

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const searchParams = useSearchParams();

  // Get initial ingredient IDs from URL params
  const initialIngredientIds = useMemo(
    () => searchParams.getAll('ingredientId') || [],
    [searchParams],
  );

  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [ration, setRation] = useState<number | undefined>();
  const [maxCookTime, setMaxCookTime] = useState<number>(240);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [ingredientIds, setIngredientIds] = useState<string[]>(initialIngredientIds);
  const [excludeLabelIds, setExcludeLabelIds] = useState<string[]>([]);
  const [excludeIngredientIds, setExcludeIngredientIds] = useState<string[]>([]);
  const [labelSearchTerm, setLabelSearchTerm] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Sync ingredient IDs with URL params on mount and URL change
  useEffect(() => {
    if (initialIngredientIds.length > 0) {
      setIngredientIds(initialIngredientIds);
    }
  }, [initialIngredientIds]);

  // Infinite query for labels
  const {
    data: labelsData,
    fetchNextPage: fetchNextLabelsPage,
    hasNextPage: hasNextLabelsPage,
    isFetchingNextPage: isFetchingNextLabelsPage,
    isLoading: isLoadingLabels,
  } = useInfiniteQuery({
    queryKey: ['labels'],
    queryFn: async ({ pageParam }) => {
      const response = await labelManagementService.getLabels({
        pageNumber: pageParam,
        pageSize: 20,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
  });

  // Infinite query for ingredients
  const {
    data: ingredientsData,
    fetchNextPage: fetchNextIngredientsPage,
    hasNextPage: hasNextIngredientsPage,
    isFetchingNextPage: isFetchingNextIngredientsPage,
    isLoading: isLoadingIngredients,
  } = useInfiniteQuery({
    queryKey: ['ingredients'],
    queryFn: async ({ pageParam }) => {
      const response = await ingredientPublicService.getIngredients({
        pageNumber: pageParam,
        pageSize: 20,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
  });

  // Flatten labels and ingredients from pages
  const labels = labelsData?.pages.flatMap((page) => page.items) || [];
  const ingredients =
    ingredientsData?.pages.flatMap((page) =>
      page.items.map((item) => ({ id: item.id, name: item.name })),
    ) || [];

  // Intersection observers for infinite scroll
  const { ref: labelsLoadMoreRef, inView: labelsInView } = useInView({ threshold: 0 });
  const { ref: ingredientsLoadMoreRef, inView: ingredientsInView } = useInView({ threshold: 0 });

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger labels infinite scroll
  useEffect(() => {
    if (labelsInView && hasNextLabelsPage && !isFetchingNextLabelsPage) {
      fetchNextLabelsPage();
    }
  }, [labelsInView, hasNextLabelsPage, isFetchingNextLabelsPage, fetchNextLabelsPage]);

  // Trigger ingredients infinite scroll
  useEffect(() => {
    if (ingredientsInView && hasNextIngredientsPage && !isFetchingNextIngredientsPage) {
      fetchNextIngredientsPage();
    }
  }, [
    ingredientsInView,
    hasNextIngredientsPage,
    isFetchingNextIngredientsPage,
    fetchNextIngredientsPage,
  ]);

  useEffect(() => {
    onFilterChange({
      difficulty,
      sortBy,
      ration,
      maxCookTime,
      includeLabelIds: labelIds,
      includeIngredientIds: ingredientIds,
      excludeLabelIds,
      excludeIngredientIds,
    });
  }, [
    difficulty,
    sortBy,
    ration,
    maxCookTime,
    labelIds,
    ingredientIds,
    excludeLabelIds,
    excludeIngredientIds,
    onFilterChange,
  ]);

  const handleReset = () => {
    setDifficulty(undefined);
    setSortBy(undefined);
    setRation(undefined);
    setMaxCookTime(240);
    setLabelIds([]);
    setIngredientIds([]);
    setExcludeLabelIds([]);
    setExcludeIngredientIds([]);
  };

  // Track if filter is expanded on mobile
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters
  const activeFiltersCount = [
    difficulty,
    sortBy,
    ration,
    maxCookTime < 240,
    labelIds.length > 0,
    ingredientIds.length > 0,
    excludeLabelIds.length > 0,
    excludeIngredientIds.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 shadow-lg sm:sticky sm:top-24">
      <style>{themeStyles}</style>

      {/* Mobile Toggle Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-[#99b94a] to-[#7a9835] p-4 sm:hidden"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-white" />
          <h2 className="text-base font-bold text-white">Bộ lọc tìm kiếm</h2>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#99b94a]">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-white" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Desktop Header */}
      <div className="hidden bg-gradient-to-r from-[#99b94a] to-[#7a9835] px-5 py-4 sm:block">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-white" />
          <h2 className="text-lg font-bold text-white">Bộ lọc tìm kiếm</h2>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#99b94a]">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Content - Collapsible on mobile, push content down instead of overlay */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[70vh] opacity-100' : 'max-h-0 overflow-hidden opacity-0'} sm:max-h-none sm:opacity-100`}
      >
        <div className="p-4 sm:p-5">
          {/* Reset Button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="mb-5 w-full gap-2 border-gray-200 text-gray-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw className="h-4 w-4" />
            Đặt lại bộ lọc
          </Button>

          <ScrollArea className="h-auto max-h-[calc(70vh-80px)] pr-2 sm:h-[calc(100vh-320px)] sm:max-h-none sm:pr-3">
            {/* Sort By */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                  <ArrowDownNarrowWide className="h-4 w-4 text-indigo-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Sắp xếp theo</Label>
              </div>

              {/* Custom Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-sm transition-all ${
                    isSortDropdownOpen
                      ? 'border-[#99b94a] ring-2 ring-[#99b94a]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {sortBy ? (
                    <span className="flex items-center gap-2.5">
                      {(() => {
                        const option = SORT_OPTIONS.find((o) => o.value === sortBy);
                        return option ? (
                          <>
                            <SortIcon icon={option.icon} className={`h-4 w-4 ${option.color}`} />
                            <span className="font-medium text-gray-700">{option.label}</span>
                          </>
                        ) : null;
                      })()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Chọn cách sắp xếp...</span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50">
                    {/* Default Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy(undefined);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                        !sortBy
                          ? 'bg-[#99b94a]/10 text-[#99b94a]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                        <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="flex-1 font-medium">Mặc định</span>
                      {!sortBy && <Check className="h-4 w-4 text-[#99b94a]" />}
                    </button>

                    <div className="h-px bg-gray-100" />

                    {/* Sort Options */}
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-[#99b94a]/10 text-[#99b94a]'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            sortBy === option.value ? 'bg-[#99b94a]/20' : 'bg-gray-100'
                          }`}
                        >
                          <SortIcon
                            icon={option.icon}
                            className={`h-4 w-4 ${sortBy === option.value ? 'text-[#99b94a]' : option.color}`}
                          />
                        </div>
                        <span className="flex-1 font-medium">{option.label}</span>
                        {sortBy === option.value && <Check className="h-4 w-4 text-[#99b94a]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Difficulty */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Độ khó</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() =>
                      setDifficulty(difficulty === diff.value ? undefined : diff.value)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      difficulty === diff.value
                        ? 'bg-[#99b94a] text-white shadow-md shadow-[#99b94a]/30'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-[#99b94a] hover:bg-[#99b94a]/5'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Ration */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Khẩu phần</Label>
              </div>
              <div className="space-y-3 rounded-lg bg-gray-50 p-3">
                <Slider
                  value={[ration || 6]}
                  onValueChange={(value) => setRation(value[0])}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">1 phần</span>
                  <span className="rounded-full bg-[#99b94a] px-3 py-1 font-semibold text-white">
                    {ration || 6} phần
                  </span>
                  <span className="text-gray-500">8 phần</span>
                </div>
              </div>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Cook Time */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Thời gian nấu tối đa</Label>
              </div>
              <div className="space-y-3 rounded-lg bg-gray-50 p-3">
                <Slider
                  value={[maxCookTime]}
                  onValueChange={(value) => setMaxCookTime(value[0])}
                  min={5}
                  max={240}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">5 phút</span>
                  <span className="rounded-full bg-[#99b94a] px-3 py-1 font-semibold text-white">
                    {maxCookTime === 240 ? '∞ Không giới hạn' : `${maxCookTime} phút`}
                  </span>
                  <span className="text-gray-500">4 giờ</span>
                </div>
              </div>
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Labels */}
            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                  <Tag className="h-4 w-4 text-pink-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Nhãn dán</Label>
              </div>

              {/* Selected Include Labels */}
              {labelIds.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Bao gồm:</p>
                  <div className="flex flex-wrap gap-2">
                    {labelIds.map((id) => {
                      const label = labels.find((l) => l.id === id);
                      return label ? (
                        <div
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                          style={{ backgroundColor: label.colorCode }}
                        >
                          {label.name}
                          <button
                            onClick={() => setLabelIds(labelIds.filter((lid) => lid !== id))}
                            className="ml-0.5 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label={`Remove ${label.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Selected Exclude Labels */}
              {excludeLabelIds.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Loại trừ:</p>
                  <div className="flex flex-wrap gap-2">
                    {excludeLabelIds.map((id) => {
                      const label = labels.find((l) => l.id === id);
                      return label ? (
                        <div
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                        >
                          <Ban className="h-3 w-3" />
                          {label.name}
                          <button
                            onClick={() =>
                              setExcludeLabelIds(excludeLabelIds.filter((lid) => lid !== id))
                            }
                            className="ml-0.5 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label={`Remove ${label.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {isLoadingLabels ? (
                <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent" />
                  Đang tải...
                </div>
              ) : labels.length > 0 ? (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm nhãn..."
                      value={labelSearchTerm}
                      onChange={(e) => setLabelSearchTerm(e.target.value)}
                      className="h-10 border-gray-200 bg-white pl-9 focus:border-[#99b94a] focus:ring-[#99b94a]"
                    />
                  </div>
                  <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-white p-2">
                    {labels
                      .filter(
                        (label) =>
                          label.name.toLowerCase().includes(labelSearchTerm.toLowerCase()) &&
                          !labelIds.includes(label.id) &&
                          !excludeLabelIds.includes(label.id),
                      )
                      .map((label) => (
                        <div
                          key={label.id}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all hover:bg-gray-50"
                        >
                          <span
                            className="h-3 w-3 rounded-full ring-2 ring-white"
                            style={{ backgroundColor: label.colorCode }}
                          />
                          <span className="flex-1 text-gray-700">{label.name}</span>
                          <button
                            onClick={() => setLabelIds([...labelIds, label.id])}
                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                            title="Bao gồm"
                          >
                            Có
                          </button>
                          <button
                            onClick={() => setExcludeLabelIds([...excludeLabelIds, label.id])}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                            title="Loại trừ"
                          >
                            Không
                          </button>
                        </div>
                      ))}
                  </div>
                  {/* Infinite scroll trigger for labels */}
                  {hasNextLabelsPage && (
                    <div ref={labelsLoadMoreRef} className="py-2 text-center">
                      {isFetchingNextLabelsPage && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent" />
                          Đang tải thêm...
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-500">
                  Không có nhãn
                </div>
              )}
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Ingredients */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Wheat className="h-4 w-4 text-emerald-500" />
                </div>
                <Label className="text-sm font-semibold text-gray-800">Nguyên liệu</Label>
              </div>

              {/* Selected Include Ingredients */}
              {ingredientIds.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Bao gồm:</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredientIds.map((id) => {
                      const ingredient = ingredients.find((i) => i.id === id);
                      return ingredient ? (
                        <div
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#99b94a] px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                        >
                          {ingredient.name}
                          <button
                            onClick={() =>
                              setIngredientIds(ingredientIds.filter((iid) => iid !== id))
                            }
                            className="ml-0.5 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label={`Remove ${ingredient.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Selected Exclude Ingredients */}
              {excludeIngredientIds.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Loại trừ:</p>
                  <div className="flex flex-wrap gap-2">
                    {excludeIngredientIds.map((id) => {
                      const ingredient = ingredients.find((i) => i.id === id);
                      return ingredient ? (
                        <div
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                        >
                          <Ban className="h-3 w-3" />
                          {ingredient.name}
                          <button
                            onClick={() =>
                              setExcludeIngredientIds(
                                excludeIngredientIds.filter((iid) => iid !== id),
                              )
                            }
                            className="ml-0.5 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            aria-label={`Remove ${ingredient.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {isLoadingIngredients ? (
                <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent" />
                  Đang tải...
                </div>
              ) : ingredients.length > 0 ? (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tìm nguyên liệu..."
                      value={ingredientSearchTerm}
                      onChange={(e) => setIngredientSearchTerm(e.target.value)}
                      className="h-10 border-gray-200 bg-white pl-9 focus:border-[#99b94a] focus:ring-[#99b94a]"
                    />
                  </div>
                  <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-white p-2">
                    {ingredients
                      .filter(
                        (ingredient) =>
                          ingredient.name
                            .toLowerCase()
                            .includes(ingredientSearchTerm.toLowerCase()) &&
                          !ingredientIds.includes(ingredient.id) &&
                          !excludeIngredientIds.includes(ingredient.id),
                      )
                      .map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all hover:bg-gray-50"
                        >
                          <span className="flex-1 text-gray-700">{ingredient.name}</span>
                          <button
                            onClick={() => setIngredientIds([...ingredientIds, ingredient.id])}
                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200"
                            title="Bao gồm"
                          >
                            Có
                          </button>
                          <button
                            onClick={() =>
                              setExcludeIngredientIds([...excludeIngredientIds, ingredient.id])
                            }
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                            title="Loại trừ"
                          >
                            Không
                          </button>
                        </div>
                      ))}
                  </div>
                  {/* Infinite scroll trigger for ingredients */}
                  {hasNextIngredientsPage && (
                    <div ref={ingredientsLoadMoreRef} className="py-2 text-center">
                      {isFetchingNextIngredientsPage && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent" />
                          Đang tải thêm...
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-500">
                  Không có nguyên liệu
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
