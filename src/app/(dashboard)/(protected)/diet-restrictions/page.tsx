'use client';

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
      <div className="space-y-8 px-4">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-4xl font-bold text-[#99b94a]">Quản lý thành phần bị hạn chế</h1>
          <p className="text-gray-600">
            Quản lý các hạn chế thành phần của bạn, bao gồm dị ứng, sở thích và các hạn chế tạm
            thời.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#99b94a] px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-[#88a43a] hover:shadow-lg active:scale-95"
        >
          <span className="text-lg">+</span>
          Thêm hạn chế
        </button>

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
