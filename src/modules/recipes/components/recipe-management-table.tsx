'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  Lock,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/base/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import { Skeleton } from '@/base/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';

import { usePendingRecipes, useRecipeManagement } from '../hooks/use-recipe-management';
import { RecipeManagementResponse } from '../types';
import { ReasonDialogAction, ReasonInputDialog } from './reason-input-dialog';

interface RecipeManagementTableProps {
  title?: React.ReactNode;
}

export function RecipeManagementTable({ title }: RecipeManagementTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = usePendingRecipes({
    pageNumber: page,
    pageSize,
    isManagement: true, // Fetch all pending recipes for management view
  });

  const {
    lockRecipe,
    approveRecipe,
    rejectRecipe,
    deleteRecipe,
    isLoading: isActionLoading,
  } = useRecipeManagement();

  // Dialog states
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reasonDialogAction, setReasonDialogAction] = useState<ReasonDialogAction>('lock');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeManagementResponse | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const handleOpenReasonDialog = (recipe: RecipeManagementResponse, action: ReasonDialogAction) => {
    setSelectedRecipe(recipe);
    setReasonDialogAction(action);
    setReasonDialogOpen(true);
  };

  const handleOpenApproveDialog = (recipe: RecipeManagementResponse) => {
    setSelectedRecipe(recipe);
    setApproveDialogOpen(true);
  };

  const handleReasonConfirm = async (reason: string) => {
    if (!selectedRecipe) return;

    switch (reasonDialogAction) {
      case 'lock':
        await lockRecipe(selectedRecipe.id, reason);
        break;
      case 'reject':
        await rejectRecipe(selectedRecipe.id, reason);
        break;
      case 'delete':
        await deleteRecipe(selectedRecipe.id, reason);
        break;
    }
  };

  const handleApproveConfirm = async () => {
    if (!selectedRecipe) return;
    await approveRecipe(selectedRecipe.id);
    setApproveDialogOpen(false);
    setSelectedRecipe(null);
  };

  const getDifficultyBadge = (difficulty: { name: string; value: number }) => {
    const colorMap: Record<string, string> = {
      Easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
      <Badge className={colorMap[difficulty.name] || 'bg-gray-100 text-gray-800'} variant="outline">
        {difficulty.name === 'Easy' ? 'Dễ' : difficulty.name === 'Medium' ? 'Trung bình' : 'Khó'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <div className="mb-4">{title}</div>}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Công thức</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Độ khó</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khẩu phần</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-muted-foreground">
          Không thể tải danh sách công thức. Vui lòng thử lại.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Tải lại
        </Button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        {title && <div className="mb-4 w-full">{title}</div>}
        <div className="text-center">
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium">Không có công thức chờ duyệt</h3>
          <p className="text-muted-foreground mt-2">Tất cả công thức đã được xử lý.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <div className="mb-4">{title}</div>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Công thức</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Khẩu phần</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted relative h-12 w-12 overflow-hidden rounded-md">
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex max-w-[200px] min-w-0 flex-col">
                      <span className="line-clamp-1 font-medium">{recipe.name}</span>
                      {recipe.description && (
                        <span className="text-muted-foreground line-clamp-1 truncate text-sm">
                          {recipe.description}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipe.author.avatarUrl} />
                      <AvatarFallback>
                        {recipe.author.firstName?.[0]}
                        {recipe.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {recipe.author.firstName} {recipe.author.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getDifficultyBadge(recipe.difficulty)}</TableCell>
                <TableCell>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {recipe.cookTime} phút
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4" />
                    {recipe.ration}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatDate(recipe.createdAtUtc)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/recipe/${recipe.id}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Xem chi tiết
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleOpenApproveDialog(recipe)}
                            disabled={isActionLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Duyệt
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                            onClick={() => handleOpenReasonDialog(recipe, 'reject')}
                            disabled={isActionLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Từ chối
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                            onClick={() => handleOpenReasonDialog(recipe, 'lock')}
                            disabled={isActionLoading}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Khóa
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleOpenReasonDialog(recipe, 'delete')}
                            disabled={isActionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Xóa
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, data.totalCount)}{' '}
            trong tổng số {data.totalCount} công thức
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reason Input Dialog */}
      <ReasonInputDialog
        open={reasonDialogOpen}
        onOpenChange={setReasonDialogOpen}
        action={reasonDialogAction}
        recipeName={selectedRecipe?.name || ''}
        onConfirm={handleReasonConfirm}
      />

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt công thức</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt công thức{' '}
              <span className="text-foreground font-medium">{selectedRecipe?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
