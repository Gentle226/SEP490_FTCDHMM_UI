'use client';

import { FileEdit } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Skeleton } from '@/base/components/ui/skeleton';
import { RecipeForm } from '@/modules/recipes/components/recipe-form';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { DraftDetailsResponse } from '@/modules/recipes/types';

export default function EditDraftPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;
  const [draft, setDraft] = useState<DraftDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDraft = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getDraftById(draftId);
      setDraft(data);
    } catch (error) {
      console.error('Failed to load draft:', error);
      toast.error('Không thể tải bản nháp');
      router.push('/drafts');
    } finally {
      setIsLoading(false);
    }
  }, [draftId, router]);

  useEffect(() => {
    if (!draftId) {
      router.push('/drafts');
      return;
    }

    loadDraft();
  }, [draftId, router, loadDraft]);

  if (isLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="mx-auto w-[80%] space-y-6 py-8">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!draft) {
    return null;
  }

  return (
    <DashboardLayout showHeader={true} hideCreateButton={true}>
      <div className="mx-auto w-[80%] pb-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
            <FileEdit className="h-7 w-7 text-[#99b94a]" />
          </div>
          <div className="flex-1 pt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">Chỉnh sửa bản nháp</h1>
            <p className="text-muted-foreground text-sm">
              Cập nhật bản nháp hoặc đăng công thức của bạn
            </p>
          </div>
        </div>

        <RecipeForm mode="draft-edit" draftId={draftId} initialDraft={draft} />
      </div>
    </DashboardLayout>
  );
}
