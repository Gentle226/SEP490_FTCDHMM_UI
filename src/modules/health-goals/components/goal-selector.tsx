'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useCurrentHealthGoal, useHealthGoals, useMyCustomHealthGoals } from '../hooks';
import { CustomHealthGoalResponse, HealthGoalResponse } from '../types';
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';
import { CustomHealthGoalFormDialog } from './custom-health-goal-form-dialog';
import { GoalSelectionDialog } from './goal-selection-dialog';

export function GoalSelector() {
  const { data: healthGoals, isLoading: isLoadingLibrary } = useHealthGoals();
  const { data: customGoals, isLoading: isLoadingCustom } = useMyCustomHealthGoals();
  const { data: currentGoal } = useCurrentHealthGoal();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<
    HealthGoalResponse | CustomHealthGoalResponse | null
  >(null);
  const [selectedGoalType, setSelectedGoalType] = useState<'SYSTEM' | 'CUSTOM' | null>(null);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSelectGoal = (
    goal: HealthGoalResponse | CustomHealthGoalResponse,
    type: 'SYSTEM' | 'CUSTOM',
  ) => {
    // Don't allow selecting if this goal is already active
    if (isGoalActive(goal.id)) {
      return;
    }
    setSelectedGoal(goal);
    setSelectedGoalType(type);
    setIsSelectionDialogOpen(true);
  };

  const handleCloseSelectionDialog = () => {
    setSelectedGoal(null);
    setSelectedGoalType(null);
    setIsSelectionDialogOpen(false);
  };

  const isLoading = isLoadingLibrary || isLoadingCustom;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Check if a goal is selected
  const isGoalActive = (goalId: string | undefined) => {
    if (!goalId) return false;
    return currentGoal?.healthGoalId === goalId || currentGoal?.customHealthGoalId === goalId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Chọn Hoặc Tạo Mục Tiêu</h2>
        <p className="text-sm text-gray-600">
          Chọn từ thư viện được thiết lập sẵn hoặc tạo một mục tiêu riêng
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Create Custom Goal Card */}
        <Card
          className="cursor-pointer border-2 border-dashed border-[#99b94a] bg-gradient-to-br from-[#99b94a]/5 to-transparent transition-all hover:border-[#99b94a] hover:shadow-md"
          onClick={handleCreateClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-[#99b94a]/10 p-3">
              <Plus className="h-6 w-6 text-[#99b94a]" />
            </div>
            <h3 className="font-semibold text-gray-900">Tạo Mục Tiêu Tùy Chỉnh</h3>
            <p className="mt-1 text-xs text-gray-600">Thiết kế mục tiêu riêng của bạn</p>
          </CardContent>
        </Card>

        {/* Custom Goals */}
        {customGoals?.map((goal) => (
          <Card
            key={goal.id}
            className={`transition-all ${
              isGoalActive(goal.id)
                ? 'cursor-default border-2 border-[#99b94a] bg-[#99b94a]/5'
                : 'cursor-pointer border border-gray-200 hover:border-[#99b94a]/50 hover:shadow-lg'
            }`}
            onClick={() => handleSelectGoal(goal, 'CUSTOM')}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-2 text-sm font-semibold text-gray-900">
                  {goal.name}
                </CardTitle>
                {isGoalActive(goal.id) && (
                  <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#99b94a] px-2 py-1">
                    <Check className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">Đã chọn</span>
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-xs">
                {goal.description || 'Mục tiêu tùy chỉnh'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#99b94a]">Bấm vào để xem chi tiết</p>
                {goal.targets?.[0] && (
                  <div className="space-y-1">
                    <div className="rounded bg-[#99b94a]/10 px-2 py-1.5">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">
                          {getVietnameseNutrientName(goal.targets[0].name)}:
                        </span>{' '}
                        {formatNutrientTargetValue(goal.targets[0])}
                      </p>
                    </div>
                    {goal.targets.length > 1 && (
                      <p className="text-xs text-gray-500">
                        +{goal.targets.length - 1} chỉ số dinh dưỡng khác
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Admin Library Goals */}
        {healthGoals?.map((goal) => (
          <Card
            key={goal.id}
            className={`transition-all ${
              isGoalActive(goal.id)
                ? 'cursor-default border-2 border-[#99b94a] bg-[#99b94a]/5'
                : 'cursor-pointer border border-gray-200 hover:border-[#99b94a]/50 hover:shadow-lg'
            }`}
            onClick={() => handleSelectGoal(goal, 'SYSTEM')}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-2 text-sm font-semibold text-gray-900">
                  {goal.name}
                </CardTitle>
                {isGoalActive(goal.id) && (
                  <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#99b94a] px-2 py-1">
                    <Check className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">Đã chọn</span>
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2 text-xs">
                {goal.description || 'Mục tiêu được thiết lập sẵn'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#99b94a]">Bấm vào để xem chi tiết</p>
                {goal.targets?.[0] && (
                  <div className="space-y-1">
                    <div className="rounded bg-[#99b94a]/10 px-2 py-1.5">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">
                          {getVietnameseNutrientName(goal.targets[0].name)}:
                        </span>{' '}
                        {formatNutrientTargetValue(goal.targets[0])}
                      </p>
                    </div>
                    {goal.targets.length > 1 && (
                      <p className="text-xs text-gray-500">
                        +{goal.targets.length - 1} chỉ số dinh dưỡng khác
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <CustomHealthGoalFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {selectedGoal && selectedGoalType && (
        <GoalSelectionDialog
          goal={selectedGoal}
          type={selectedGoalType}
          open={isSelectionDialogOpen}
          onOpenChange={handleCloseSelectionDialog}
        />
      )}
    </div>
  );
}
