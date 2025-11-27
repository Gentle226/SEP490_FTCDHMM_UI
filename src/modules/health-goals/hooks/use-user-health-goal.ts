import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { userHealthGoalService } from '../services';

/**
 * Hook to fetch the user's current active health goal
 */
export const useCurrentHealthGoal = () => {
  return useQuery({
    queryKey: ['current-health-goal'],
    queryFn: () => userHealthGoalService.getCurrentGoal(),
  });
};

/**
 * Hook to set a health goal as the user's current active goal with expiration date
 */
export const useSetHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      goalId,
      type,
      expiredAtUtc,
    }: {
      goalId: string;
      type: 'SYSTEM' | 'CUSTOM';
      expiredAtUtc?: string;
    }) => userHealthGoalService.setGoal(goalId, type, expiredAtUtc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-health-goal'] });
    },
  });
};

/**
 * Hook to remove a health goal from the user's current goals
 */
export const useRemoveHealthGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userHealthGoalService.removeFromCurrent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-health-goal'] });
    },
  });
};
