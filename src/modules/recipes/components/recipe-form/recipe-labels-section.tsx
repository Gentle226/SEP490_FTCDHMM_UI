'use client';

import { Plus, Tag, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { Label as LabelType } from '@/modules/labels/services/label-management.service';

import { SelectedLabel } from './types';

interface RecipeLabelsSectionProps {
  selectedLabels: SelectedLabel[];
  labelSearch: string;
  labelSearchResults: LabelType[];
  isLabelPopoverOpen: boolean;
  isLoadingLabels: boolean;
  onLabelSearchChange: (value: string) => void;
  onPopoverOpenChange: (open: boolean) => void;
  onAddLabel: (label: LabelType) => void;
  onRemoveLabel: (labelId: string) => void;
}

export function RecipeLabelsSection({
  selectedLabels,
  labelSearch,
  labelSearchResults,
  isLabelPopoverOpen,
  isLoadingLabels,
  onLabelSearchChange,
  onPopoverOpenChange,
  onAddLabel,
  onRemoveLabel,
}: RecipeLabelsSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-[#99b94a]" />
        Nhãn
        <span className="text-red-500">*</span>
      </Label>

      {/* Selected Labels */}
      <div className="flex min-h-[60px] flex-wrap gap-2 rounded-lg border p-3">
        {selectedLabels.length === 0 ? (
          <span className="flex w-full justify-center pt-2 text-xs text-gray-400">
            Chưa có nhãn nào được chọn
          </span>
        ) : (
          selectedLabels.map((label) => {
            const labelStyle = { backgroundColor: label.colorCode } as React.CSSProperties;
            return (
              <div
                key={label.id}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white"
                style={labelStyle}
                suppressHydrationWarning
              >
                <span>{label.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveLabel(label.id)}
                  className="ml-1 rounded-full hover:bg-white/20"
                  aria-label={`Remove ${label.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Search and Add Labels */}
      <Popover open={isLabelPopoverOpen} onOpenChange={onPopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhãn
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] max-w-[710px] p-0 sm:w-[710px]"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm kiếm nhãn..."
              value={labelSearch}
              onValueChange={onLabelSearchChange}
            />
            <CommandList>
              {isLoadingLabels ? (
                <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
              ) : labelSearchResults.length === 0 ? (
                <CommandEmpty>Không tìm thấy nhãn nào.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {labelSearchResults.map((label) => {
                    const isSelected = selectedLabels.some((l) => l.id === label.id);
                    const colorStyle = {
                      backgroundColor: label.colorCode,
                    } as React.CSSProperties;
                    return (
                      <CommandItem
                        key={label.id}
                        onSelect={() => onAddLabel(label)}
                        disabled={isSelected}
                        className="cursor-pointer"
                      >
                        <div className="flex w-full items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={colorStyle}
                            suppressHydrationWarning
                          />
                          <span className="flex-1">{label.name}</span>
                          {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
