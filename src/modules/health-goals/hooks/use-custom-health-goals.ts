import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customHealthGoalService } from '../services';
import { CreateCustomHealthGoalRequest, UpdateCustomHealthGoalRequest } from '../types';

/**
 * Hook to fetch all custom health goals for the current user
 */
export const useMyCustomHealthGoals = () => {
  return useQuery({
    queryKey: ['custom-health-goals'],
    queryFn: () => customHealthGoalService.getMyGoals(),
  });
};

/**
 * Hook to fetch a specific custom health goal by ID
 */
export const useCustomHealthGoal = (id: string) => {
  return useQuery({
    queryKey: ['custom-health-goal', id],
    queryFn: () => customHealthGoalService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new custom health goal
 */
export const useCreateCustomHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomHealthGoalRequest) => customHealthGoalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-health-goals'] });
    },
  });
};

/**
 * Hook to update an existing custom health goal
 */
export const useUpdateCustomHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomHealthGoalRequest }) =>
      customHealthGoalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-health-goals'] });
    },
  });
};

/**
 * Hook to delete a custom health goal
 */
export const useDeleteCustomHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customHealthGoalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-health-goals'] });
    },
  });
};

/**
 * Hook to activate a custom health goal
 */
export const useActivateCustomHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customHealthGoalService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-health-goals'] });
    },
  });
};

/**
 * Hook to de-active a custom health goal
 */
export const useDeactiveCustomHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customHealthGoalService.deactive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-health-goals'] });
    },
  });
};
