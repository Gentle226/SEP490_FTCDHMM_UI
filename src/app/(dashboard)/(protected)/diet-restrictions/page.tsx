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
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <WheatOffIcon className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản lý thành phần bị hạn chế
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
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
            className="inline-flex items-center gap-2 rounded-lg bg-[#99b94a] px-6 py-2 font-medium text-white shadow-md transition-all hover:bg-[#88a43a] hover:shadow-lg active:scale-95"
            aria-label="Thêm hạn chế"
          >
            <span className="text-lg">+</span>
            Thêm hạn chế
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
