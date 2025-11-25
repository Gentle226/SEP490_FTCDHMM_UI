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
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  // Fetch restrictions if not provided externally
  const { data: fetchedRestrictions, isLoading: isFetching } = useGetUserDietRestrictions();

  const restrictions = externalRestrictions || fetchedRestrictions || [];
  const isLoading = externalIsLoading || isFetching;

  // Filter restrictions based on search query and type
  const filteredRestrictions = restrictions.filter((restriction) => {
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
  });

  // Sort restrictions
  const sortedRestrictions = [...filteredRestrictions].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return (a.ingredientName || a.ingredientCategoryName || '').localeCompare(
          b.ingredientName || b.ingredientCategoryName || '',
        );
      case 'name-desc':
        return (b.ingredientName || b.ingredientCategoryName || '').localeCompare(
          a.ingredientName || a.ingredientCategoryName || '',
        );
      case 'type': {
        const aTypeValue =
          typeof a.type === 'string' ? a.type : (a.type as { value: string }).value;
        const bTypeValue =
          typeof b.type === 'string' ? b.type : (b.type as { value: string }).value;
        return (aTypeValue || '').localeCompare(bTypeValue || '');
      }
      case 'recent':
        const aDate = a.expiredAtUtc
          ? new Date(a.expiredAtUtc.endsWith('Z') ? a.expiredAtUtc : a.expiredAtUtc + 'Z').getTime()
          : 0;
        const bDate = b.expiredAtUtc
          ? new Date(b.expiredAtUtc.endsWith('Z') ? b.expiredAtUtc : b.expiredAtUtc + 'Z').getTime()
          : 0;
        return bDate - aDate;
      default:
        return 0;
    }
  });

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

  if (!restrictions || restrictions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
        <p className="text-gray-500">Chưa có hạn chế nào được thêm</p>
        <p className="text-sm text-gray-400">Thêm hạn chế để quản lý chế độ ăn của bạn</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-2">
          {/* Search Input - 1/2 width */}
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên thực phẩm hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none"
              />
            </div>
          </div>

          {/* Type Filter - 1/4 width */}
          <div className="relative flex-1 lg:w-1/4 lg:flex-none" ref={typeDropdownRef}>
            <label className="mb-1 block text-sm font-medium text-gray-700">Loại hạn chế</label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Sắp xếp</label>
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none"
            >
              <span>
                {sortBy ? (
                  <>
                    {sortBy === 'name-asc' && 'Tên (A-Z)'}
                    {sortBy === 'name-desc' && 'Tên (Z-A)'}
                    {sortBy === 'type' && 'Loại'}
                    {sortBy === 'recent' && 'Gần đây'}
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
                    setSortBy('name-asc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Tên (A-Z)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name-desc');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Tên (Z-A)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('type');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                >
                  Loại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('recent');
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 last:rounded-b-lg hover:bg-gray-100"
                >
                  Gần đây
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      {searchQuery || filterType ? (
        <p className="text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-[#99b94a]">{sortedRestrictions.length}</span>{' '}
          kết quả
        </p>
      ) : null}

      {/* Restrictions List */}
      {sortedRestrictions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
          <p className="text-gray-500">Không tìm thấy hạn chế nào phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sortedRestrictions.map((restriction) => (
            <div
              key={restriction.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              {/* Restriction Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {getKindBadge(restriction)}
                  <p className="font-semibold text-gray-900">
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
