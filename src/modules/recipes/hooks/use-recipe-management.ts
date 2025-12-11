'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { recipeService } from '../services/recipe.service';
import { RecipeManagementListResponse } from '../types';

interface UsePendingRecipesParams {
  pageNumber?: number;
  pageSize?: number;
  isManagement?: boolean; // If true, fetch all pending recipes; if false, fetch user's own
}

export function usePendingRecipes(params: UsePendingRecipesParams = {}) {
  const { pageNumber = 1, pageSize = 10, isManagement = false } = params;

  return useQuery<RecipeManagementListResponse>({
    queryKey: ['pending-recipes', pageNumber, pageSize, isManagement],
    queryFn: () =>
      isManagement
        ? recipeService.getPendingRecipesManagement({ pageNumber, pageSize })
        : recipeService.getPendingRecipes({ pageNumber, pageSize }),
  });
}

export function useRecipeManagement() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const invalidatePendingRecipes = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-recipes'] });
  };

  const lockMutation = useMutation({
    mutationFn: ({ recipeId, reason }: { recipeId: string; reason: string }) =>
      recipeService.lockRecipe(recipeId, reason),
    onSuccess: () => {
      toast.success('Đã khóa công thức thành công');
      invalidatePendingRecipes();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (recipeId: string) => recipeService.approveRecipe(recipeId),
    onSuccess: () => {
      toast.success('Đã duyệt công thức thành công');
      invalidatePendingRecipes();
    },
    onError: () => {
      toast.error('Không thể duyệt công thức. Vui lòng thử lại.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ recipeId, reason }: { recipeId: string; reason: string }) =>
      recipeService.rejectRecipe(recipeId, reason),
    onSuccess: () => {
      toast.success('Đã từ chối công thức thành công');
      invalidatePendingRecipes();
    },
    onError: () => {
      toast.error('Không thể từ chối công thức. Vui lòng thử lại.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ recipeId, reason }: { recipeId: string; reason: string }) =>
      recipeService.deleteRecipeByAdmin(recipeId, reason),
    onSuccess: () => {
      toast.success('Đã xóa công thức thành công');
      invalidatePendingRecipes();
    },
    onError: () => {
      toast.error('Không thể xóa công thức. Vui lòng thử lại.');
    },
  });

  const lockRecipe = async (recipeId: string, reason: string) => {
    setIsLoading(true);
    try {
      await lockMutation.mutateAsync({ recipeId, reason });
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecipe = async (recipeId: string) => {
    setIsLoading(true);
    try {
      await approveMutation.mutateAsync(recipeId);
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRecipe = async (recipeId: string, reason: string) => {
    setIsLoading(true);
    try {
      await rejectMutation.mutateAsync({ recipeId, reason });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = async (recipeId: string, reason: string) => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync({ recipeId, reason });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lockRecipe,
    approveRecipe,
    rejectRecipe,
    deleteRecipe,
    isLoading:
      isLoading ||
      lockMutation.isPending ||
      approveMutation.isPending ||
      rejectMutation.isPending ||
      deleteMutation.isPending,
  };
}
