'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { useGetAverageRating, useRateRecipe } from '../hooks/use-recipe-actions';

interface RecipeRatingProps {
  recipeId: string;
  onRatingSubmitted?: () => void;
  showAverageRating?: boolean;
  enableRating?: boolean;
}

/**
 * RecipeRating Component
 * Displays average rating and allows users to submit ratings
 */
export function RecipeRating({
  recipeId,
  onRatingSubmitted,
  showAverageRating = true,
  enableRating = true,
}: RecipeRatingProps) {
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [hoveredScore, setHoveredScore] = useState<number>(0);

  const { data: averageRating, isLoading: isLoadingAverage } = useGetAverageRating(recipeId);
  const { mutate: submitRating, isPending: isSubmitting } = useRateRecipe();

  const handleStarClick = (score: number) => {
    if (!enableRating) return;
    setSelectedScore(score);
  };

  const handleSubmitRating = () => {
    if (selectedScore > 0) {
      submitRating(
        { recipeId, score: selectedScore },
        {
          onSuccess: () => {
            setSelectedScore(0);
            onRatingSubmitted?.();
          },
        },
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Average Rating Display */}
      {showAverageRating && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={
                  star <= Math.round(averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isLoadingAverage ? 'Đang tải...' : `${(averageRating || 0).toFixed(1)}/5`}
          </span>
        </div>
      )}

      {/* Rating Input */}
      {enableRating && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Đánh giá công thức</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredScore(star)}
                onMouseLeave={() => setHoveredScore(0)}
                className="p-0 transition-transform hover:scale-110"
                disabled={isSubmitting}
                title={`Đánh giá ${star} sao`}
                aria-label={`Đánh giá ${star} sao`}
              >
                <Star
                  size={24}
                  className={
                    star <= (hoveredScore || selectedScore)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>

          {selectedScore > 0 && (
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
