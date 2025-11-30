'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChefHat,
  Clock,
  Copy,
  Edit,
  Share2,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent } from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';
import { getToken } from '@/base/lib/get-token.lib';
import { useAuth } from '@/modules/auth/contexts/auth.context';
import { checkIngredientRestriction, useGetUserDietRestrictions } from '@/modules/diet-restriction';
import { recipeService } from '@/modules/recipes/services/recipe.service';

import { useCommentManager, useSignalRConnection } from '../hooks';
import { useRecipeDetail, useSaveRecipe, useUnsaveRecipe } from '../hooks/use-recipe-actions';
import { getFullDateTimeVN, getRelativeTime } from '../utils/time.utils';
import { CommentList } from './comment-list';
import { IngredientCardDetail } from './ingredient-card-detail';
import styles from './recipe-detail-view.module.css';
import { RecipeRating } from './recipe-rating';

interface RecipeDetailViewProps {
  recipeId: string;
}

// Helper function to get the timestamp to display
const getTimestampToDisplay = (
  createdAtUtc: string | undefined,
  updatedAtUtc: string | undefined,
): { timestamp: string; isUpdated: boolean } | null => {
  // Check if updatedAtUtc is a valid timestamp (not the default 0001-01-01)
  const isUpdatedAtDefault =
    !updatedAtUtc ||
    updatedAtUtc === '0001-01-01T00:00:00' ||
    updatedAtUtc === '0001-01-01T00:00:00.0000000' ||
    updatedAtUtc.startsWith('0001-01-01');

  // If updatedAtUtc is the default value, use createdAtUtc
  if (isUpdatedAtDefault) {
    return createdAtUtc ? { timestamp: createdAtUtc, isUpdated: false } : null;
  }

  // Otherwise, updatedAtUtc has been set, so show it
  return updatedAtUtc ? { timestamp: updatedAtUtc, isUpdated: true } : null;
};

export function RecipeDetailView({ recipeId }: RecipeDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch recipe using React Query
  const { data: recipe, isLoading, error } = useRecipeDetail(recipeId);

  // Fetch user's diet restrictions (only if user is logged in)
  const { data: userRestrictions = [] } = useGetUserDietRestrictions(user ? {} : undefined);

  // SignalR connection for real-time updates
  const signalRConnection = useSignalRConnection(recipeId);

  // React Query mutations
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  // Check if current user is the author
  const isAuthor =
    user && recipe ? recipe.author?.id === user.id || recipe.createdBy?.id === user.id : false;

  // Get saved state from recipe data
  const isSaved = recipe?.isSaved ?? false;

  // Load comments with real-time updates (pass SignalR connection)
  const {
    comments,
    loading: commentsLoading,
    createComment,
    updateComment,
    deleteComment,
    deleteCommentAsAuthor,
    deleteCommentAsAdmin,
  } = useCommentManager(recipeId, signalRConnection);

  // Assume admin for now - adjust based on user role if available
  const isAdmin = user?.role === 'Admin' || false;

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

  const handleCopy = () => {
    if (!recipe) return;

    // Store the current recipe data in session storage to pass to the copy form
    const copyData = {
      parentId: recipeId,
      sourceName: recipe.name,
      sourceDescription: recipe.description,
      sourceImageUrl: recipe.imageUrl,
      sourceIngredients: recipe.ingredients,
      sourceCookingSteps: recipe.cookingSteps,
      sourceDifficulty: recipe.difficulty?.value,
      sourceCookTime: recipe.cookTime,
      sourceRation: recipe.ration,
      sourceLabels: recipe.labels,
    };

    sessionStorage.setItem('recipesCopyData', JSON.stringify(copyData));

    // Navigate to the new recipe form (which will handle the copy)
    router.push('/recipe/new?copy=true');
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

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveRecipe.mutate(recipeId);
    } else {
      saveRecipe.mutate(recipeId);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập để xóa bình luận');
        return;
      }

      // Pass token to the delete methods
      if (isAdmin) {
        await deleteCommentAsAdmin(commentId, token);
      } else if (isAuthor) {
        await deleteCommentAsAuthor(commentId, token);
      } else {
        await deleteComment(commentId, token);
      }
    } catch (error) {
      // Error already handled by toast in the hook
      console.error('Delete comment error:', error);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập để sửa bình luận');
        return;
      }
      await updateComment(commentId, { content }, token);
    } catch (error) {
      // Error already handled by toast in the hook
      console.error('Update comment error:', error);
    }
  };

  const handleCreateComment = async (
    parentCommentId: string | undefined,
    content: string,
    mentionedUserIds?: string[],
  ) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm bình luận');
        return;
      }

      console.warn('[RecipeDetailView] Creating comment:', {
        parentCommentId,
        contentLength: content.length,
        mentionedUserIds,
        hasToken: !!token,
      });

      await createComment(
        {
          content,
          parentCommentId: parentCommentId || null,
          mentionedUserIds,
        },
        token, // Pass the actual JWT token
      );
      console.warn('[RecipeDetailView] Comment created successfully');
    } catch (error) {
      // Error already handled by hook and form
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      console.error('[RecipeDetailView] Create comment error:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack',
      });
      throw error;
    }
  };

  // Setup real-time listeners for rating updates via SignalR
  useEffect(() => {
    if (!signalRConnection) {
      console.warn('[RecipeDetailView] No SignalR connection available');
      return;
    }

    console.warn(
      '[RecipeDetailView] Setting up rating listeners, connection state:',
      signalRConnection.state,
    );

    // Handle rating update event - refresh average rating
    signalRConnection.on('RatingUpdated', (data) => {
      console.warn('[RecipeDetailView] Received RatingUpdated event:', data);
      queryClient.invalidateQueries({ queryKey: ['averageRating', recipeId] });
    });

    // Handle rating delete event - refresh average rating
    signalRConnection.on('RatingDeleted', (data) => {
      console.warn('[RecipeDetailView] Received RatingDeleted event:', data);
      queryClient.invalidateQueries({ queryKey: ['averageRating', recipeId] });
    });

    // Cleanup listeners on unmount
    return () => {
      console.warn('[RecipeDetailView] Cleaning up rating listeners');
      signalRConnection.off('RatingUpdated');
      signalRConnection.off('RatingDeleted');
    };
  }, [signalRConnection, recipeId, queryClient]);

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
    EASY: 'Dễ',
    MEDIUM: 'Trung bình',
    HARD: 'Khó',
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      {/* Header: Image + Title, Labels, Author, Description, Buttons */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr]">
        {/* Left: Main Image */}
        <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-gray-100 sm:h-80 lg:h-full">
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
        <div className="min-w-0 space-y-3 sm:space-y-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-[#99b94a] sm:text-3xl">{recipe.name}</h1>

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

          {/* Meta Info: Difficulty, Time, Ration, Created Date */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
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
            {(recipe.createdAtUtc || recipe.createdAt) &&
              (() => {
                const timestampInfo = getTimestampToDisplay(
                  recipe.createdAtUtc || recipe.createdAt,
                  recipe.updatedAtUtc || recipe.updatedAt,
                );
                if (!timestampInfo) return null;
                const relativeTime = getRelativeTime(timestampInfo.timestamp);
                const isJustNow = relativeTime === 'Vừa xong';
                return (
                  <div
                    className="flex items-center gap-1"
                    title={getFullDateTimeVN(timestampInfo.timestamp)}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>
                      {timestampInfo.isUpdated ? 'Cập nhật: ' : ''}
                      {relativeTime}
                      {!isJustNow && ' trước'}
                    </span>
                  </div>
                );
              })()}
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
              className="-mx-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border-t px-2 py-2 text-left transition-all hover:bg-gray-50 sm:-mx-3 sm:gap-3 sm:px-3 sm:pt-4"
            >
              {recipe.createdBy?.avatarUrl || recipe.author?.avatarUrl ? (
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border sm:h-12 sm:w-12">
                  <Image
                    src={recipe.createdBy?.avatarUrl || recipe.author?.avatarUrl || ''}
                    alt={
                      recipe.createdBy?.userName ||
                      `${recipe.author?.firstName} ${recipe.author?.lastName}` ||
                      'Author'
                    }
                    fill
                    sizes="(max-width: 640px) 40px, 48px"
                    className="object-cover"
                    priority={false}
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-base font-semibold text-gray-600 sm:h-12 sm:w-12 sm:text-lg">
                  {(
                    recipe.createdBy?.userName?.charAt(0) ||
                    recipe.author?.firstName?.charAt(0) ||
                    'A'
                  ).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Tác Giả</p>
                <p className="text-sm font-semibold text-gray-800 transition-colors hover:text-[#99b94a] sm:text-base">
                  {recipe.createdBy?.userName ||
                    `${recipe.author?.firstName} ${recipe.author?.lastName}`}
                </p>
              </div>
            </button>
          )}

          {/* Description */}
          {recipe.description && (
            <div className="pt-1 sm:pt-2">
              <p className="w-full text-xs leading-relaxed break-words whitespace-pre-wrap text-gray-700 sm:text-sm">
                {recipe.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1 pt-2 sm:gap-2 sm:pt-4">
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
                {/* Non-author buttons: Copy and Save */}
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
                <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Tạo bản sao
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
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl font-semibold sm:text-2xl">Nguyên liệu</h2>

            {/* Show alert if user has diet restrictions affecting this recipe */}
            {user &&
              userRestrictions.length > 0 &&
              recipe.ingredients.some((ing) => {
                // Check ingredient name restrictions
                const ingredientRestrictions = checkIngredientRestriction(
                  ing.name,
                  userRestrictions,
                );
                return ingredientRestrictions.length > 0;
              }) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    <TriangleAlert className="inline-block h-4 w-4" />
                    <span> Công thức này chứa thành phần bị hạn chế theo danh sách của bạn</span>
                  </p>
                  <p className="mt-1 text-xs text-amber-800 italic">
                    Chú ý các thành phần có ký hiệu để tránh hoặc thay thế cho phù hợp chế độ ăn
                    uống của bạn.
                  </p>
                </div>
              )}
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                // Use ingredientId if available, fallback to id
                const ingredientId = ingredient.ingredientId || ingredient.id;
                return (
                  <IngredientCardDetail
                    key={`ingredient-${ingredientId || index}`}
                    ingredient={{
                      id: ingredientId,
                      name: ingredient.name,
                      quantityGram: ingredient.quantityGram,
                    }}
                    dietRestrictions={userRestrictions}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Right Column: Cooking Steps (2/3 width) */}
        {recipe.cookingSteps && recipe.cookingSteps.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl font-semibold sm:text-2xl">Các bước nấu</h2>
            <div className="space-y-4 sm:space-y-6">
              {recipe.cookingSteps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                  <Card key={`step-${step.id || step.stepOrder}-${index}`}>
                    <CardContent className="pt-2 pb-2">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Step Number */}
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
                          {step.stepOrder}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          <p className="text-xs whitespace-pre-wrap text-gray-800 sm:text-sm">
                            {step.instruction}
                          </p>

                          {/* Step Images */}
                          {step.cookingStepImages && step.cookingStepImages.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              {step.cookingStepImages
                                .filter(
                                  (img): img is typeof img & { imageUrl: string } => !!img.imageUrl,
                                )
                                .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0)) // Sort by imageOrder
                                .map((image) => (
                                  <div
                                    key={`step-image-${image.id}`}
                                    className="relative h-40 w-full overflow-hidden rounded-lg border sm:h-64 lg:w-96"
                                  >
                                    <Image
                                      src={image.imageUrl}
                                      alt={`Bước ${step.stepOrder}`}
                                      fill
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 384px"
                                      className="object-cover"
                                      priority={false}
                                    />
                                  </div>
                                ))}
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

      {/* Comments Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <RecipeRating recipeId={recipeId} enableRating={!!user} showAverageRating={true} />
      </div>

      {/* Comments Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <CommentList
          comments={comments}
          recipeId={recipeId}
          currentUserId={user?.id}
          isRecipeAuthor={isAuthor}
          isAdmin={isAdmin}
          onDelete={handleDeleteComment}
          onEdit={handleUpdateComment}
          onCreateComment={handleCreateComment}
          loading={commentsLoading}
        />
      </div>
    </div>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <div className="space-y-2 sm:space-y-4">
        <Skeleton className="h-8 w-3/4 sm:h-12" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 sm:h-8 sm:w-20" />
          <Skeleton className="h-6 w-20 sm:h-8 sm:w-24" />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Skeleton className="h-4 w-20 sm:h-6 sm:w-24" />
          <Skeleton className="h-4 w-24 sm:h-6 sm:w-28" />
          <Skeleton className="h-4 w-28 sm:h-6 sm:w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr]">
        <Skeleton className="h-64 w-full sm:h-80" />
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-6 w-32 sm:h-8" />
          <Skeleton className="h-3 w-full sm:h-4" />
          <Skeleton className="h-3 w-full sm:h-4" />
          <Skeleton className="h-3 w-3/4 sm:h-4" />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-6 w-40 sm:h-8" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full sm:h-12" />
          ))}
        </div>
      </div>
    </div>
  );
}
