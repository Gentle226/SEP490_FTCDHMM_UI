'use client';

import { Pencil, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useDeleteCustomHealthGoal, useMyCustomHealthGoals } from '../hooks';
import { CustomHealthGoalResponse } from '../types';
import { CustomHealthGoalFormDialog } from './custom-health-goal-form-dialog';

export function CustomHealthGoalEditor() {
  const { data: customGoals, isLoading } = useMyCustomHealthGoals();
  const deleteGoal = useDeleteCustomHealthGoal();
  const [editingGoal, setEditingGoal] = useState<CustomHealthGoalResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentGoal = customGoals && customGoals.length > 0 ? customGoals[0] : null;

  const handleDelete = async () => {
    if (!currentGoal) return;
    try {
      await deleteGoal.mutateAsync(currentGoal.id);
      toast.success('Mục tiêu sức khỏe tùy chỉnh đã được xóa thành công');
    } catch (_error) {
      toast.error('Lỗi khi xóa mục tiêu sức khỏe');
    }
  };

  const handleEdit = () => {
    if (!currentGoal) return;
    setEditingGoal(currentGoal);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingGoal(null);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mục Tiêu Tùy Chỉnh</h2>
          <p className="text-muted-foreground text-sm">
            {currentGoal
              ? 'Bạn có một mục tiêu sức khỏe tùy chỉnh. Hãy chỉnh sửa hoặc xóa nó để tạo một mục tiêu mới.'
              : 'Bạn chưa tạo bất kỳ mục tiêu sức khỏe tùy chỉnh nào. Nhấp vào "Tạo Mục Tiêu Tùy Chỉnh" để bắt đầu.'}
          </p>
        </div>
      </div>

      {!currentGoal ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-6 text-center">
              Tạo một mục tiêu sức khỏe tùy chỉnh phù hợp với nhu cầu của bạn
            </p>
            <Button onClick={handleCreateNew} className="bg-[#99b94a] hover:bg-[#7a8f3a]">
              Tạo Mục Tiêu Tùy Chỉnh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-slate-950">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-lg text-[#99b94a]">{currentGoal.name}</CardTitle>
                <CardDescription className="line-clamp-2 pt-1">
                  {currentGoal.description || 'Không có mô tả'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleEdit}
                  title="Chỉnh sửa mục tiêu tùy chỉnh"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleDelete}
                  title="Xóa mục tiêu tùy chỉnh"
                  disabled={deleteGoal.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <p className="mb-3 text-sm font-medium">Chỉ Số Dinh Dưỡng (Trên 100g):</p>
              <div className="space-y-2">
                {currentGoal.targets.map((target) => (
                  <div
                    key={target.nutrientId}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span className="font-medium">{target.name}</span>
                    <span className="text-muted-foreground">
                      {target.minValue} - {target.maxValue} g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CustomHealthGoalFormDialog
        goal={editingGoal}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
