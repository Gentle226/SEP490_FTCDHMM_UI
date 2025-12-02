'use client';

import { Flag, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/base/components/ui/dialog';
import { Skeleton } from '@/base/components/ui/skeleton';
import { useDeleteRating } from '@/modules/recipes/hooks/use-recipe-actions';
import { ReportModal } from '@/modules/report/components/ReportModal';
import { ReportTargetType } from '@/modules/report/types';

import { recipeService } from '../services/recipe.service';
import { RatingResponse } from '../types/rating.types';

interface FeedbackDialogProps {
  recipeId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * FeedbackDialog Component
 * Displays all user feedback and ratings for a recipe
 */
export function FeedbackDialog({ recipeId, isOpen, onOpenChange }: FeedbackDialogProps) {
  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const deleteRating = useDeleteRating();

  const loadRatings = useCallback(async () => {
    if (!isOpen) return;

    try {
      setIsLoading(true);
      const response = await recipeService.getRecipeRatings(recipeId, {
        pageNumber,
        pageSize,
      });

      if (response) {
        setRatings(response.items || []);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, isOpen, pageNumber, pageSize]);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      loadRatings();
    }
  }, [isOpen, loadRatings]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= score ? 'fill-[#99b94a] text-[#99b94a]' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      // Ensure the date string is interpreted as UTC by appending 'Z' if not present
      const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
      const date = new Date(utcDateString);
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nhận xét và Đánh giá</DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="border-b pb-4">
          <p className="text-sm text-gray-600">
            Tổng cộng <span className="font-semibold text-gray-900">{totalCount}</span> đánh giá
          </p>
        </div>

        {/* Ratings List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 rounded-lg border p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </>
          ) : ratings.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-center text-gray-500">Chưa có đánh giá nào</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div
                key={rating.id}
                className="flex gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                {/* User Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {rating.userInteractionResponse?.avatarUrl ? (
                    <Image
                      src={rating.userInteractionResponse.avatarUrl}
                      alt={rating.userInteractionResponse?.firstName || 'User'}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                      {(rating.userInteractionResponse?.firstName?.[0] || 'A').toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Rating Content */}
                <div className="flex-1 space-y-2">
                  {/* User Name | Date | Action */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {rating.userInteractionResponse
                          ? `${rating.userInteractionResponse.firstName || ''} ${rating.userInteractionResponse.lastName || ''}`.trim()
                          : 'Anonymous'}
                      </h3>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      {rating.createdAtUtc && (
                        <span className="text-xs whitespace-nowrap text-gray-500">
                          {formatDate(rating.createdAtUtc)}
                        </span>
                      )}

                      {rating.isOwner ? (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                              deleteRating.mutate(
                                { ratingId: rating.id },
                                {
                                  onSuccess: () => {
                                    // Close the feedback dialog after successful deletion
                                    onOpenChange(false);
                                  },
                                },
                              );
                            }
                          }}
                          disabled={deleteRating.isPending}
                          title="Xóa đánh giá"
                          className="inline-flex items-center justify-center rounded border border-red-600 bg-white p-2 text-red-600 transition-all hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRatingId(rating.id);
                            setReportModalOpen(true);
                          }}
                          title="Báo cáo đánh giá"
                          className="inline-flex items-center justify-center rounded border border-red-600 bg-white p-2 text-red-600 transition-all hover:bg-red-50 active:bg-red-100"
                        >
                          <Flag size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="py-1">{renderStars(rating.score)}</div>

                  {/* Feedback Text */}
                  {rating.feedback && (
                    <p className="text-sm leading-relaxed text-gray-700">{rating.feedback}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
              disabled={pageNumber === 1 || isLoading}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
              disabled={pageNumber === totalPages || isLoading}
            >
              Tiếp
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Report Modal */}
      {selectedRatingId && (
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          targetId={selectedRatingId}
          targetType={ReportTargetType.RATING}
          targetName="Đánh giá"
        />
      )}
    </Dialog>
  );
}
