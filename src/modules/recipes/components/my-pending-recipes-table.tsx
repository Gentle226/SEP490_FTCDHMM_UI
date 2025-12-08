'use client';

import { ChevronLeft, ChevronRight, Edit, Eye, FileQuestion } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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

import { usePendingRecipes } from '../hooks/use-recipe-management';

interface MyPendingRecipesTableProps {
  title?: React.ReactNode;
}

export function MyPendingRecipesTable({ title }: MyPendingRecipesTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = usePendingRecipes({
    pageNumber: page,
    pageSize,
    isManagement: false, // Fetch only user's own pending recipes
  });

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <div className="mb-4">{title}</div>}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Công thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Lý do</TableHead>
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
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-8 w-20" />
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
          <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">Không có công thức chờ duyệt</h3>
          <p className="text-muted-foreground mt-2">
            Bạn không có công thức nào đang chờ được duyệt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <div className="mb-4">{title}</div>}

      {/* Info banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Lưu ý:</strong> Các công thức dưới đây được báo cáo vi phạm hoặc đã bị khóa bởi
          quản trị viên. Vui lòng xem xét và chỉnh sửa công thức của bạn để được duyệt lại.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[450px] pl-5">Công thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead className="pr-10 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>
                  <div className="flex items-center gap-3 pl-3">
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
                    <div className="flex max-w-[350px] min-w-0 flex-col">
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
                  {recipe.status.value === 'LOCKED' ? (
                    <Badge
                      variant="outline"
                      className="mt-1 w-fit border-red-200 bg-red-50 text-xs text-red-700"
                    >
                      Bị khóa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 w-fit text-xs text-yellow-600">
                      Chờ duyệt
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-muted-foreground max-w-xs text-sm">
                    {recipe.reason ? (
                      <p className="line-clamp-2">{recipe.reason}</p>
                    ) : (
                      <span className="italic">Không có lý do</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 pr-7">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/recipe/${recipe.id}`}>
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
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/recipe/${recipe.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Chỉnh sửa
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
    </div>
  );
}
