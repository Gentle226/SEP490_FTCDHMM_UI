import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { dietRestrictionService } from '../services/diet-restriction.service';
import {
  CreateIngredientCategoryRestrictionRequest,
  CreateIngredientRestrictionRequest,
  UserDietRestrictionFilterRequest,
} from '../types';

/**
 * Hook to fetch user's dietary restrictions
 */
export function useGetUserDietRestrictions(filter?: UserDietRestrictionFilterRequest) {
  return useQuery({
    queryKey: ['dietRestrictions', filter],
    queryFn: () => dietRestrictionService.getUserDietRestrictions(filter),
  });
}

/**
 * Hook to create an ingredient restriction
 */
export function useCreateIngredientRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientRestrictionRequest) =>
      dietRestrictionService.createIngredientRestriction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietRestrictions'] });
      toast.success('Đã thêm hạn chế thành công');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể thêm hạn chế';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to create an ingredient category restriction
 */
export function useCreateIngredientCategoryRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIngredientCategoryRestrictionRequest) =>
      dietRestrictionService.createIngredientCategoryRestriction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietRestrictions'] });
      toast.success('Đã thêm hạn chế danh mục thành công');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể thêm hạn chế danh mục';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete a dietary restriction
 */
export function useDeleteRestriction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restrictionId: string) => dietRestrictionService.deleteRestriction(restrictionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietRestrictions'] });
      toast.success('Đã xóa hạn chế thành công');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa hạn chế';
      toast.error(errorMessage);
    },
  });
}
