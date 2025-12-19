import { Calendar, Clock, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';

import { Skeleton } from '@/base/components/ui/skeleton';
import { cn } from '@/base/lib';
import { getFullDateTimeVN, getRelativeTime } from '@/modules/recipes/utils/time.utils';

const difficultyMap: Record<string, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Trung bình',
  HARD: 'Khó',
};

function getLocalizedDifficulty(difficulty?: string): string | undefined {
  if (!difficulty) return undefined;
  return difficultyMap[difficulty.toUpperCase()] || difficulty;
}

interface RecipeCardHorizontalProps {
  id?: string;
  title?: string;
  author?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  image?: string;
  cookTime?: number;
  ration?: number;
  difficulty?: string;
  ingredients?: Array<{ id: string; name: string }>;
  labels?: Array<{ id: string; name: string; colorCode: string }>;
  createdAtUtc?: string;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  score?: number | null;
}

export function RecipeCardHorizontal({
  id,
  title,
  author,
  image,
  cookTime,
  ration,
  difficulty,
  ingredients,
  labels,
  createdAtUtc,
  className,
  isLoading = false,
  onClick,
  score,
}: RecipeCardHorizontalProps) {
  if (isLoading) {
    return (
      <div className={cn('flex gap-4 rounded-lg border border-gray-200 bg-white p-4', className)}>
        <div className="h-40 w-40 flex-shrink-0">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="flex-1">
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-[#99b94a] hover:shadow-md sm:flex-row sm:gap-4 sm:p-4',
        className,
      )}
    >
      {/* Recipe Image */}
      <div className="relative h-40 w-full flex-shrink-0 rounded-lg bg-gray-100 sm:h-48 sm:w-48 md:h-60 md:w-60">
        <Image
          src={image || '/outline-illustration-card.png'}
          alt={title || 'Recipe'}
          width={240}
          height={240}
          className="h-full w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 sm:rounded-l-lg"
          priority={false}
        />
      </div>

      {/* Recipe Info */}
      <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-3">
        {/* Score Badge for Recommendations */}
        {score !== undefined && score !== null && score > 0 && (
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-amber-600 sm:text-sm">
              Điểm phù hợp: {Math.round(score * 100)}%
            </span>
          </div>
        )}

        {/* Recipe Title */}
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-[#99b94a] sm:text-lg">
          {title || 'Recipe name'}
        </h3>

        {/* Ingredients List */}
        {ingredients && ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {ingredients.slice(0, 4).map((ingredient, index) => (
              <span
                key={`${id}-ingredient-${ingredient.id}-${index}`}
                className="inline-flex rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] text-gray-600 sm:px-2 sm:py-1 sm:text-xs"
                title={ingredient.name}
              >
                {ingredient.name}
              </span>
            ))}
            {ingredients.length > 4 && (
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500 sm:px-2 sm:py-1 sm:text-xs">
                +{ingredients.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta Info: Difficulty, Cooktime, Ration, CreatedTime */}
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 sm:gap-3 sm:text-xs">
          {difficulty && (
            <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-orange-600 sm:px-2 sm:py-1">
              {getLocalizedDifficulty(difficulty)}
            </span>
          )}
          {cookTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{cookTime} phút</span>
            </div>
          )}
          {ration && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{ration} phần</span>
            </div>
          )}
          {createdAtUtc && (
            <div className="flex items-center gap-1" title={getFullDateTimeVN(createdAtUtc)}>
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-gray-400">{getRelativeTime(createdAtUtc)} trước</span>
            </div>
          )}
        </div>

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {labels.slice(0, 2).map((label, index) => {
              const bgColor = label.colorCode || '#99b94a';
              return (
                <span
                  key={`${id}-label-${label.id}-${index}`}
                  className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{
                    backgroundColor: bgColor,
                  }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}

        {/* Author Info */}
        {author && (typeof author === 'object' ? author.firstName || author.lastName : author) && (
          <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
            {author && typeof author === 'object' ? (
              author.avatarUrl ? (
                <div className="h-7 w-7 flex-shrink-0">
                  <Image
                    src={author.avatarUrl}
                    alt={`${author.firstName || ''} ${author.lastName || ''}`}
                    width={28}
                    height={28}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] text-xs font-semibold text-white">
                  {(author.firstName?.[0] || author.lastName?.[0] || '?').toUpperCase()}
                </div>
              )
            ) : null}
            <span className="text-xs font-medium text-gray-700">
              {author && typeof author === 'object'
                ? `${author.firstName || ''} ${author.lastName || ''}`.trim()
                : author}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
