import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { healthGoalService } from '../services';
import { CreateHealthGoalRequest, UpdateHealthGoalRequest } from '../types';

/**
 * Hook to fetch all system health goals
 */
export const useHealthGoals = () => {
  return useQuery({
    queryKey: ['health-goals'],
    queryFn: () => healthGoalService.getAll(),
  });
};

/**
 * Hook to fetch a specific health goal by ID
 */
export const useHealthGoal = (id: string) => {
  return useQuery({
    queryKey: ['health-goal', id],
    queryFn: () => healthGoalService.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new health goal
 */
export const useCreateHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHealthGoalRequest) => healthGoalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-goals'] });
    },
  });
};

/**
 * Hook to update an existing health goal
 */
export const useUpdateHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHealthGoalRequest }) =>
      healthGoalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-goals'] });
    },
  });
};

/**
 * Hook to delete a health goal
 */
export const useDeleteHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => healthGoalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-goals'] });
    },
  });
};
