import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ratingService } from '../services/rating.service';
import { recipeService } from '../services/recipe.service';
import { RecipeDetail } from '../types';

/**
 * Hook to fetch recipe details
 */
export function useRecipeDetail(recipeId: string) {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
    enabled: !!recipeId,
  });
}

/**
 * Hook to save recipe
 */
export function useSaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => recipeService.saveRecipe(recipeId),
    onMutate: async (recipeId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['recipe', recipeId] });

      // Snapshot the previous value
      const previousRecipe = queryClient.getQueryData(['recipe', recipeId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['recipe', recipeId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const recipe = old as RecipeDetail;
        return {
          ...recipe,
          isSaved: true,
        };
      });

      // Update localStorage
      const savedRecipes = localStorage.getItem('savedRecipes');
      const saved = savedRecipes ? JSON.parse(savedRecipes) : [];
      if (!saved.includes(recipeId)) {
        saved.push(recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(saved));
      }

      // Return a context object with the snapshotted value
      return { previousRecipe, recipeId };
    },
    onSuccess: () => {
      // Invalidate saved list
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
      toast.success('Đã lưu công thức');
    },
    onError: (error: unknown, recipeId, context: unknown) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const ctx = context as { previousRecipe?: unknown; recipeId?: string } | undefined;
      if (ctx?.previousRecipe && ctx?.recipeId) {
        queryClient.setQueryData(['recipe', ctx.recipeId], ctx.previousRecipe);
      }

      // Rollback localStorage
      const savedRecipes = localStorage.getItem('savedRecipes');
      if (savedRecipes) {
        const saved = JSON.parse(savedRecipes);
        const updated = saved.filter((id: string) => id !== recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(updated));
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu công thức';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to unsave recipe
 */
export function useUnsaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => recipeService.unsaveRecipe(recipeId),
    onMutate: async (recipeId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['recipe', recipeId] });

      // Snapshot the previous value
      const previousRecipe = queryClient.getQueryData(['recipe', recipeId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['recipe', recipeId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const recipe = old as RecipeDetail;
        return {
          ...recipe,
          isSaved: false,
        };
      });

      // Update localStorage
      const savedRecipes = localStorage.getItem('savedRecipes');
      if (savedRecipes) {
        const saved = JSON.parse(savedRecipes);
        const updated = saved.filter((id: string) => id !== recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(updated));
      }

      // Return a context object with the snapshotted value
      return { previousRecipe, recipeId };
    },
    onSuccess: () => {
      // Invalidate saved list
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
      toast.success('Đã bỏ lưu công thức');
    },
    onError: (error: unknown, recipeId, context: unknown) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const ctx = context as { previousRecipe?: unknown; recipeId?: string } | undefined;
      if (ctx?.previousRecipe && ctx?.recipeId) {
        queryClient.setQueryData(['recipe', ctx.recipeId], ctx.previousRecipe);
      }

      // Rollback localStorage
      const savedRecipes = localStorage.getItem('savedRecipes');
      const saved = savedRecipes ? JSON.parse(savedRecipes) : [];
      if (!saved.includes(recipeId)) {
        saved.push(recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(saved));
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể bỏ lưu công thức';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to get average rating for a recipe
 */
export function useGetAverageRating(recipeId: string | null | undefined) {
  return useQuery({
    queryKey: ['averageRating', recipeId],
    queryFn: async () => {
      if (!recipeId) return null;
      const response = await ratingService.getAverageRating(recipeId);
      return response;
    },
    enabled: !!recipeId,
  });
}

/**
 * Hook to rate a recipe
 */
export function useRateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      score,
      feedback,
    }: {
      recipeId: string;
      score: number;
      feedback?: string;
    }) => ratingService.rateRecipe(recipeId, { score, feedback: feedback || '' }),
    onSuccess: (_, { recipeId }) => {
      // Invalidate average rating query
      queryClient.invalidateQueries({ queryKey: ['averageRating', recipeId] });
      toast.success('Đã đánh giá công thức');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể đánh giá công thức';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete a recipe rating
 */
export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId }: { ratingId: string }) => ratingService.deleteRating(ratingId),
    onSuccess: () => {
      // Invalidate all rating queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['averageRating'] });
      toast.success('Đã xóa đánh giá');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa đánh giá';
      toast.error(errorMessage);
    },
  });
}
