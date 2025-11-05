'use client';

import { Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/base/components/ui/badge';
import { Card, CardContent } from '@/base/components/ui/card';
import { cn } from '@/base/lib';

import { MyRecipe } from '../types';

interface MyRecipeCardProps {
  recipe: MyRecipe;
}

export function MyRecipeCard({ recipe }: MyRecipeCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';

    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return 'N/A';

    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  // Extract difficulty value - handle both name and value properties
  const difficultyValue = (recipe.difficulty?.name || recipe.difficulty?.value || '') as string;

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <Image
              src="/Outline Illustration Card.png"
              alt="No recipe image"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          )}
        </div>

        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div className="space-y-3">
            {/* Recipe Name */}
            <h3 className="line-clamp-2 min-h-[3rem] text-lg font-semibold group-hover:text-[#99b94a]">
              {recipe.name}
            </h3>

            {/* Description */}
            {recipe.description && (
              <p className="line-clamp-2 text-sm text-gray-600">{recipe.description}</p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.cookTime} phút</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.ration} người</span>
              </div>
            </div>

            {/* Difficulty Badge */}
            {recipe.difficulty && (
              <div>
                <Badge className={cn('text-xs', getDifficultyColor(difficultyValue))}>
                  {getDifficultyLabel(difficultyValue)}
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">Nguyên liệu:</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                    <Badge
                      key={`ingredient-${ingredient.id || index}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {ingredient.name}
                    </Badge>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <Badge key="more-ingredients" variant="outline" className="text-xs">
                      +{recipe.ingredients.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Labels */}
            {recipe.labels && recipe.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.labels.slice(0, 3).map((label, index) => (
                  <Badge
                    key={`${label.id}-${index}`}
                    className="text-xs"
                    style={{
                      backgroundColor: label.colorCode,
                      color: '#fff',
                    }}
                  >
                    {label.name}
                  </Badge>
                ))}
                {recipe.labels.length > 3 && (
                  <Badge key="more-labels" variant="secondary" className="text-xs">
                    +{recipe.labels.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
