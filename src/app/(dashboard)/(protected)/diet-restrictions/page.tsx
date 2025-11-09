'use client';

import { useState } from 'react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#99b94a]">Quản lý thành phần bị hạn chế</h1>
          <p className="text-gray-600">
            Quản lý các hạn chế thành phần của bạn, bao gồm dị ứng, sở thích và các hạn chế tạm
            thời.
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="rounded-md bg-[#99b94a] px-4 py-2 font-medium text-white transition-colors hover:bg-[#7a8c36]"
          >
            + Thêm hạn chế
          </button>
        </div>

        {/* Restrictions List */}
        <div className="rounded-lg bg-white shadow">
          <DietRestrictionsList key={refreshKey} />
        </div>
      </div>

      {/* Create Restriction Dialog */}
      <CreateRestrictionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
