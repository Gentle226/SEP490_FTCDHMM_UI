'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronRightIcon, History, Leaf, SearchIcon, SparklesIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Button } from '@/base/components/ui/button';
import { IngredientCard } from '@/base/components/ui/ingredient-card';
import { Input } from '@/base/components/ui/input';
import { RecipeCard } from '@/base/components/ui/recipe-card';
import { RecipeCardHorizontal } from '@/base/components/ui/recipe-card-horizontal';
import { useAuth } from '@/modules/auth';
import { IngredientDetailsResponse, ingredientPublicService } from '@/modules/ingredients';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { recommendationService } from '@/modules/recipes/services/recommendation.service';
import { MyRecipeResponse } from '@/modules/recipes/types/my-recipe.types';

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

  // Infinite query for all recipes (for non-logged-in users or when recommendations fail)
  const {
    data: recipesData,
    fetchNextPage: fetchNextRecipesPage,
    hasNextPage: hasNextRecipesPage,
    isFetchingNextPage: isFetchingNextRecipesPage,
    isLoading: isLoadingRecipes,
  } = useInfiniteQuery({
    queryKey: ['allRecipes'],
    queryFn: async ({ pageParam }) => {
      const response = await recipeService.searchRecipes({
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
    enabled: !user, // Only fetch all recipes when not logged in
  });

  // Infinite query for recommended recipes (for logged-in users)
  const {
    data: recommendedData,
    fetchNextPage: fetchNextRecommendedPage,
    hasNextPage: hasNextRecommendedPage,
    isFetchingNextPage: isFetchingNextRecommendedPage,
    isLoading: isLoadingRecommended,
    isError: isRecommendedError,
  } = useInfiniteQuery({
    queryKey: ['recommendedRecipes'],
    queryFn: async ({ pageParam }) => {
      const response = await recommendationService.getRecommendations({
        pageNumber: pageParam,
        pageSize: 20,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < (lastPage.totalPages || 1)) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    enabled: !!user, // Only fetch recommendations when logged in
    retry: 1,
  });

  // Determine which data to use based on login state and error state
  const isUsingRecommendations = !!user && !isRecommendedError;
  const displayData = isUsingRecommendations ? recommendedData : recipesData;
  const isLoadingDisplay = isUsingRecommendations ? isLoadingRecommended : isLoadingRecipes;
  const hasNextPage = isUsingRecommendations ? hasNextRecommendedPage : hasNextRecipesPage;
  const isFetchingNextPage = isUsingRecommendations
    ? isFetchingNextRecommendedPage
    : isFetchingNextRecipesPage;
  const fetchNextPage = isUsingRecommendations ? fetchNextRecommendedPage : fetchNextRecipesPage;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  // Fetch next page when intersection observer triggers
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const handleIngredientClick = (ingredientName: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem chi tiết nguyên liệu');
      router.push('/auth/login');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(ingredientName)}`);
  };

  // Common search and recipes section
  const mainContent = (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Hero Search Section */}
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
                    onClick={() => handleIngredientClick(ingredient.name)}
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

        {/* All Recipes Section */}
        <section>
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${
                isUsingRecommendations
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30'
              }`}
            >
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                {isUsingRecommendations ? 'Gợi Ý Cho Bạn' : 'Khám Phá Công Thức'}
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                {isUsingRecommendations
                  ? 'Công thức được đề xuất dựa trên thói quen, mục tiêu và chỉ số sức khỏe của bạn'
                  : 'Khám phá các món ăn mới mỗi ngày'}
              </p>
            </div>
          </div>
          {user ? (
            <div className="space-y-4">
              {isLoadingDisplay ? (
                // Show skeleton loaders while initial load
                Array.from({ length: 5 }, (_, i) => (
                  <RecipeCardHorizontal key={i} isLoading={true} />
                ))
              ) : (
                <>
                  {recommendedData?.pages.map((page) =>
                    page.items.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleRecipeClick(recipe.id)}
                        className="w-full text-left transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
                        title={recipe.name}
                      >
                        <RecipeCardHorizontal
                          id={recipe.id}
                          title={recipe.name}
                          author={recipe.author}
                          image={recipe.imageUrl}
                          cookTime={recipe.cookTime}
                          ration={recipe.ration}
                          difficulty={recipe.difficulty?.name}
                          ingredients={recipe.ingredients}
                          labels={recipe.labels}
                          createdAtUtc={recipe.createdAtUtc}
                          isLoading={false}
                          score={recipe.score}
                        />
                      </button>
                    )),
                  )}
                  {/* Loading more indicator */}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }, (_, i) => (
                      <RecipeCardHorizontal key={`loading-${i}`} isLoading={true} />
                    ))}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
              {isLoadingDisplay ? (
                // Show skeleton loaders while initial load
                Array.from({ length: 10 }, (_, i) => <RecipeCard key={i} isLoading={true} />)
              ) : (
                <>
                  {recipesData?.pages.map((page) =>
                    page.items.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => handleRecipeClick(recipe.id)}
                        className="transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                        title={recipe.name}
                      >
                        <RecipeCard
                          title={recipe.name}
                          author={
                            recipe.author
                              ? `${recipe.author.firstName} ${recipe.author.lastName}`
                              : ''
                          }
                          authorAvatar={recipe.author?.avatarUrl}
                          image={recipe.imageUrl}
                          isLoading={false}
                        />
                      </button>
                    )),
                  )}
                </>
              )}
            </div>
          )}
          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-10">
              {isFetchingNextPage && (
                <div className="flex items-center gap-3 rounded-full bg-[#99b94a]/10 px-5 py-2.5 text-[#99b94a]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent"></div>
                  <span className="text-sm font-medium">Đang tải thêm...</span>
                </div>
              )}
            </div>
          )}
          {/* No more data message */}
          {!hasNextPage && displayData && displayData.pages[0].totalCount > 0 && (
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500">
                <SparklesIcon className="h-4 w-4" />
                Đã hiển thị tất cả {displayData.pages[0].totalCount} công thức
              </div>
            </div>
          )}
        </section>
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
