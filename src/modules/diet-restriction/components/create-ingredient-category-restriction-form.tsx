'use client';

import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  type IngredientCategory,
  ingredientCategoryManagementService,
} from '@/modules/ingredient-categories/services/ingredient-category-management.service';

import { useCreateIngredientCategoryRestriction } from '../hooks';
import { RestrictionType } from '../types';

interface CreateIngredientCategoryRestrictionFormProps {
  onSuccess?: () => void;
}

/**
 * Form component for creating ingredient category-level dietary restrictions
 */
export function CreateIngredientCategoryRestrictionForm({
  onSuccess,
}: CreateIngredientCategoryRestrictionFormProps) {
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [type, setType] = useState<RestrictionType>(RestrictionType.ALLERGY);
  const [notes, setNotes] = useState('');
  const [expiredAtUtc, setExpiredAtUtc] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { mutate: createRestriction, isPending } = useCreateIngredientCategoryRestriction();

  // Fetch categories on component mount and when search changes
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await ingredientCategoryManagementService.getCategories({
          keyword: searchQuery || undefined,
          pageSize: 20,
        });
        setCategories(response.items);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const debounceTimer = setTimeout(fetchCategories, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    const selectedCategoryData = categories.find((c) => c.id === selectedCategory);
    if (!selectedCategoryData) return;

    createRestriction(
      {
        ingredientCategoryId: selectedCategory,
        type: type,
        notes: notes || undefined,
        expiredAtUtc: expiredAtUtc || undefined,
      },
      {
        onSuccess: () => {
          setSelectedCategory('');
          setType(RestrictionType.ALLERGY);
          setNotes('');
          setExpiredAtUtc('');
          setSearchQuery('');
          onSuccess?.();
        },
      },
    );
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Danh mục thành phần</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCategoryData?.name || 'Chọn danh mục...'}
            </span>
            <ChevronDown
              size={18}
              className={`transform transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              <div className="border-b border-gray-100 p-2">
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto">
                {isLoadingCategories ? (
                  <div className="px-3 py-8 text-center">
                    <Loader2 size={20} className="inline animate-spin text-gray-400" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    Không tìm thấy danh mục
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelectCategory(category.id)}
                      className="w-full border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-100"
                    >
                      <p className="font-medium text-gray-900">{category.name}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restriction Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Loại hạn chế</label>
        <select
          aria-label="Loại hạn chế"
          value={type}
          onChange={(e) => setType(e.target.value as RestrictionType)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value={RestrictionType.ALLERGY}>Dị ứng</option>
          <option value={RestrictionType.DISLIKE}>Không thích</option>
          <option value={RestrictionType.TEMPORARYAVOID}>Tạm thời tránh</option>
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 255))}
          placeholder="Nhập ghi chú (không bắt buộc)..."
          maxLength={255}
          rows={3}
          className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500">{notes.length}/255 ký tự</p>
      </div>

      {/* Expiry Date (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ngày hết hạn (không bắt buộc)
        </label>
        <input
          type="datetime-local"
          aria-label="Ngày hết hạn"
          value={expiredAtUtc}
          onChange={(e) => setExpiredAtUtc(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500">Để trống nếu hạn chế này không có ngày hết hạn</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !selectedCategory}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? 'Đang lưu...' : 'Tạo hạn chế'}
      </button>
    </form>
  );
}
