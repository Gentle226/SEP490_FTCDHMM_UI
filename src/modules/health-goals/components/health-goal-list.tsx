'use client';

import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
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

interface HealthGoalListProps {
  showHeader?: boolean;
}

export function HealthGoalList({ showHeader = true }: HealthGoalListProps) {
  const { data: healthGoals, isLoading } = useHealthGoals();
  const deleteHealthGoal = useDeleteHealthGoal();
  const [editingGoal, setEditingGoal] = useState<HealthGoalResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteHealthGoal.mutateAsync(id);
      toast.success('Xóa mục tiêu sức khỏe thành công');
    } catch (_error) {
      toast.error('Không thể xóa mục tiêu sức khỏe');
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quản Lý Mục Tiêu Sức Khỏe</h2>
            <p className="text-muted-foreground">
              Quản lý các mục tiêu sức khỏe toàn hệ thống cho người dùng
            </p>
          </div>
          <Button onClick={handleCreateNew} className="bg-[#99b94a] hover:bg-[#7a8f3a]">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Mục Tiêu
          </Button>
        </div>
      )}

      {!showHeader && (
        <div className="flex justify-end">
          <Button onClick={handleCreateNew} className="bg-[#99b94a] hover:bg-[#7a8f3a]">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Mục Tiêu
          </Button>
        </div>
      )}

      {healthGoals?.length === 0 ? (
        <Card className="border-2 border-dashed border-[#99b94a]/30 bg-[#99b94a]/5">
          <CardHeader className="items-center py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#99b94a]/10">
              <Plus className="h-8 w-8 text-[#99b94a]" />
            </div>
            <CardTitle className="text-lg">Chưa có mục tiêu nào</CardTitle>
            <CardDescription className="text-center">
              Bắt đầu tạo mục tiêu sức khỏe đầu tiên cho hệ thống
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {healthGoals?.map((goal) => (
            <Card
              key={goal.id}
              className="group border-border/50 overflow-hidden border transition-all duration-300 hover:border-[#99b94a]/50 hover:shadow-lg hover:shadow-[#99b94a]/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1 pr-2">
                    <CardTitle className="text-lg font-semibold transition-colors group-hover:text-[#99b94a]">
                      {goal.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {goal.description || 'Chưa có mô tả'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
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
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-xs font-medium tracking-wide text-[#99b94a] uppercase">
                    Chỉ số Dinh Dưỡng (Trên 100g):
                  </p>
                  <div className="bg-muted/50 space-y-2 rounded-lg p-3">
                    {goal.targets.map((target) => (
                      <div key={target.nutrientId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {getVietnameseNutrientName(target.name)}
                        </span>
                        <span className="font-medium text-[#99b94a]">
                          {formatNutrientTargetValue(target)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HealthGoalFormDialog goal={editingGoal} isOpen={isFormOpen} onClose={handleCloseForm} />
    </div>
  );
}
