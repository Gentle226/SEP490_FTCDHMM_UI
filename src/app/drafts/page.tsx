'use client';

import { Clock, FileEdit, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Badge } from '@/base/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { DraftRecipeResponse } from '@/modules/recipes/types';

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftRecipeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getDraftList();
      setDrafts(data || []);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast.error('Không thể tải danh sách bản nháp');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const map: { [key: string]: string } = {
      Easy: 'Dễ',
      Medium: 'Trung bình',
      Hard: 'Khó',
      EASY: 'Dễ',
      MEDIUM: 'Trung bình',
      HARD: 'Khó',
    };
    return map[difficulty] || difficulty;
  };

  const getDifficultyVariant = (
    difficulty: string,
  ): 'default' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' => {
    const normalized = difficulty.toLowerCase();
    if (normalized === 'easy') return 'success';
    if (normalized === 'medium') return 'warning';
    if (normalized === 'hard') return 'danger';
    return 'default';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 px-3 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10 sm:h-14 sm:w-14">
              <FileEdit className="h-6 w-6 text-[#99b94a] sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1 pt-0.5">
              <h1 className="text-xl font-bold tracking-tight text-[#99b94a] sm:text-2xl">
                Bản nháp công thức
                {drafts.length > 0 && (
                  <span className="text-muted-foreground ml-2 text-base font-normal sm:text-lg">
                    ({drafts.length})
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Quản lý các công thức đang soạn thảo của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {drafts.length === 0 ? (
          <Card className="border-2 border-dashed border-[#99b94a]/30 bg-[#99b94a]/5">
            <CardHeader className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#99b94a]/10 sm:mb-4 sm:h-20 sm:w-20">
                <FileEdit className="h-8 w-8 text-[#99b94a] sm:h-10 sm:w-10" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Chưa có bản nháp nào</CardTitle>
              <CardDescription className="text-muted-foreground max-w-sm text-center text-sm">
                Bắt đầu tạo công thức mới và lưu bản nháp để tiếp tục chỉnh sửa sau
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {drafts.map((draft) => (
              <Card
                key={draft.id}
                className="group border-border/50 bg-card cursor-pointer overflow-hidden border transition-all duration-300 hover:border-[#99b94a]/50 hover:shadow-xl hover:shadow-[#99b94a]/10"
                onClick={() => router.push(`/drafts/${draft.id}/edit`)}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden sm:h-44">
                  {draft.imageUrl ? (
                    <Image
                      src={draft.imageUrl}
                      alt={draft.name || 'Draft recipe'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Image
                      src="/outline-illustration-card.png"
                      alt="Draft recipe placeholder"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Edit indicator */}
                  <div className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <FileEdit className="h-4 w-4 text-[#99b94a]" />
                  </div>

                  {/* Difficulty badge */}
                  <Badge
                    variant={getDifficultyVariant(draft.difficulty)}
                    className="absolute top-3 left-3"
                  >
                    {getDifficultyLabel(draft.difficulty)}
                  </Badge>
                </div>

                {/* Content */}
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base font-semibold transition-colors group-hover:text-[#99b94a]">
                    {draft.name || 'Chưa đặt tên'}
                  </CardTitle>
                  {draft.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {draft.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="text-muted-foreground flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#99b94a]" />
                      <span>{draft.cookTime || 0} phút</span>
                    </div>
                    {draft.ration && (
                      <>
                        <span className="text-border">•</span>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-[#99b94a]" />
                          <span>{draft.ration} phần</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
