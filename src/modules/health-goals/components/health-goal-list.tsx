'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

import { useDeleteHealthGoal, useHealthGoals } from '../hooks';
import { HealthGoalResponse } from '../types';
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';
import { HealthGoalFormDialog } from './health-goal-form-dialog';

export function HealthGoalList() {
  const { data: healthGoals, isLoading } = useHealthGoals();
  const deleteHealthGoal = useDeleteHealthGoal();
  const [editingGoal, setEditingGoal] = useState<HealthGoalResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteHealthGoal.mutateAsync(id);
      toast.success('Health goal deleted successfully');
    } catch (_error) {
      toast.error('Failed to delete health goal');
    }
  };

  const handleEdit = (goal: HealthGoalResponse) => {
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
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản Lý Mục Tiêu Sức Khỏe</h2>
          <p className="text-muted-foreground">
            Quản lý các mục tiêu sức khỏe toàn hệ thống cho người dùng
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-[#99b94a] hover:bg-[#7a8f3a]">
          Tạo Mục Tiêu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {healthGoals?.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {goal.description || 'No description'}
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
                      Chỉnh sửa
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
                <p className="text-sm font-medium">Chỉ số Dinh Dưỡng (Trên 100g):</p>
                <div className="space-y-1">
                  {goal.targets.map((target) => (
                    <div key={target.nutrientId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {getVietnameseNutrientName(target.name)}
                      </span>
                      <span className="font-medium">{formatNutrientTargetValue(target)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <HealthGoalFormDialog goal={editingGoal} isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>
  );
}
