'use client';

import { Check, Library, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useCurrentHealthGoal, useDeleteCustomHealthGoal, useListGoal } from '../hooks';
import { UserHealthGoalResponse } from '../types';
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';
import { ConfirmDialog } from './confirm-dialog';
import { CustomHealthGoalFormDialog } from './custom-health-goal-form-dialog';
import { GoalSelectionDialog } from './goal-selection-dialog';

export function GoalSelector() {
  const { data: allGoals = [], isLoading } = useListGoal();
  const { data: currentGoal } = useCurrentHealthGoal();
  const deleteGoal = useDeleteCustomHealthGoal();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UserHealthGoalResponse | null>(null);
  const [selectedGoalType, setSelectedGoalType] = useState<'SYSTEM' | 'CUSTOM' | null>(null);
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    goalId: string;
    goalName: string;
  }>({ open: false, goalId: '', goalName: '' });

  // Separate system and custom goals from the combined list
  const customGoals = allGoals.filter((goal) => goal.customHealthGoalId);
  const healthGoals = allGoals.filter((goal) => goal.healthGoalId);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSelectGoal = (goal: UserHealthGoalResponse, type: 'SYSTEM' | 'CUSTOM') => {
    // Don't allow selecting if this goal is already active
    const goalId = goal.healthGoalId || goal.customHealthGoalId;
    if (isGoalActive(goalId)) {
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

  const handleDeleteClick = (e: React.MouseEvent, goalId: string, goalName: string) => {
    e.stopPropagation(); // Prevent card click from triggering
    setDeleteConfirmDialog({ open: true, goalId, goalName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteGoal.mutateAsync(deleteConfirmDialog.goalId);
      toast.success('Đã xóa mục tiêu tùy chỉnh thành công');
      setDeleteConfirmDialog({ open: false, goalId: '', goalName: '' });
    } catch {
      toast.error('Lỗi khi xóa mục tiêu tùy chỉnh');
    }
  };

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
    <div className="space-y-8">
      {/* Custom Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mục Tiêu Tùy Chỉnh</h3>
            <p className="text-xs text-gray-500">Mục tiêu do bạn tự tạo</p>
          </div>
          {customGoals.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
              {customGoals.length} mục tiêu
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Create Custom Goal Card */}
          <Card
            className="cursor-pointer border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-100"
            onClick={handleCreateClick}
          >
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Tạo Mục Tiêu Mới</h3>
              <p className="mt-1 text-xs text-gray-600">Thiết kế mục tiêu riêng của bạn</p>
            </CardContent>
          </Card>

          {/* Custom Goals */}
          {customGoals?.map((goal) => {
            const goalId = goal.customHealthGoalId;
            const isActive = isGoalActive(goalId);
            return (
              <Card
                key={goalId}
                className={`relative transition-all ${
                  isActive
                    ? 'cursor-default border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-100'
                    : 'cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100'
                }`}
                onClick={() => handleSelectGoal(goal, 'CUSTOM')}
              >
                {/* Custom badge */}
                <div className="absolute -top-2 left-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] text-white shadow-sm">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Tùy chỉnh
                  </Badge>
                </div>
                <CardHeader className="pt-5 pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {goal.name}
                    </CardTitle>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {isActive ? (
                        <div className="flex items-center gap-1 rounded-full bg-purple-500 px-2 py-1">
                          <Check className="h-3 w-3 text-white" />
                          <span className="text-xs font-bold text-white">Đã chọn</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          onClick={(e) => handleDeleteClick(e, goalId!, goal.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {goal.description || 'Mục tiêu tùy chỉnh'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-purple-600">Bấm vào để xem chi tiết</p>
                    {goal.targets?.[0] && (
                      <div className="space-y-1">
                        <div className="rounded bg-purple-100 px-2 py-1.5">
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
            );
          })}
        </div>
      </div>

      {/* System Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#99b94a] to-emerald-500">
            <Library className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Thư Viện Mục Tiêu</h3>
            <p className="text-xs text-gray-500">Mục tiêu được thiết lập sẵn bởi chuyên gia</p>
          </div>
          {healthGoals.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-[#99b94a]/20 text-[#7a9a2a]">
              {healthGoals.length} mục tiêu
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Admin Library Goals */}
          {healthGoals?.map((goal) => {
            const goalId = goal.healthGoalId;
            return (
              <Card
                key={goalId}
                className={`transition-all ${
                  isGoalActive(goalId)
                    ? 'cursor-default border-2 border-[#99b94a] bg-[#99b94a]/5 shadow-lg shadow-green-100'
                    : 'cursor-pointer border border-gray-200 hover:border-[#99b94a]/50 hover:shadow-lg hover:shadow-green-50'
                }`}
                onClick={() => handleSelectGoal(goal, 'SYSTEM')}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {goal.name}
                    </CardTitle>
                    {isGoalActive(goalId) && (
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
            );
          })}
        </div>
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

      <ConfirmDialog
        open={deleteConfirmDialog.open}
        onOpenChange={(open) => setDeleteConfirmDialog((prev) => ({ ...prev, open }))}
        title="Xóa Mục Tiêu Tùy Chỉnh"
        description={`Bạn có chắc chắn muốn xóa mục tiêu "${deleteConfirmDialog.goalName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        isLoading={deleteGoal.isPending}
        variant="destructive"
      />
    </div>
  );
}
