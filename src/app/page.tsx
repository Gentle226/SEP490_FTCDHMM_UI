'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRightIcon,
  ChevronUp,
  Flame,
  History,
  Leaf,
  Minus,
  Plus,
  SearchIcon,
  SparklesIcon,
  Utensils,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Pie, PieChart, Tooltip } from 'recharts';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Button } from '@/base/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from '@/base/components/ui/chart';
import { IngredientCard } from '@/base/components/ui/ingredient-card';
import { Input } from '@/base/components/ui/input';
import { RecipeCard } from '@/base/components/ui/recipe-card';
import { useAuth } from '@/modules/auth';
import { IngredientDetailsResponse, ingredientPublicService } from '@/modules/ingredients';
import { MealSlotResponse, mealSlotService } from '@/modules/meal-slots';
import { NutrientInfo, nutrientService } from '@/modules/nutrients/services/nutrient.service';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { recommendationService } from '@/modules/recipes/services/recommendation.service';
import { MyRecipeResponse } from '@/modules/recipes/types/my-recipe.types';
import { RecommendedRecipeResponse } from '@/modules/recipes/types/recommendation.types';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MyRecipeResponse['items']>([]);
  const [ingredientSearchResults, setIngredientSearchResults] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [ingredients, setIngredients] = useState<IngredientDetailsResponse[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [recentRecipes, setRecentRecipes] = useState<MyRecipeResponse['items']>([]);

  // Meal Planner State
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [suggestionLimit, setSuggestionLimit] = useState(10);
  const [selectedRecipes, setSelectedRecipes] = useState<RecommendedRecipeResponse[]>([]);
  const [isRestoringMeal, setIsRestoringMeal] = useState(true);
  const [showDetailedNutrients, setShowDetailedNutrients] = useState(false);
  const [nutrientsMap, setNutrientsMap] = useState<Record<string, NutrientInfo>>({});
  const [mealSlots, setMealSlots] = useState<MealSlotResponse[]>([]);
  const [selectedMealSlotId, setSelectedMealSlotId] = useState<string | null>(null);
  const [isLoadingMealSlots, setIsLoadingMealSlots] = useState(true);

  // Meal Planner Query
  const {
    data: mealPlannerData,
    isLoading: isLoadingMealPlanner,
    refetch: _refetchMealPlanner,
  } = useQuery({
    queryKey: ['mealPlanner', selectedMealSlotId, selectedRecipeIds, suggestionLimit],
    queryFn: async () => {
      if (!selectedMealSlotId) return null;
      const response = await recommendationService.analyzeMeal({
        mealSlotId: selectedMealSlotId,
        currentRecipeIds: selectedRecipeIds,
        suggestionLimit,
      });
      return response;
    },
    enabled: !!user && !!selectedMealSlotId,
    retry: 1,
  });

  // Fetch meal slots for logged-in users
  useEffect(() => {
    if (!user) {
      setIsLoadingMealSlots(false);
      return;
    }

    const fetchMealSlots = async () => {
      try {
        setIsLoadingMealSlots(true);
        const slots = await mealSlotService.getMealSlots();
        setMealSlots(slots);
        // Auto-select first slot if none selected
        if (slots.length > 0) {
          setSelectedMealSlotId((current) => current || slots[0].id);
        }
      } catch (error) {
        console.warn('Error fetching meal slots:', error);
        setMealSlots([]);
      } finally {
        setIsLoadingMealSlots(false);
      }
    };

    fetchMealSlots();
  }, [user]);

  // Add recipe to meal
  const handleAddToMeal = (recipe: RecommendedRecipeResponse) => {
    if (selectedRecipeIds.includes(recipe.id)) {
      toast.info('Công thức đã có trong bữa ăn');
      return;
    }
    setSelectedRecipeIds((prev) => [...prev, recipe.id]);
    setSelectedRecipes((prev) => [...prev, recipe]);
    toast.success(`Đã thêm "${recipe.name}" vào bữa ăn`);
  };

  // Remove recipe from meal
  const handleRemoveFromMeal = (recipeId: string) => {
    setSelectedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
    setSelectedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  // Clear all recipes from meal
  const handleClearMeal = () => {
    setSelectedRecipeIds([]);
    setSelectedRecipes([]);
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mealPlanner_selectedRecipes');
    }
    toast.success('Đã xóa tất cả công thức khỏi bữa ăn');
  };

  // Restore meal planner selections from localStorage on mount
  useEffect(() => {
    if (!user) {
      setIsRestoringMeal(false);
      return;
    }

    try {
      const stored = localStorage.getItem('mealPlanner_selectedRecipes');
      if (stored) {
        const parsed = JSON.parse(stored) as {
          recipeIds: string[];
          recipes: RecommendedRecipeResponse[];
        };
        setSelectedRecipeIds(parsed.recipeIds);
        setSelectedRecipes(parsed.recipes);
      }
    } catch (error) {
      console.warn('Error restoring meal planner data:', error);
      localStorage.removeItem('mealPlanner_selectedRecipes');
    } finally {
      setIsRestoringMeal(false);
    }
  }, [user]);

  // Save meal planner selections to localStorage whenever they change
  useEffect(() => {
    if (!user || isRestoringMeal) return;

    if (selectedRecipeIds.length > 0) {
      try {
        localStorage.setItem(
          'mealPlanner_selectedRecipes',
          JSON.stringify({
            recipeIds: selectedRecipeIds,
            recipes: selectedRecipes,
          }),
        );
      } catch (error) {
        console.warn('Error saving meal planner data:', error);
      }
    } else {
      localStorage.removeItem('mealPlanner_selectedRecipes');
    }
  }, [selectedRecipeIds, selectedRecipes, user, isRestoringMeal]);

  // Handle search with debouncing
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      setIngredientSearchResults([]);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    // Debounce search with 500ms delay
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Search recipes by name only
        const response = await recipeService.searchRecipes({
          keyword: value,
          pageNumber: 1,
          pageSize: 5,
        });

        setSearchResults(response.items || []);
        setIngredientSearchResults([]);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
        setIngredientSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch ingredients on mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoadingIngredients(true);
        // Fetch with pageSize of 20 (API requires 10, 20, or 50)
        const response = await ingredientPublicService.getIngredients({
          pageNumber: 1,
          pageSize: 20,
        });
        // Get detailed ingredients with imageUrl, show 9 on mobile, 8 on desktop
        const detailedIngredients = await ingredientPublicService.getIngredientDetailsForHomepage(
          response.items.slice(0, 9).map((item) => item.id),
        );
        setIngredients(detailedIngredients);
      } catch (error) {
        console.warn('Error fetching ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    fetchIngredients();
  }, []);

  // Fetch recipe history for logged-in users
  useEffect(() => {
    if (!user) return;

    const fetchRecipeHistory = async () => {
      try {
        const response = await recipeService.getHistory({
          pageNumber: 1,
          pageSize: 6,
        });
        setRecentRecipes(response.items || []);
      } catch (error) {
        console.warn('Error fetching recipe history:', error);
        setRecentRecipes([]);
      }
    };

    fetchRecipeHistory();
  }, [user]);

  // Fetch nutrients mapping for logged-in users
  useEffect(() => {
    if (!user) return;

    const fetchNutrients = async () => {
      try {
        const nutrients = await nutrientService.getNutrients();
        const map: Record<string, NutrientInfo> = {};
        nutrients.forEach((n) => {
          map[n.id] = n;
        });
        setNutrientsMap(map);
      } catch (error) {
        console.warn('Error fetching nutrients:', error);
      }
    };

    fetchNutrients();
  }, [user]);

  // Helper function to get nutrient name
  const getNutrientName = (id: string): string => {
    return nutrientsMap[id]?.vietnameseName || id;
  };

  // Helper function to get nutrient unit
  const getNutrientUnit = (id: string): string => {
    return nutrientsMap[id]?.unit || '';
  };

  // Chart colors - using explicit colors for macronutrients
  const CHART_COLORS = [
    '#ff6384', // Pink/Red for Protein
    '#36a2eb', // Blue for Carbs
    '#ffce56', // Yellow for Fat
    '#4bc0c0', // Teal
    '#9966ff', // Purple
  ];

  // Prepare chart data for macronutrients (Protein, Carbs, Fat)
  const getMacroNutrientChartData = () => {
    if (!mealPlannerData?.currentNutrients) return [];

    const macroNutrients: { name: string; value: number; id: string; fill: string }[] = [];
    let colorIndex = 0;

    Object.entries(mealPlannerData.currentNutrients).forEach(([id, value]) => {
      const name = getNutrientName(id).toLowerCase();
      // Filter for main macronutrients (Protein, Carbohydrate/Carbs, Fat/Lipid)
      if (
        name.includes('protein') ||
        name.includes('chất đạm') ||
        name.includes('carbohydrat') ||
        name.includes('chất bột đường') ||
        name.includes('tinh bột') ||
        name.includes('fat') ||
        name.includes('lipid') ||
        name.includes('chất béo')
      ) {
        const nutrientName = getNutrientName(id);
        macroNutrients.push({
          name: nutrientName,
          value: Number(value.toFixed(2)),
          id,
          fill: CHART_COLORS[colorIndex % CHART_COLORS.length],
        });
        colorIndex++;
      }
    });

    return macroNutrients;
  };

  // Prepare chart config for macronutrients
  const getMacroChartConfig = (): ChartConfig => {
    const data = getMacroNutrientChartData();
    const config: ChartConfig = {
      value: { label: 'Giá trị' },
    };

    data.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });

    return config;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Navigate to search results page with query parameter (empty or with query)
    // If empty, the search page will call GET /api/recipe to fetch all recipes
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowDropdown(false);
  };

  const handleRecipeClick = (recipeId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem chi tiết công thức');
      router.push('/auth/login');
      return;
    }
    router.push(`/recipe/${recipeId}`);
  };

  const handleIngredientClick = (ingredientId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem chi tiết nguyên liệu');
      router.push('/auth/login');
      return;
    }
    router.push(`/search?ingredientId=${ingredientId}`);
  };

  // Common search and recipes section
  const mainContent = (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Search Section */}
      <div className="relative bg-gradient-to-br from-[#99b94a]/5 via-white to-emerald-50/30 pt-6 pb-10 sm:pt-8 sm:pb-14">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#99b94a]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fitfood-tracker-logo.png"
                alt="FitFood Tracker"
                className="mx-auto h-28 w-auto drop-shadow-sm sm:h-36"
              />
            </div>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-xl" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm món ăn hoặc để trống để truy cập bộ lọc công thức"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="h-14 rounded-2xl border-2 border-gray-200 bg-white pr-14 pl-12 text-base shadow-lg shadow-gray-200/50 transition-all placeholder:text-gray-400 focus:border-[#99b94a] focus:shadow-xl focus:shadow-[#99b94a]/10 sm:text-lg"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute top-1/2 right-2 h-10 w-10 -translate-y-1/2 rounded-xl bg-[#99b94a] shadow-md shadow-[#99b94a]/30 transition-all hover:bg-[#7a8f3a] hover:shadow-lg"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </Button>
                </div>
              </form>

              {/* Search Dropdown Results */}
              {showDropdown && (
                <div className="absolute top-full right-0 left-0 z-[100] mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
                  {isSearching ? (
                    <div className="px-4 py-10 text-center text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent"></div>
                      <p className="mt-3 text-sm">Đang tìm kiếm...</p>
                    </div>
                  ) : searchResults.length > 0 || ingredientSearchResults.length > 0 ? (
                    <>
                      <div className="max-h-80 overflow-y-auto">
                        {/* Recipes Section - Show First */}
                        {searchResults.length > 0 && (
                          <div>
                            {searchResults.map((recipe, index) => (
                              <button
                                key={recipe.id || `recipe-${index}`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery('');
                                  handleRecipeClick(recipe.id);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50"
                              >
                                <Image
                                  src={recipe.imageUrl || '/outline-illustration-card.png'}
                                  alt={recipe.name}
                                  width={52}
                                  height={52}
                                  className="h-13 w-13 rounded-xl object-cover shadow-sm"
                                />
                                <div className="flex-1">
                                  <p className="line-clamp-1 font-medium text-gray-800">
                                    {recipe.name}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {recipe.author
                                      ? `${recipe.author.firstName} ${recipe.author.lastName}`
                                      : 'Tác giả không xác định'}
                                  </p>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Ingredients Section - Show Second */}
                        {ingredientSearchResults.length > 0 && (
                          <div>
                            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
                              Tìm kiếm công thức chứa nguyên liệu
                            </div>
                            {ingredientSearchResults.map((ingredient, index) => (
                              <button
                                key={ingredient.id || `ingredient-${index}`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery('');
                                  handleIngredientClick(ingredient.name);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50"
                              >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                                  <Leaf className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="line-clamp-1 font-medium text-gray-800">
                                    {ingredient.name}
                                  </p>
                                  <p className="text-xs text-gray-500">Nguyên liệu</p>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            setShowDropdown(false);
                          }}
                          className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#99b94a]/5 to-emerald-50/50 px-4 py-3 text-sm font-medium text-[#99b94a] transition-all hover:from-[#99b94a]/10 hover:to-emerald-50"
                        >
                          Xem tất cả kết quả
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <SearchIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                      <p className="text-sm text-gray-500">Không tìm thấy kết quả nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Ingredients Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-5 flex items-center justify-between sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#99b94a] to-emerald-500 shadow-md shadow-[#99b94a]/30">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                  Danh Sách Nguyên Liệu
                </h2>
                <p className="hidden text-xs text-gray-500 sm:block">
                  Khám phá thành phần dinh dưỡng của từng nguyên liệu
                </p>
              </div>
            </div>
            {user && (
              <Button
                variant="outline"
                className="gap-1 rounded-full border-[#99b94a]/30 text-xs text-[#99b94a] transition-all hover:border-[#99b94a] hover:bg-[#99b94a]/10 sm:text-sm"
                onClick={() => router.push('/ingredients')}
              >
                <span>Xem tất cả</span>
                <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8">
            {isLoadingIngredients || ingredients.length === 0
              ? Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={i >= 6 ? 'hidden lg:block' : ''}>
                    <IngredientCard isLoading={true} />
                  </div>
                ))
              : ingredients.slice(0, 8).map((ingredient, index) => (
                  <button
                    key={ingredient.id}
                    className={`transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${index >= 6 ? 'hidden lg:block' : ''}`}
                    onClick={() => handleIngredientClick(ingredient.id)}
                    title={ingredient.name}
                  >
                    <IngredientCard name={ingredient.name} image={ingredient.imageUrl} />
                  </button>
                ))}
          </div>
        </section>

        {/* Recent Recipes Section - Only show for logged in users with history */}
        {user && recentRecipes.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Xem Gần Đây</h2>
                <p className="hidden text-xs text-gray-500 sm:block">
                  Tiếp tục khám phá các công thức bạn đã xem
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
              {recentRecipes.slice(0, 6).map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe.id)}
                  className="transition-all hover:scale-105 hover:rounded-2xl"
                  title={recipe.name}
                >
                  <RecipeCard
                    title={recipe.name}
                    author={
                      recipe.author ? `${recipe.author.firstName} ${recipe.author.lastName}` : ''
                    }
                    authorAvatar={recipe.author?.avatarUrl}
                    image={recipe.imageUrl}
                    isLoading={false}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Meal Planner Section - Only for logged in users */}
        {user && (
          <section className="mb-8 sm:mb-12">
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                    Lập Kế Hoạch Bữa Ăn
                  </h2>
                  <p className="hidden text-xs text-gray-500 sm:block">
                    Chọn công thức để hoàn thiện bữa ăn theo mục tiêu dinh dưỡng của bạn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Meal Slot Selector */}
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-gray-500 sm:inline">Bữa ăn:</span>
                  <select
                    aria-label="Chọn bữa ăn"
                    value={selectedMealSlotId || ''}
                    onChange={(e) => setSelectedMealSlotId(e.target.value || null)}
                    className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    disabled={isLoadingMealSlots || mealSlots.length === 0}
                  >
                    {isLoadingMealSlots ? (
                      <option value="">Đang tải...</option>
                    ) : mealSlots.length === 0 ? (
                      <option value="">Chưa có bữa ăn</option>
                    ) : (
                      mealSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.name} ({slot.energyPercent.toFixed(0)}%)
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {/* Suggestion Limit */}
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-gray-500 sm:inline">Số gợi ý:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSuggestionLimit((prev) => Math.max(1, prev - 5))}
                      disabled={suggestionLimit <= 5}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{suggestionLimit}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSuggestionLimit((prev) => Math.min(50, prev + 5))}
                      disabled={suggestionLimit >= 50}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Suggestions */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Gợi Ý Công Thức</h3>
                  <span className="ml-auto text-xs text-gray-500">
                    {mealPlannerData?.suggestions.length || 0} gợi ý
                  </span>
                </div>

                {isLoadingMealPlanner || isLoadingMealSlots ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent"></div>
                    <p className="mt-3 text-sm text-gray-500">Đang phân tích...</p>
                  </div>
                ) : !selectedMealSlotId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <SparklesIcon className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm">Vui lòng chọn bữa ăn</p>
                    <p className="mt-1 text-center text-xs text-gray-400">
                      Chọn một bữa ăn từ menu để xem gợi ý công thức
                    </p>
                    <p className="mt-2 text-center text-xs text-gray-400">
                      Cập nhật thông tin sức khỏe để nhận được gợi ý phù hợp hơn
                    </p>
                  </div>
                ) : mealPlannerData?.suggestions && mealPlannerData.suggestions.length > 0 ? (
                  <div
                    className={`space-y-3 overflow-y-auto pr-2 ${showDetailedNutrients ? 'max-h-[1000px]' : 'max-h-[500px]'}`}
                  >
                    {mealPlannerData.suggestions.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:bg-gray-100"
                      >
                        <Image
                          src={recipe.imageUrl || '/outline-illustration-card.png'}
                          alt={recipe.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-xl object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-medium text-gray-800">{recipe.name}</p>
                          <p className="text-xs text-gray-500">
                            {recipe.author
                              ? `${recipe.author.firstName} ${recipe.author.lastName}`
                              : 'Tác giả không xác định'}
                          </p>
                          {recipe.score !== null && (
                            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Điểm phù hợp cá nhân hóa: {(recipe.score * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-[#99b94a] hover:bg-[#7a8f3a]"
                            onClick={() => handleAddToMeal(recipe)}
                            disabled={selectedRecipeIds.includes(recipe.id)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Thêm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => handleRecipeClick(recipe.id)}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <SparklesIcon className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm">Không có gợi ý phù hợp</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {mealPlannerData && mealPlannerData.energyCoveragePercent > 100
                        ? 'Bạn đã vượt quá mục tiêu calo cho bữa ăn này'
                        : 'Thử thay đổi số lượng gợi ý hoặc bỏ bớt công thức'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Current Meal */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">Bữa Ăn Của Bạn</h3>
                  </div>
                  {selectedRecipes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={handleClearMeal}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Xóa tất cả
                    </Button>
                  )}
                </div>

                {/* Nutrition Summary */}
                {mealPlannerData && (
                  <div className="mb-4 space-y-4">
                    {/* Calorie Progress */}
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Tiến độ Calo</span>
                        <span className="text-sm font-bold text-orange-600">
                          {mealPlannerData.currentCalories.toFixed(0)} /{' '}
                          {mealPlannerData.targetCalories.toFixed(0)} kcal
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            mealPlannerData.energyCoveragePercent > 110
                              ? 'bg-red-500'
                              : mealPlannerData.energyCoveragePercent > 90
                                ? 'bg-green-500'
                                : 'bg-orange-400'
                          }`}
                          style={{
                            width: `${Math.min(100, mealPlannerData.energyCoveragePercent)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span
                          className={`font-medium ${
                            mealPlannerData.energyCoveragePercent > 110
                              ? 'text-red-600'
                              : mealPlannerData.energyCoveragePercent > 90
                                ? 'text-green-600'
                                : 'text-orange-600'
                          }`}
                        >
                          {mealPlannerData.energyCoveragePercent.toFixed(1)}%
                        </span>
                        <span className="text-gray-500">
                          {mealPlannerData.remainingCalories > 0
                            ? `Còn thiếu ${mealPlannerData.remainingCalories.toFixed(0)} kcal`
                            : `Vượt ${Math.abs(mealPlannerData.remainingCalories).toFixed(0)} kcal`}
                        </span>
                      </div>
                    </div>

                    {/* Always Visible: Macronutrient Chart */}
                    {getMacroNutrientChartData().length > 0 && (
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                          Phân bổ Chất dinh dưỡng đa lượng
                        </h4>
                        <ChartContainer
                          config={getMacroChartConfig()}
                          className="mx-auto aspect-square max-h-[200px]"
                        >
                          <PieChart>
                            <Tooltip
                              formatter={(value: number, name: string) => [
                                `${value.toFixed(1)}g`,
                                name,
                              ]}
                              contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                            <Pie
                              data={getMacroNutrientChartData()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                            />
                            <ChartLegend
                              content={<ChartLegendContent nameKey="name" />}
                              className="-translate-y-2 flex-wrap gap-2 text-xs"
                            />
                          </PieChart>
                        </ChartContainer>
                      </div>
                    )}

                    {/* Always Visible: Nutrition Goals */}
                    {Object.keys(mealPlannerData.targetNutrients).length > 0 && (
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                          Mục tiêu dinh dưỡng
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(mealPlannerData.targetNutrients).map(([id, target]) => {
                            const current = mealPlannerData.currentNutrients[id] || 0;
                            const percent = target > 0 ? (current / target) * 100 : 0;
                            return (
                              <div key={id} className="text-xs">
                                <div className="mb-1 flex justify-between">
                                  <span className="text-gray-600">{getNutrientName(id)}</span>
                                  <span className="font-medium text-gray-800">
                                    {current.toFixed(1)} / {target.toFixed(1)} {getNutrientUnit(id)}
                                  </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      percent > 110
                                        ? 'bg-red-400'
                                        : percent > 90
                                          ? 'bg-green-400'
                                          : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${Math.min(100, percent)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Toggle Button for Detailed Nutrients */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => setShowDetailedNutrients(!showDetailedNutrients)}
                    >
                      {showDetailedNutrients ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Ẩn chi tiết dinh dưỡng
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Xem chi tiết dinh dưỡng
                        </>
                      )}
                    </Button>

                    {/* Toggleable: Detailed Nutrient Information */}
                    {showDetailedNutrients && (
                      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                        {/* All Current Nutrients */}
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-gray-700">
                            Tổng dinh dưỡng hiện tại
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(mealPlannerData.currentNutrients)
                              .sort(([, a], [, b]) => b - a)
                              .map(([id, value]) => (
                                <div
                                  key={id}
                                  className="flex items-center justify-between rounded-lg bg-white/60 px-2 py-1.5 text-xs"
                                >
                                  <span className="truncate text-gray-600">
                                    {getNutrientName(id)}
                                  </span>
                                  <span className="ml-2 font-medium text-gray-800">
                                    {value.toFixed(1)} {getNutrientUnit(id)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Remaining Nutrients */}
                        {Object.keys(mealPlannerData.remainingNutrients).length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-semibold text-gray-700">
                              Dinh dưỡng còn thiếu
                            </h4>
                            <div className="space-y-1.5">
                              {Object.entries(mealPlannerData.remainingNutrients).map(
                                ([id, range]) => (
                                  <div
                                    key={id}
                                    className="flex items-center justify-between rounded-lg bg-white/60 px-2 py-1.5 text-xs"
                                  >
                                    <span className="text-gray-600">{getNutrientName(id)}</span>
                                    <span className="font-medium text-amber-600">
                                      {range.min.toFixed(1)} - {range.max.toFixed(1)}{' '}
                                      {getNutrientUnit(id)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Recipes */}
                {selectedRecipes.length > 0 ? (
                  <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
                    {selectedRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => handleRecipeClick(recipe.id)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 p-3 transition-all hover:bg-green-100"
                      >
                        <Image
                          src={recipe.imageUrl || '/outline-illustration-card.png'}
                          alt={recipe.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-xl object-cover shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-medium text-gray-800">{recipe.name}</p>
                          <p className="text-xs text-gray-500">
                            {recipe.cookTime && `${recipe.cookTime} phút`}
                            {recipe.ration && ` • ${recipe.ration} phần`}
                          </p>
                        </div>
                        <button
                          aria-label="Remove recipe from meal"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromMeal(recipe.id);
                          }}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Utensils className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm">Chưa có công thức nào</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Thêm công thức từ danh sách gợi ý bên trái
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );

  // If user is logged in, show with dashboard layout (sidebar)
  if (user) {
    return (
      <DashboardLayout>
        <div className="-m-4">
          {' '}
          {/* Remove default padding from DashboardLayout */}
          {mainContent}
        </div>
      </DashboardLayout>
    );
  }

  // If user is not logged in, show with regular header
  return <div className="min-h-screen bg-gray-50">{mainContent}</div>;
}
