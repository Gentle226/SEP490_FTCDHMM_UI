'use client';

import { ChevronRightIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Button } from '@/base/components/ui/button';
import { IngredientCard } from '@/base/components/ui/ingredient-card';
import { Input } from '@/base/components/ui/input';
import { RecipeCard } from '@/base/components/ui/recipe-card';
import { useAuth } from '@/modules/auth';
import { IngredientDetailsResponse, ingredientPublicService } from '@/modules/ingredients';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { MyRecipeResponse } from '@/modules/recipes/types/my-recipe.types';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MyRecipeResponse['items']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [ingredients, setIngredients] = useState<IngredientDetailsResponse[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [recentRecipes, setRecentRecipes] = useState<MyRecipeResponse['items']>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

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
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    // Debounce search with 500ms delay
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await recipeService.searchRecipes({
          keyword: value,
          pageNumber: 1,
          pageSize: 10,
        });
        setSearchResults(response.items || []);
      } catch (error) {
        console.warn('Error searching recipes:', error);
        setSearchResults([]);
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
        setIsLoadingRecipes(true);
        const response = await recipeService.getHistory({
          pageNumber: 1,
          pageSize: 6,
        });
        setRecentRecipes(response.items || []);
      } catch (error) {
        console.warn('Error fetching recipe history:', error);
        setRecentRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipeHistory();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    // Navigate to search results page with query parameter
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowDropdown(false);
  };

  // Common search and recipes section
  const mainContent = (
    <main className="min-h-screen">
      {/* Search Section */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6">
              <Image
                src="/Fitfood Tracker Logo.png"
                alt="FitFood Tracker"
                className="mx-auto mb-4 h-36 w-auto"
                width={500}
                height={150}
              />
            </div>

            <div className="relative mx-auto max-w-2xl" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Tìm món ăn hoặc người dùng"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="h-12 border-2 border-gray-200 pr-12 text-lg focus:border-[#99b94a]"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1 right-1 h-10 w-10 bg-[#99b94a] hover:bg-[#7a8f3a]"
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
              </form>

              {/* Search Dropdown Results */}
              {showDropdown && (
                <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
                  {isSearching ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent"></div>
                      <p className="mt-2">Đang tìm kiếm...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="max-h-96 overflow-y-auto">
                        {searchResults.map((recipe, index) => (
                          <button
                            key={recipe.id || `recipe-${index}`}
                            onClick={() => {
                              router.push(`/recipe/${recipe.id}`);
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                            className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-all hover:bg-gray-50"
                          >
                            <Image
                              src={recipe.imageUrl || '/Outline Illustration Card.png'}
                              alt={recipe.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="line-clamp-1 font-medium text-gray-900">
                                {recipe.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {recipe.author
                                  ? `${recipe.author.firstName} ${recipe.author.lastName}`
                                  : 'Tác giả không xác định'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center justify-center gap-2 bg-gray-50 px-4 py-2 text-sm font-medium text-[#99b94a] transition-all hover:bg-gray-100"
                      >
                        Xem tất cả kết quả
                        <SearchIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      Không tìm thấy công thức nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ingredients Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#99b94a]">Nguyên Liệu Nổi Bật</h2>
            <Button variant="ghost" className="text-[#99b94a] hover:text-[#7a8f3a]">
              <span>Cập nhật 4:36</span>
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {isLoadingIngredients || ingredients.length === 0
              ? Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className={i === 8 ? 'md:hidden' : ''}>
                    <IngredientCard isLoading={true} />
                  </div>
                ))
              : ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className={index === 8 ? 'md:hidden' : ''}>
                    <IngredientCard
                      name={ingredient.name}
                      image={ingredient.imageUrl}
                      onClick={() => {
                        // TODO: Navigate to ingredient detail page
                        console.warn('Navigate to ingredient:', ingredient.id);
                      }}
                    />
                  </div>
                ))}
          </div>
        </section>

        {/* Recent Recipes Section - Only show for logged in users */}
        {user && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-[#99b94a]">Món bạn mới xem gần đây</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {isLoadingRecipes || recentRecipes.length === 0
                ? Array.from({ length: 6 }, (_, i) => (
                    <RecipeCard key={i} title="" author="" image={undefined} isLoading={true} />
                  ))
                : recentRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      title={recipe.name}
                      author={
                        recipe.author ? `${recipe.author.firstName} ${recipe.author.lastName}` : ''
                      }
                      authorAvatar={recipe.author?.avatarUrl}
                      image={recipe.imageUrl}
                      isLoading={false}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* All Recipes Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-[#99b94a]">Khám Phá Công Thức</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 20 }, (_, i) => (
              <RecipeCard
                key={i}
                title={`Món ăn ${i + 1}`}
                author={`Tác giả ${i + 1}`}
                isLoading={true} // Set to true to show skeleton
              />
            ))}
          </div>
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
