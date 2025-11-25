'use client';

import { Calendar as CalendarIcon, ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Calendar } from '@/base/components/ui/calendar';
import {
  type IngredientListItem,
  ingredientPublicService,
} from '@/modules/ingredients/services/ingredient-public.service';

import { useCreateIngredientRestriction } from '../hooks';
import { RestrictionType } from '../types';

interface CreateIngredientRestrictionFormProps {
  onSuccess?: () => void;
}

/**
 * Form component for creating ingredient-level dietary restrictions
 */
export function CreateIngredientRestrictionForm({
  onSuccess,
}: CreateIngredientRestrictionFormProps) {
  const [ingredients, setIngredients] = useState<IngredientListItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [type, setType] = useState<RestrictionType>(RestrictionType.ALLERGY);
  const [notes, setNotes] = useState('');
  const [expiredAtUtc, setExpiredAtUtc] = useState('');
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const ingredientDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: createRestriction, isPending } = useCreateIngredientRestriction();

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
        ingredientDropdownRef.current &&
        !ingredientDropdownRef.current.contains(event.target as Node)
      ) {
        setShowIngredientDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    if (showIngredientDropdown || showTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showIngredientDropdown, showTypeDropdown]);

  // Fetch ingredients on component mount and when search changes
  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoadingIngredients(true);
      try {
        const response = await ingredientPublicService.getIngredients({
          search: searchQuery || undefined,
          pageSize: 20,
        });
        setIngredients(response.items);
      } catch (error) {
        console.error('Failed to fetch ingredients:', error);
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    const timeoutId = setTimeout(fetchIngredients, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectIngredient = (id: string) => {
    setSelectedIngredient(id);
    setShowIngredientDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient) {
      alert('Vui lòng chọn thực phẩm');
      return;
    }

    createRestriction(
      {
        ingredientId: selectedIngredient,
        type,
        notes: notes || undefined,
        expiredAtUtc: expiredAtUtc || undefined,
      },
      {
        onSuccess: () => {
          setSelectedIngredient('');
          setType(RestrictionType.ALLERGY);
          setNotes('');
          setExpiredAtUtc('');
          setSearchQuery('');
          onSuccess?.();
        },
      },
    );
  };

  const selectedIngredientName = ingredients.find((ing) => ing.id === selectedIngredient)?.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ingredient Selector */}
      <div>
        <label htmlFor="ingredient-search" className="mb-2 block text-sm font-medium text-gray-900">
          Chọn thực phẩm <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={ingredientDropdownRef}>
          <button
            type="button"
            onClick={() => setShowIngredientDropdown(!showIngredientDropdown)}
            className="focus:ring-opacity-30 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          >
            <span className={selectedIngredientName ? 'text-gray-900' : 'text-gray-500'}>
              {selectedIngredientName || 'Chọn thực phẩm...'}
            </span>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 text-[#99b94a] transition-transform ${showIngredientDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showIngredientDropdown && (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-xl">
              {/* Search input */}
              <input
                type="text"
                placeholder="Tìm kiếm thực phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-opacity-30 w-full border-b border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-900 placeholder-gray-500 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
                autoFocus
              />

              {/* Dropdown items */}
              <div className="max-h-56 overflow-y-auto">
                {isLoadingIngredients ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-[#99b94a]" />
                  </div>
                ) : ingredients.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy thực phẩm nào
                  </div>
                ) : (
                  ingredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => handleSelectIngredient(ingredient.id)}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#f0f7e8]"
                    >
                      {ingredient.imageUrl && (
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ingredient.imageUrl}
                            alt={ingredient.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{ingredient.name}</p>
                        {ingredient.categoryNames?.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {ingredient.categoryNames.map((c) => c.name).join(', ')}
                          </p>
                        )}
                      </div>
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

      {/* Expiry Date - Only shown for TEMPORARYAVOID (input + calendar popover) */}
      {type === RestrictionType.TEMPORARYAVOID && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Ngày hết hạn <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <input
              id="expiry"
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
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-900">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 255))}
          maxLength={255}
          placeholder="Ví dụ: Dị ứng với động vật có vỏ, tránh sữa bò..."
          className="focus:ring-opacity-30 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 placeholder-gray-500 transition-all hover:border-gray-400 focus:border-[#99b94a] focus:ring-2 focus:ring-[#99b94a] focus:outline-none"
          rows={3}
        />
        <p className="mt-2 text-xs text-gray-600">{notes.length}/255 ký tự</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isLoadingIngredients}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#99b94a] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#88a43a] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? 'Đang thêm...' : 'Thêm hạn chế'}
      </button>
    </form>
  );
}
