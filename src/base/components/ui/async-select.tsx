'use client';

import { InfiniteData, UseInfiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { useDebounce } from '@/base/hooks';
import { cn } from '@/base/lib';
import type { SuccessResponse } from '@/base/types';

import { LoadingIndicator } from './loading-indicator';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export type AsyncSelectProps<T> = {
  /** Query key for Tanstack Query, the search term is appended to this key */
  queryKey: (searchTerm: string) => unknown[];
  /** Async function to fetch options */
  queryFn: (searchTerm: string, page: number) => Promise<SuccessResponse<T[]>>;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
} & Omit<
  UseInfiniteQueryOptions<
    SuccessResponse<T[]>,
    Error,
    InfiniteData<SuccessResponse<T[]>>,
    unknown[]
  >,
  | 'queryKey'
  | 'queryFn'
  | 'initialPageParam'
  | 'getNextPageParam'
  | 'getPreviousPageParam'
  | 'initialData'
> &
  (
    | {
        /** Allow the select to select multiple values */
        multiple?: false;
        /** Currently selected value */
        value?: string;
        /** Callback when selection changes */
        onChange: (value: string) => void;
      }
    | {
        /** Allow the select to select multiple values */
        multiple: true;
        /** Currently selected values */
        value?: string[];
        /** Callback when selection changes */
        onChange: (value: string[]) => void;
      }
  );

export function AsyncSelect<T>({
  queryKey,
  queryFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  disabled = false,
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
  multiple,
  value,
  onChange,
  enabled,
  ...useInfiniteQueryOptions
}: AsyncSelectProps<T>) {
  const { inView, ref } = useInView();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, __] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(() => {
    if (value && !multiple) {
      return value as string;
    }
    return null;
  });
  const [selectedValues, setSelectedValues] = useState(() => {
    if (value && multiple) {
      return value as string[];
    }
    return [];
  });
  const [selectedOption, setSelectedOption] = useState<T | null>(() => {
    if (value && !multiple) {
      const selected = options.find((opt) => getOptionValue(opt) === value);
      return selected || null;
    }

    return null;
  });
  const [selectedOptions, setSelectedOptions] = useState<T[]>(() => {
    if (value && multiple) {
      const selected = options.filter((opt) => (value as string[]).includes(getOptionValue(opt)));
      return selected || [];
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: res,
    isLoading: isLoadingQuery,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: queryKey(debouncedSearchTerm),
    queryFn: ({ pageParam }) => queryFn(debouncedSearchTerm, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage: SuccessResponse<T[]>) =>
      lastPage.metadata.pagination.hasNextPage
        ? lastPage.metadata.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage: SuccessResponse<T[]>) =>
      firstPage.metadata.pagination.hasPreviousPage
        ? firstPage.metadata.pagination.currentPage - 1
        : undefined,
    enabled: enabled || !mounted || (mounted && open),
    ...useInfiniteQueryOptions,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoadingQuery) {
      setLoading(false);
      setOptions(res?.pages.flatMap((p) => p.data) || []);
    }
  }, [res, isLoadingQuery]);

  useEffect(() => {
    if (inView && !isFetchingNextPage && !loading && res?.pages.length) {
      fetchNextPage();
    }
  }, [inView, isFetchingNextPage, loading, res, fetchNextPage]);

  const handleSelect = (currentValue: string) => {
    if (!multiple) {
      const newValue = clearable && currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(options.find((option) => getOptionValue(option) === newValue) || null);
      onChange(newValue);
      setOpen(false);
      return;
    }

    const newValues =
      clearable && selectedValues.includes(currentValue)
        ? selectedValues.filter((val) => val !== currentValue)
        : [...selectedValues, currentValue];
    setSelectedValues(newValues);

    setSelectedOptions(
      clearable && selectedOptions.some((opt) => getOptionValue(opt) === currentValue)
        ? selectedOptions.filter((opt) => getOptionValue(opt) !== currentValue)
        : [...selectedOptions, options.find((opt) => getOptionValue(opt) === currentValue)!],
    );

    onChange(newValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClassName,
          )}
          disabled={disabled}
        >
          {(() => {
            if (multiple) return <></>;

            if (selectedOption) return getDisplayValue(selectedOption);

            return placeholder;
          })()}
          {(() => {
            if (!multiple) return <></>;
            if (selectedOptions.length === 0) return placeholder;

            if (selectedOptions.length === 1)
              return <span>{getDisplayValue(selectedOptions[0])}</span>;

            if (selectedOptions.length === 2)
              return (
                <span>
                  {getDisplayValue(selectedOptions[0])}, {getDisplayValue(selectedOptions[1])}
                </span>
              );

            if (selectedOptions.length > 2)
              return (
                <span>
                  {getDisplayValue(selectedOptions[0])}, {getDisplayValue(selectedOptions[1])}, và{' '}
                  {selectedOptions.length - 2} nữa...
                </span>
              );
          })()}
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-(--radix-popover-trigger-width) p-0', className)}>
        <Command shouldFilter={false}>
          <div className="relative w-full border-b">
            <CommandInput
              placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setLoading(true);
              }}
            />
            {loading && (
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && <div className="text-destructive p-4 text-center">{error}</div>}
            {loading && (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `Không tìm thấy ${label.toLowerCase()}`}
                </CommandEmpty>
              ))}
            {!loading && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={handleSelect}
                  >
                    {renderOption(option)}
                    <Check
                      className={cn('ml-auto h-3 w-3 opacity-0', {
                        'opacity-100':
                          (!multiple && selectedValue === getOptionValue(option)) ||
                          (multiple && selectedValues.includes(getOptionValue(option))),
                      })}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <div ref={ref} className="flex w-full justify-center">
              {isFetchingNextPage && <LoadingIndicator className="size-4" />}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex w-full items-center gap-2">
            <div className="bg-muted h-6 w-6 animate-pulse rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
