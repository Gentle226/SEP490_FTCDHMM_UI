'use client';

import {
  BeanOff,
  Carrot,
  ChevronDown,
  CircleOff,
  Clock,
  Salad,
  Search,
  ThumbsDown,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useDeleteRestriction, useGetUserDietRestrictions } from '../hooks';
import { UserDietRestrictionResponse } from '../types';
import { RestrictionBadge } from './restriction-badge';

interface DietRestrictionsListProps {
  restrictions?: UserDietRestrictionResponse[];
  isLoading?: boolean;
  onDeleteSuccess?: () => void;
}

/**
 * Component to display list of dietary restrictions with search and sort
 */
export function DietRestrictionsList({
  restrictions: externalRestrictions,
  isLoading: externalIsLoading = false,
  onDeleteSuccess,
}: DietRestrictionsListProps) {
  const [deleteRestrictionId, setDeleteRestrictionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { mutate: deleteRestriction, isPending: isDeleting } = useDeleteRestriction();

  // Fetch restrictions if not provided externally - now with server-side filtering and sorting
  const { data: fetchedRestrictions, isLoading: isFetching } = useGetUserDietRestrictions(
    externalRestrictions
      ? undefined
      : {
          keyword: debouncedSearchQuery || undefined,
          type: filterType || undefined,
          sortBy: sortBy || undefined,
        },
  );

  const restrictions = externalRestrictions || fetchedRestrictions || [];
  const isLoading = externalIsLoading || isFetching;

  // No need for client-side filtering anymore - backend handles it
  const displayedRestrictions = externalRestrictions
    ? // If external restrictions provided, still do client-side filtering
      restrictions.filter((restriction) => {
        const searchLower = searchQuery.toLowerCase();
        const name = (
          restriction.ingredientName ||
          restriction.ingredientCategoryName ||
          ''
        ).toLowerCase();

        const matchesSearch = name.includes(searchLower);
        const typeValue =
          typeof restriction.type === 'string'
            ? restriction.type
            : (restriction.type as { value: string }).value;
        const matchesType = !filterType || typeValue === filterType;

        return matchesSearch && matchesType;
      })
    : // If fetched from API, use as-is (already filtered and sorted by backend)
      restrictions;

  // Sort restrictions (only for external restrictions, backend handles sorting for fetched data)
  const sortedRestrictions = externalRestrictions
    ? [...displayedRestrictions].sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return (a.ingredientName || a.ingredientCategoryName || '').localeCompare(
              b.ingredientName || b.ingredientCategoryName || '',
            );
          case 'name_desc':
            return (b.ingredientName || b.ingredientCategoryName || '').localeCompare(
              a.ingredientName || a.ingredientCategoryName || '',
            );
          case 'type_asc': {
            const aTypeValue =
              typeof a.type === 'string' ? a.type : (a.type as { value: string }).value;
            const bTypeValue =
              typeof b.type === 'string' ? b.type : (b.type as { value: string }).value;
            return (aTypeValue || '').localeCompare(bTypeValue || '');
          }
          case 'type_desc': {
            const aTypeValue =
              typeof a.type === 'string' ? a.type : (a.type as { value: string }).value;
            const bTypeValue =
              typeof b.type === 'string' ? b.type : (b.type as { value: string }).value;
            return (bTypeValue || '').localeCompare(aTypeValue || '');
          }
          case 'expired_asc': {
            const aDate = a.expiredAtUtc
              ? new Date(
                  a.expiredAtUtc.endsWith('Z') ? a.expiredAtUtc : a.expiredAtUtc + 'Z',
                ).getTime()
              : Infinity;
            const bDate = b.expiredAtUtc
              ? new Date(
                  b.expiredAtUtc.endsWith('Z') ? b.expiredAtUtc : b.expiredAtUtc + 'Z',
                ).getTime()
              : Infinity;
            return aDate - bDate;
          }
          case 'expired_desc': {
            const aDate = a.expiredAtUtc
              ? new Date(
                  a.expiredAtUtc.endsWith('Z') ? a.expiredAtUtc : a.expiredAtUtc + 'Z',
                ).getTime()
              : -Infinity;
            const bDate = b.expiredAtUtc
              ? new Date(
                  b.expiredAtUtc.endsWith('Z') ? b.expiredAtUtc : b.expiredAtUtc + 'Z',
                ).getTime()
              : -Infinity;
            return bDate - aDate;
          }
          default:
            return 0;
        }
      })
    : displayedRestrictions;

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

  // Get type label with icon
  const getTypeLabel = (type: string | { value: string }) => {
    const typeValue = typeof type === 'string' ? type : type.value;
    switch (typeValue) {
      case 'ALLERGY':
        return { label: 'Dị ứng', icon: CircleOff, color: 'text-red-600' };
      case 'DISLIKE':
        return { label: 'Không thích', icon: ThumbsDown, color: 'text-orange-600' };
      case 'TEMPORARYAVOID':
        return { label: 'Tạm tránh', icon: BeanOff, color: 'text-yellow-600' };
      default:
        return { label: typeValue, icon: CircleOff, color: 'text-gray-600' };
    }
  };

  // Get restriction kind badge (ingredient or category)
  const getKindBadge = (restriction: UserDietRestrictionResponse) => {
    if (restriction.ingredientName) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Carrot size={14} />
          Thực phẩm
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
        <Salad size={14} />
        Thể Loại
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 sm:gap-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-end lg:gap-2">
          {/* Search Input - 1/2 width */}
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3" />
              <input
                type="text"
                placeholder="Tìm theo tên thực phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pr-3 pl-8 text-sm text-gray-900 placeholder-gray-500 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none sm:py-2 sm:pr-4 sm:pl-10"
              />
            </div>
          </div>

          {/* Type Filter - 1/4 width */}
          <div className="relative flex-1 lg:w-1/4 lg:flex-none" ref={typeDropdownRef}>
            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">Loại</label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none sm:px-3 sm:py-2"
            >
              <span className="flex items-center gap-2">
                {filterType ? (
                  <>
                    {filterType === 'ALLERGY' && (
                      <>
                        <CircleOff size={16} className="text-red-600" />
                        <span>Dị ứng</span>
                      </>
                    )}
                    {filterType === 'DISLIKE' && (
                      <>
                        <ThumbsDown size={16} className="text-orange-600" />
                        <span>Không thích</span>
                      </>
                    )}
                    {filterType === 'TEMPORARYAVOID' && (
                      <>
                        <BeanOff size={16} className="text-yellow-600" />
                        <span>Tạm tránh</span>
                      </>
                    )}
                  </>
                ) : (
                  'Tất cả'
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showTypeDropdown && (
              <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('');
                    setShowTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 first:rounded-t-lg hover:bg-gray-100"
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALLERGY');
                    setShowTypeDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  <CircleOff size={16} className="text-red-600" />
                  Dị ứng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('DISLIKE');
                    setShowTypeDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  <ThumbsDown size={16} className="text-orange-600" />
                  Không thích
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('TEMPORARYAVOID');
                    setShowTypeDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-900 last:rounded-b-lg hover:bg-gray-100"
                >
                  <BeanOff size={16} className="text-yellow-600" />
                  Tạm tránh
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown - 1/4 width */}
          <div className="relative flex-1 lg:w-1/4 lg:flex-none" ref={sortDropdownRef}>
            <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
              Sắp xếp
            </label>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none sm:px-3 sm:py-2"
            >
              <span>
                {sortBy ? (
                  <>
                    {sortBy === 'name_asc' && 'Tên (A-Z)'}
                    {sortBy === 'name_desc' && 'Tên (Z-A)'}
                    {sortBy === 'type_asc' && 'Loại (A-Z)'}
                    {sortBy === 'type_desc' && 'Loại (Z-A)'}
                    {sortBy === 'expired_asc' && 'Hết hạn (Sớm nhất)'}
                    {sortBy === 'expired_desc' && 'Hết hạn (Muộn nhất)'}
                  </>
                ) : (
                  'Mặc định'
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 first:rounded-t-lg hover:bg-gray-100"
                >
                  Mặc định
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name_asc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Tên (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name_desc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Tên (Z-A)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('type_asc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Loại (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('type_desc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Loại (Z-A)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('expired_desc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Hết hạn (Muộn nhất)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('expired_asc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 last:rounded-b-lg hover:bg-gray-100"
                >
                  Hết hạn (Sớm nhất)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      {searchQuery || filterType ? (
        <p className="ml-4 text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-[#99b94a]">{sortedRestrictions.length}</span>{' '}
          kết quả
        </p>
      ) : null}

      {/* Restrictions List or Empty State */}
      {sortedRestrictions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-6 text-center sm:py-8">
          <p className="text-sm text-gray-500 sm:text-base">
            {searchQuery || filterType
              ? 'Không tìm thấy hạn chế nào phù hợp'
              : 'Chưa có hạn chế nào được thêm'}
          </p>
          {!searchQuery && !filterType && (
            <p className="text-sm text-gray-400">Thêm hạn chế để quản lý chế độ ăn của bạn</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
          {sortedRestrictions.map((restriction) => (
            <div
              key={restriction.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 sm:p-4"
            >
              {/* Restriction Info */}
              <div className="flex-1 space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {getKindBadge(restriction)}
                  <p className="text-sm font-semibold text-gray-900 sm:text-base">
                    {restriction.ingredientName || restriction.ingredientCategoryName || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const typeInfo = getTypeLabel(restriction.type);
                    const IconComponent = typeInfo.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${typeInfo.color}`}
                      >
                        <IconComponent size={16} />
                        {typeInfo.label}
                      </span>
                    );
                  })()}
                  {restriction.notes && (
                    <p className="text-sm text-gray-500">• {restriction.notes}</p>
                  )}
                </div>
                {restriction.expiredAtUtc && (
                  <p className="text-xs text-gray-400">
                    <Clock className="inline-block h-4 w-4" /> Hết hạn:{' '}
                    {new Date(
                      restriction.expiredAtUtc.endsWith('Z')
                        ? restriction.expiredAtUtc
                        : restriction.expiredAtUtc + 'Z',
                    ).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 md:justify-end">
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
      )}
    </div>
  );
}
