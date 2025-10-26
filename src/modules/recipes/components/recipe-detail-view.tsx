'use client';

import { ChefHat, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { RecipeDetail } from '@/modules/recipes/types';

interface RecipeDetailViewProps {
  recipeId: string;
}

export function RecipeDetailView({ recipeId }: RecipeDetailViewProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await recipeService.getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        setError('Không thể tải thông tin công thức. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">{error || 'Không tìm thấy công thức'}</p>
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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#99b94a]">{recipe.name}</h1>

        {/* Labels */}
        {recipe.labels && recipe.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.labels.map((label) => (
              <span
                key={label.id}
                className="rounded-full px-3 py-1 text-sm text-white"
                style={{ backgroundColor: label.colorCode }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            <span>{difficultyMap[recipe.difficulty.name] || recipe.difficulty.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{recipe.cookTime} phút</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>{recipe.ration} người</span>
          </div>
        </div>
      </div>

      {/* Main Image and Description */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[400px_1fr]">
        {/* Image */}
        {recipe.imageUrl && (
          <div className="relative h-80 w-full overflow-hidden rounded-lg border">
            <Image src={recipe.imageUrl} alt={recipe.name} fill className="object-cover" priority />
          </div>
        )}

        {/* Description */}
        {recipe.description && (
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Mô tả</h2>
            <p className="whitespace-pre-wrap text-gray-700">{recipe.description}</p>
          </div>
        )}
      </div>

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Nguyên liệu</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center rounded-lg border bg-gray-50 px-4 py-3"
              >
                <span className="text-sm font-medium">{ingredient.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cooking Steps */}
      {recipe.cookingSteps && recipe.cookingSteps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Các bước nấu</h2>
          <div className="space-y-6">
            {recipe.cookingSteps.map((step) => (
              <Card key={step.stepOrder}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Step Number */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] text-xl font-bold text-white">
                      {step.stepOrder}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">
                      <p className="whitespace-pre-wrap text-gray-800">{step.instruction}</p>

                      {/* Step Image */}
                      {step.imageURL && (
                        <div className="relative h-64 w-full overflow-hidden rounded-lg border md:w-96">
                          <Image
                            src={step.imageURL}
                            alt={`Bước ${step.stepOrder}`}
                            fill
                            className="object-cover"
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

      {/* Author Info */}
      {recipe.createdBy && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-3">
            {recipe.createdBy.avatarUrl ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                <Image
                  src={recipe.createdBy.avatarUrl}
                  alt={recipe.createdBy.userName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                {recipe.createdBy.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Được tạo bởi</p>
              <p className="font-semibold">{recipe.createdBy.userName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
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
