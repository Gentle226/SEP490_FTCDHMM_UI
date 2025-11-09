'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { useDeleteRestriction, useGetUserDietRestrictions } from '../hooks';
import { UserDietRestrictionResponse } from '../types';
import { RestrictionBadge } from './restriction-badge';

interface DietRestrictionsListProps {
  restrictions?: UserDietRestrictionResponse[];
  isLoading?: boolean;
  onDeleteSuccess?: () => void;
}

/**
 * Component to display list of dietary restrictions
 */
export function DietRestrictionsList({
  restrictions: externalRestrictions,
  isLoading: externalIsLoading = false,
  onDeleteSuccess,
}: DietRestrictionsListProps) {
  const [deleteRestrictionId, setDeleteRestrictionId] = useState<string | null>(null);
  const { mutate: deleteRestriction, isPending: isDeleting } = useDeleteRestriction();

  // Fetch restrictions if not provided externally
  const { data: fetchedRestrictions, isLoading: isFetching } = useGetUserDietRestrictions();

  const restrictions = externalRestrictions || fetchedRestrictions || [];
  const isLoading = externalIsLoading || isFetching;

  const handleDelete = (id: string) => {
    if (deleteRestrictionId === id) {
      deleteRestriction(id, {
        onSuccess: () => {
          setDeleteRestrictionId(null);
          onDeleteSuccess?.();
        },
      });
    } else {
      setDeleteRestrictionId(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (!restrictions || restrictions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
        <p className="text-gray-500">Chưa có hạn chế nào được thêm</p>
        <p className="text-sm text-gray-400">Thêm hạn chế để quản lý chế độ ăn của bạn</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {restrictions.map((restriction) => (
        <div
          key={restriction.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-gray-900">
                  {restriction.ingredientName || restriction.ingredientCategoryName || 'N/A'}
                </p>
                {restriction.notes && <p className="text-sm text-gray-500">{restriction.notes}</p>}
                {restriction.expiredAtUtc && (
                  <p className="text-xs text-gray-400">
                    Hết hạn: {new Date(restriction.expiredAtUtc).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RestrictionBadge type={restriction.type} />
            <button
              type="button"
              onClick={() => handleDelete(restriction.id)}
              disabled={isDeleting}
              className={`rounded-md p-2 transition-colors ${
                deleteRestrictionId === restriction.id
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              } disabled:opacity-50`}
              title={deleteRestrictionId === restriction.id ? 'Xác nhận xóa' : 'Xóa'}
              aria-label="Xóa hạn chế"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
