import { useQuery } from '@tanstack/react-query';

import { recipeService } from '../services/recipe.service';

interface UseUserRecipesParams {
  userName: string;
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch recipes by user name
 * Used for displaying recipes on user profile pages
 */
export function useUserRecipes({
  userName,
  pageNumber = 1,
  pageSize = 10,
  enabled = true,
}: UseUserRecipesParams) {
  return useQuery({
    queryKey: ['userRecipes', userName, pageNumber, pageSize],
    queryFn: () => {
      return recipeService.getRecipesByUserName(userName, {
        pageNumber,
        pageSize,
      });
    },
    enabled: enabled && !!userName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
