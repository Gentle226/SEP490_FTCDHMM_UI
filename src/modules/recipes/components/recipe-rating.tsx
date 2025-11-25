'use client';

import { MessageCircle, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Textarea } from '@/base/components/ui/textarea';

import { useDeleteRating, useGetAverageRating, useRateRecipe } from '../hooks/use-recipe-actions';
import { FeedbackDialog } from './feedback-dialog';

interface RecipeRatingProps {
  recipeId: string;
  onRatingSubmitted?: () => void;
  showAverageRating?: boolean;
  enableRating?: boolean;
}

/**
 * RecipeRating Component
 * Displays average rating and allows users to submit ratings with feedback
 */
export function RecipeRating({
  recipeId,
  onRatingSubmitted,
  showAverageRating = true,
  enableRating = true,
}: RecipeRatingProps) {
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [hoveredScore, setHoveredScore] = useState<number>(0);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [userRatingId, setUserRatingId] = useState<string | null>(null);

  const { data: averageRating, isLoading: isLoadingAverage } = useGetAverageRating(recipeId);
  const { mutate: submitRating, isPending: isSubmitting } = useRateRecipe();
  const { mutate: deleteRating, isPending: isDeleting } = useDeleteRating();

  const handleStarClick = (score: number) => {
    if (!enableRating) return;
    setSelectedScore(score);
  };

  const handleSubmitRating = () => {
    if (selectedScore > 0) {
      // Feedback is required when score is 3 or lower
      if (selectedScore < 4 && !feedback.trim()) {
        return; // Show error will be displayed in UI
      }

      submitRating(
        { recipeId, score: selectedScore, feedback },
        {
          onSuccess: (response) => {
            // response is RatingResponse with id
            if (response?.id) {
              setUserRatingId(response.id);
            }
            setSelectedScore(0);
            setFeedback('');
            onRatingSubmitted?.();
          },
        },
      );
    }
  };

  const handleDeleteRating = () => {
    if (!userRatingId) return;

    deleteRating(
      { ratingId: userRatingId },
      {
        onSuccess: () => {
          setUserRatingId(null);
          setSelectedScore(0);
          setFeedback('');
          onRatingSubmitted?.();
        },
      },
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Average Rating Display */}
        {showAverageRating && (
          <div className="space-y-4">
            {/* Row 1: Stars and Rating Score */}
            <div className="flex items-center gap-8">
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = Number(averageRating?.averageRating) || 0;
                  const isFilled = star <= Math.floor(rating);
                  const isHalf = star === Math.ceil(rating) && rating % 1 !== 0;

                  return (
                    <div key={star} className="relative h-6 w-6">
                      {/* Background empty star */}
                      <Star size={24} className="absolute text-gray-300" />
                      {/* Filled or half-filled star overlay */}
                      {(isFilled || isHalf) && (
                        <div
                          className="absolute top-0 left-0 overflow-hidden"
                          style={{ width: isFilled ? '100%' : '50%', height: '100%' }}
                        >
                          <Star size={24} style={{ fill: '#99b94a', color: '#99b94a' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rating Score (large) */}
              <div className="flex items-baseline gap-1">
                <div className="text-3xl font-bold text-gray-800">
                  {isLoadingAverage
                    ? '...'
                    : (Number(averageRating?.averageRating) || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">/5</div>
              </div>
            </div>

            {/* Row 2: Number of Ratings and View Reviews Button */}
            <div className="flex items-center gap-8">
              {/* Number of Ratings */}
              <div className="text-sm text-gray-600">
                {isLoadingAverage
                  ? 'Đang tải...'
                  : `${averageRating?.numberOfRatings || 0} đánh giá`}
              </div>

              {/* View Reviews Button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setIsFeedbackDialogOpen(true)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Xem nhận xét</span>
              </Button>
            </div>
          </div>
        )}

        {/* Rating Input */}
        {enableRating && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Đánh giá công thức</p>

            {/* Star Rating */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredScore(star)}
                    onMouseLeave={() => setHoveredScore(0)}
                    className="p-0 transition-transform hover:scale-110"
                    disabled={isSubmitting || isDeleting}
                    title={`Đánh giá ${star} sao`}
                    aria-label={`Đánh giá ${star} sao`}
                  >
                    <Star
                      size={24}
                      style={
                        star <= (hoveredScore || selectedScore)
                          ? { fill: '#99b94a', color: '#99b94a' }
                          : undefined
                      }
                      className={star <= (hoveredScore || selectedScore) ? '' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>

              {/* Delete Rating Button */}
              {userRatingId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteRating}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">
                    {isDeleting ? 'Đang xóa...' : 'Xóa đánh giá'}
                  </span>
                </Button>
              )}
            </div>

            {/* Feedback Textarea */}
            {selectedScore > 0 && (
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="rating-feedback"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {selectedScore < 4
                      ? 'Nhận xét của bạn (bắt buộc)'
                      : 'Nhận xét của bạn (tùy chọn)'}
                  </label>
                  <Textarea
                    id="rating-feedback"
                    placeholder="Chia sẻ ý kiến của bạn về công thức này..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 256))}
                    maxLength={256}
                    rows={3}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {feedback.length}/256 ký tự
                  </p>
                  {selectedScore < 4 && !feedback.trim() && (
                    <p className="text-xs text-red-500">
                      Bắt buộc phải nhận xét khi đánh giá dưới 4 sao
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitRating}
                  disabled={isSubmitting || (selectedScore < 4 && !feedback.trim())}
                  className="mt-2 rounded-lg bg-[#99b94a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#88a43a] disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackDialog
        recipeId={recipeId}
        isOpen={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      />
    </>
  );
}
