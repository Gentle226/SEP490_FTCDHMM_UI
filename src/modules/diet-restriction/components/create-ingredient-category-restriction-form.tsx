'use client';

import { Calendar as CalendarIcon, ChevronDown, Clock, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Calendar } from '@/base/components/ui/calendar';
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: createRestriction, isPending } = useCreateIngredientCategoryRestriction();

  // Helper function to parse datetime-local string to Date object
  const parseLocalDateTime = (value: string): Date => {
    if (!value) return new Date();
    // Parse YYYY-MM-DDTHH:mm as local time
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  // Helper function to format Date object to datetime-local string
  const formatLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle click outside to close calendar
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside the calendar popover and button
      if (!target.closest('[data-calendar-popover]') && !target.closest('[data-calendar-button]')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    if (showCategoryDropdown || showTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown, showTypeDropdown]);

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
    setShowCategoryDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert('Vui lòng chọn thể loại');
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
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Thể loại thành phần <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            aria-label="Chọn thể loại thành phần"
            className="focus:ring-opacity-30 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          >
            <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCategoryData?.name || 'Chọn thể loại...'}
            </span>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 text-[#99b94a] transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-xl">
              {/* Search input */}
              <input
                type="text"
                placeholder="Tìm thể loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-opacity-30 w-full border-b border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 placeholder-gray-500 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
                autoFocus
              />

              {/* Dropdown items */}
              <div className="max-h-56 overflow-y-auto">
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-[#99b94a]" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy thể loại
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelectCategory(category.id)}
                      className="flex w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0f7e8]"
                    >
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restriction Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Loại hạn chế <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            aria-label="Chọn loại hạn chế"
            className="focus:ring-opacity-30 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          >
            <span className="text-gray-900">
              {type === RestrictionType.ALLERGY && 'Dị ứng'}
              {type === RestrictionType.DISLIKE && 'Không thích'}
              {type === RestrictionType.TEMPORARYAVOID && 'Tạm tránh'}
            </span>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 text-[#99b94a] transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setType(RestrictionType.ALLERGY);
                  setShowTypeDropdown(false);
                }}
                className="flex w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0f7e8]"
              >
                <span className="font-semibold text-gray-900">Dị ứng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType(RestrictionType.DISLIKE);
                  setShowTypeDropdown(false);
                }}
                className="flex w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0f7e8]"
              >
                <span className="font-semibold text-gray-900">Không thích</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType(RestrictionType.TEMPORARYAVOID);
                  setShowTypeDropdown(false);
                }}
                className="flex w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0f7e8]"
              >
                <span className="font-semibold text-gray-900">Tạm tránh</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">Ghi chú (tuỳ chọn)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 255))}
          maxLength={255}
          placeholder="Ví dụ: Dị ứng với động vật có vỏ, tránh sữa bò..."
          className="focus:ring-opacity-30 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder-gray-500 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          rows={3}
        />
        <p className="mt-2 text-xs text-gray-600">{notes.length}/255 ký tự</p>
      </div>

      {/* Expiry Date - Only shown for TEMPORARYAVOID (input + calendar popover) */}
      {type === RestrictionType.TEMPORARYAVOID && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Ngày hết hạn <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              type="datetime-local"
              title="Chọn ngày hết hạn"
              value={expiredAtUtc}
              onChange={(e) => setExpiredAtUtc(e.target.value)}
              required={type === RestrictionType.TEMPORARYAVOID}
              className="focus:ring-opacity-30 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
            />

            <button
              type="button"
              aria-label="Mở lịch"
              data-calendar-button
              onClick={() => setShowCalendar((s) => !s)}
              className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 hover:bg-gray-50"
            >
              <CalendarIcon className="h-4 w-4 text-[#99b94a]" />
            </button>

            {showCalendar && (
              <div
                className="absolute right-0 bottom-full left-0 z-20 mb-2 flex gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
                data-calendar-popover
              >
                {/* Calendar */}
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={expiredAtUtc ? parseLocalDateTime(expiredAtUtc) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const prev = parseLocalDateTime(expiredAtUtc);
                      const d = new Date(date);
                      d.setHours(prev.getHours(), prev.getMinutes());
                      setExpiredAtUtc(formatLocalDateTime(d));
                    }}
                    disabled={(date) => date < new Date()}
                    buttonVariant="ghost"
                  />
                </div>

                {/* Time Picker */}
                <div className="flex flex-col gap-2 border-l border-gray-200 py-2 pl-3">
                  {/* Hour */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-xs font-semibold text-gray-600">Giờ</label>
                    <div className="scrollbar-hide flex h-32 w-12 flex-col overflow-y-auto rounded border border-gray-300 bg-gray-50">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const hour = i;
                        const currentHour = expiredAtUtc
                          ? parseLocalDateTime(expiredAtUtc).getHours()
                          : new Date().getHours();
                        return (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => {
                              const d = parseLocalDateTime(expiredAtUtc);
                              d.setHours(hour, d.getMinutes());
                              setExpiredAtUtc(formatLocalDateTime(d));
                            }}
                            className={`flex-shrink-0 px-2 py-1 text-sm font-medium transition-colors ${
                              currentHour === hour
                                ? 'bg-[#99b94a] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {String(hour).padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minute */}
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-xs font-semibold text-gray-600">Phút</label>
                    <div className="scrollbar-hide flex h-32 w-12 flex-col overflow-y-auto rounded border border-gray-300 bg-gray-50">
                      {Array.from({ length: 60 }).map((_, i) => {
                        const minute = i;
                        const currentMinute = expiredAtUtc
                          ? parseLocalDateTime(expiredAtUtc).getMinutes()
                          : new Date().getMinutes();
                        return (
                          <button
                            key={minute}
                            type="button"
                            onClick={() => {
                              const d = parseLocalDateTime(expiredAtUtc);
                              d.setMinutes(minute);
                              setExpiredAtUtc(formatLocalDateTime(d));
                            }}
                            className={`flex-shrink-0 px-1 py-1 text-sm font-medium transition-colors ${
                              currentMinute === minute
                                ? 'bg-[#99b94a] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {String(minute).padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-2 flex items-start gap-2 text-xs text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Chọn ngày bằng lịch hoặc nhập trực tiếp giờ/phút</span>
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isLoadingCategories}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#99b94a] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#88a43a] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? 'Đang thêm...' : 'Thêm hạn chế'}
      </button>
    </form>
  );
}
