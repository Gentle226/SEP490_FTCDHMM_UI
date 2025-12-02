'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { Select, type SelectOption } from '@/base/components/ui/select';

import { ReportStatus, ReportTargetType } from '../types';

export interface ReportFilters {
  type?: ReportTargetType | null;
  status?: ReportStatus | null;
  keyword?: string;
}

export interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onReset?: () => void;
}

const TARGET_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả loại' },
  { value: ReportTargetType.RECIPE, label: 'Công thức' },
  { value: ReportTargetType.USER, label: 'Người dùng' },
  { value: ReportTargetType.COMMENT, label: 'Bình luận' },
  { value: ReportTargetType.RATING, label: 'Đánh giá' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: ReportStatus.PENDING, label: 'Chờ xử lý' },
  { value: ReportStatus.APPROVED, label: 'Đã duyệt' },
  { value: ReportStatus.REJECTED, label: 'Đã từ chối' },
];

export function ReportFiltersComponent({ filters, onFiltersChange, onReset }: ReportFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.keyword || '');

  const handleTypeChange = (value: string | undefined) => {
    onFiltersChange({
      ...filters,
      type: value ? (value as ReportTargetType) : null,
    });
  };

  const handleStatusChange = (value: string | undefined) => {
    onFiltersChange({
      ...filters,
      status: value ? (value as ReportStatus) : null,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      keyword: searchValue.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSearchValue('');
    onReset?.();
  };

  const hasActiveFilters = filters.type || filters.status || filters.keyword;

  return (
    <div className="grid grid-cols-4 gap-3">
      <Select
        options={TARGET_TYPE_OPTIONS}
        value={filters.type || ''}
        onChange={handleTypeChange}
        placeholder="Loại"
        clearable
        searchable={false}
      />

      <Select
        options={STATUS_OPTIONS}
        value={filters.status || ''}
        onChange={handleStatusChange}
        placeholder="Trạng thái"
        clearable
        searchable={false}
      />

      <form onSubmit={handleSearchSubmit} className="col-span-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm báo cáo..."
            className="pl-9"
          />
        </div>
        <Button type="submit" size="sm" className="bg-[#99b94a] text-white hover:bg-[#8aab3b]">
          Tìm kiếm
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} type="button">
            <X className="size-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
