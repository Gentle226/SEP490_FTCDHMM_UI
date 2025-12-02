'use client';

import { WheatOffIcon } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import {
  CreateRestrictionDialog,
  DietRestrictionsList,
} from '@/modules/diet-restriction/components';

/**
 * Main page for managing user's dietary restrictions
 */
export default function DietRestrictionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Increment key to trigger refresh of list component
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 px-2 sm:space-y-6 sm:px-4">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10 sm:h-14 sm:w-14">
              <WheatOffIcon className="h-5 w-5 text-[#99b94a] sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold tracking-tight text-[#99b94a] sm:text-2xl">
                Quản lý thành phần bị hạn chế
              </h1>
              <p className="text-muted-foreground mt-1 hidden text-sm sm:block">
                Quản lý các hạn chế thành phần của bạn, bao gồm dị ứng, sở thích và các hạn chế tạm
                thời.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#99b94a] px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-[#88a43a] hover:shadow-lg active:scale-95 sm:gap-2 sm:px-6 sm:text-base"
            aria-label="Thêm hạn chế"
          >
            <span className="text-base sm:text-lg">+</span>
            <span className="hidden sm:inline">Thêm hạn chế</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>

        {/* Restrictions List */}
        <div className="rounded-lg bg-white shadow-md">
          <DietRestrictionsList key={refreshKey} />
        </div>
      </div>

      {/* Create Restriction Dialog */}
      <CreateRestrictionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </DashboardLayout>
  );
}
