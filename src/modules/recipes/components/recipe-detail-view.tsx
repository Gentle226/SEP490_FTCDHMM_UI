'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  BookmarkCheck,
  ChefHat,
  Clock,
  Edit,
  Heart,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent } from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';
import { useAuth } from '@/modules/auth/contexts/auth.context';
import { recipeService } from '@/modules/recipes/services/recipe.service';

import {
  useAddToFavorite,
  useRecipeDetail,
  useRemoveFromFavorite,
  useSaveRecipe,
  useUnsaveRecipe,
} from '../hooks/use-recipe-actions';
import styles from './recipe-detail-view.module.css';

interface RecipeDetailViewProps {
  recipeId: string;
}

export function RecipeDetailView({ recipeId }: RecipeDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch recipe using React Query
  const { data: recipe, isLoading, error } = useRecipeDetail(recipeId);

  // React Query mutations
  const addToFavorite = useAddToFavorite();
  const removeFromFavorite = useRemoveFromFavorite();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  // Check if current user is the author
  const isAuthor =
    user && recipe && (recipe.author?.id === user.id || recipe.createdBy?.id === user.id);

  // Get favorite and saved state from recipe data
  const isFavorited = recipe?.isFavorited ?? false;
  const isSaved = recipe?.isSaved ?? false;

  const handleDelete = async () => {
    if (!confirm('Bạn chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await recipeService.deleteRecipe(recipeId);

      // Invalidate all myRecipes queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['myRecipes'] });

      toast.success('Công thức đã được xóa thành công');
      router.push('/myrecipe');
    } catch (err) {
      console.error('Delete recipe error:', err);
      toast.error('Có lỗi xảy ra khi xóa công thức');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    const recipeUrl = `${window.location.origin}/recipe/${recipeId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Xem công thức "${recipe.name}" trên FitFood Tracker`,
          url: recipeUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(recipeUrl);
        toast.success('Đã sao chép link công thức!');
      } catch (_error) {
        toast.error('Không thể sao chép link');
      }
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFromFavorite.mutate(recipeId);
    } else {
      addToFavorite.mutate(recipeId);
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveRecipe.mutate(recipeId);
    } else {
      saveRecipe.mutate(recipeId);
    }
  };

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">
            {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              'Không thể tải thông tin công thức. Vui lòng thử lại sau.'}
          </p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy công thức</p>
        </div>
      </div>
    );
  }

  const difficultyMap: Record<string, string> = {
    Easy: 'Dễ',
    Medium: 'Trung bình',
    Hard: 'Khó',
  };

  return (
    <div className="mx-auto w-[70%] space-y-6 px-4 py-8">
      {/* Header: Image + Title, Labels, Author, Description, Buttons */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[350px_1fr]">
        {/* Left: Main Image */}
        <div className="relative h-80 w-full overflow-hidden rounded-lg border bg-gray-100">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              sizes="350px"
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src="/Outline Illustration Card.png"
              alt="No recipe image"
              fill
              sizes="350px"
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Right: Title, Labels, Author, Description, Buttons */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#99b94a]">{recipe.name}</h1>

          {/* Labels */}
          {recipe.labels && recipe.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.labels.map((label) => (
                <span
                  key={label.id}
                  className={styles.labelBadge}
                  style={{ backgroundColor: label.colorCode }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta Info: Difficulty, Time, Ration */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>
                {difficultyMap[recipe.difficulty.value as string] || recipe.difficulty.value}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookTime} phút</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.ration} người</span>
            </div>
          </div>

          {/* Author Info */}
          {(recipe.createdBy || recipe.author) && (
            <button
              onClick={() => {
                const authorId = recipe.author?.id || recipe.createdBy?.id;
                if (authorId) {
                  router.push(`/profile/${authorId}`);
                }
              }}
              className="-mx-3 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t px-3 py-2 pt-4 text-left transition-all hover:bg-gray-50"
            >
              {recipe.createdBy?.avatarUrl || recipe.author?.avatarUrl ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src={recipe.createdBy?.avatarUrl || recipe.author?.avatarUrl || ''}
                    alt={
                      recipe.createdBy?.userName ||
                      `${recipe.author?.firstName} ${recipe.author?.lastName}` ||
                      'Author'
                    }
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                  {(
                    recipe.createdBy?.userName?.charAt(0) ||
                    recipe.author?.firstName?.charAt(0) ||
                    'A'
                  ).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Tác Giả</p>
                <p className="font-semibold text-gray-800 transition-colors hover:text-[#99b94a]">
                  {recipe.createdBy?.userName ||
                    `${recipe.author?.firstName} ${recipe.author?.lastName}`}
                </p>
              </div>
            </button>
          )}

          {/* Description */}
          {recipe.description && (
            <div className="pt-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {recipe.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            {isAuthor ? (
              <>
                {/* Author buttons: Edit and Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push(`/recipe/${recipeId}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-500 hover:text-red-600"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </>
            ) : (
              <>
                {/* Non-author buttons: Favorite and Save */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleToggleFavorite}
                  disabled={addToFavorite.isPending || removeFromFavorite.isPending}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleToggleSave}
                  disabled={saveRecipe.isPending || unsaveRecipe.isPending}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 fill-[#99b94a] text-[#99b94a]" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isSaved ? 'Đã lưu' : 'Lưu'}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Ingredients and Cooking Steps - Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Left Column: Ingredients (1/3 width) */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Nguyên liệu</h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={`ingredient-${ingredient.id || index}`}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3"
                >
                  <span className="flex-1 text-sm font-semibold text-gray-800">
                    {ingredient.name || 'Không tên'}
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-600">
                    {ingredient.quantityGram ? `${ingredient.quantityGram}g` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Cooking Steps (2/3 width) */}
        {recipe.cookingSteps && recipe.cookingSteps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Các bước nấu</h2>
            <div className="space-y-6">
              {recipe.cookingSteps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                  <Card key={`step-${step.id || step.stepOrder}-${index}`}>
                    <CardContent className="pt-2 pb-2">
                      <div className="flex gap-4">
                        {/* Step Number */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] text-xl font-bold text-white">
                          {step.stepOrder}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-3">
                          <p className="whitespace-pre-wrap text-gray-800">{step.instruction}</p>

                          {/* Step Image */}
                          {step.imageUrl && (
                            <div className="relative h-64 w-full overflow-hidden rounded-lg border md:w-96">
                              <Image
                                src={step.imageUrl}
                                alt={`Bước ${step.stepOrder}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 384px"
                                className="object-cover"
                                priority={false}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto w-[70%] space-y-6 px-4 py-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[400px_1fr]">
        <Skeleton className="h-80 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
