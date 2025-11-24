'use client';

import { MoreVertical, Pencil, Target, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Skeleton } from '@/base/components/ui/skeleton';

import { useDeleteCustomHealthGoal, useMyCustomHealthGoals } from '../hooks';
import { CustomHealthGoalResponse } from '../types';
import { CustomHealthGoalFormDialog } from './custom-health-goal-form-dialog';

export function CustomHealthGoalList() {
  const { data: customGoals, isLoading } = useMyCustomHealthGoals();
  const deleteGoal = useDeleteCustomHealthGoal();
  const [editingGoal, setEditingGoal] = useState<CustomHealthGoalResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast.success('Mục tiêu sức khỏe đã được xóa thành công');
    } catch (_error) {
      toast.error('Lỗi khi xóa mục tiêu sức khỏe');
    }
  };

  const handleEdit = (goal: CustomHealthGoalResponse) => {
    setEditingGoal(goal);
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Tạo và quản lý các mục tiêu sức khỏe cá nhân hóa của bạn
        </p>
        <Button onClick={handleCreateNew} className="bg-[#99b94a] hover:bg-[#7a8f3a]">
          Tạo Mục Tiêu Tùy Chỉnh
        </Button>
      </div>

      {(!customGoals || customGoals.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-center">
              Bạn chưa tạo bất kỳ mục tiêu sức khỏe tùy chỉnh nào.
              <br />
              Nhấp vào &quot;Tạo Mục Tiêu Tùy Chỉnh&quot; để bắt đầu.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {customGoals?.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-lg text-[#99b94a]">{goal.name}</CardTitle>
                  <CardDescription className="line-clamp-2 pt-1">
                    {goal.description || 'Không có mô tả'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(goal)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh Sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#99b94a]">Chỉ Số Dinh Dưỡng (Trên 100g):</p>
                <div className="space-y-1">
                  {goal.targets.map((target) => (
                    <div key={target.nutrientId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{target.name}</span>
                      <span className="font-medium">
                        {target.minValue} - {target.maxValue} g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomHealthGoalFormDialog
        goal={editingGoal}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
