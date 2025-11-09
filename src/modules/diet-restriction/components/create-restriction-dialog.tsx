'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { CreateIngredientCategoryRestrictionForm } from './create-ingredient-category-restriction-form';
import { CreateIngredientRestrictionForm } from './create-ingredient-restriction-form';

interface CreateRestrictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type RestrictionTab = 'ingredient' | 'category';

/**
 * Dialog wrapper with tab switching between ingredient and category restriction forms
 */
export function CreateRestrictionDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateRestrictionDialogProps) {
  const [activeTab, setActiveTab] = useState<RestrictionTab>('ingredient');

  const handleSuccess = () => {
    onSuccess?.();
    // Reset tab to ingredient for next use
    setActiveTab('ingredient');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Tạo hạn chế thành phần</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('ingredient')}
              className={`border-b-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'ingredient'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Thành phần
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`border-b-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'category'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Danh mục
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'ingredient' && (
            <CreateIngredientRestrictionForm onSuccess={handleSuccess} />
          )}
          {activeTab === 'category' && (
            <CreateIngredientCategoryRestrictionForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
