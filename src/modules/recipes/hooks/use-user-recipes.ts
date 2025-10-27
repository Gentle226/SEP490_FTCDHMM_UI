import { useQuery } from '@tanstack/react-query';

import { recipeService } from '../services/recipe.service';

interface UseUserRecipesParams {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch recipes by user ID
 * Used for displaying recipes on user profile pages
 */
export function useUserRecipes({
  userId,
  pageNumber = 1,
  pageSize = 10,
  enabled = true,
}: UseUserRecipesParams) {
  return useQuery({
    queryKey: ['userRecipes', userId, pageNumber, pageSize],
    queryFn: () =>
      recipeService.getRecipesByUserId(userId, {
        pageNumber,
        pageSize,
      }),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
