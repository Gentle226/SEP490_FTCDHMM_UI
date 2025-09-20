'use client';

import { format } from 'date-fns';
import * as locales from 'date-fns/locale';
import { CalendarDaysIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/base/components/ui/button';
import { Calendar } from '@/base/components/ui/calendar';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/base/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { useIsMobile } from '@/base/hooks';
import { cn } from '@/base/lib';

interface DateRangePickerProps {
  /**
   * The controlled selected date range. Must be used in conjunction with `onDateRangeChange`.
   */
  dateRange?: DateRange;
  /** Callback fired when the date range is changed. */
  onDateRangeChange?: (dateRange?: DateRange) => void;
  /** Whether the date range picker is disabled. */
  disabled?: boolean;
  /** Whether the date range picker is read only. */
  readOnly?: boolean;
  /** The placeholder text to display when no date range is selected. Default to `"Pick a date range"` */
  placeholder?: string;
  /** Additional class names for the button. */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
}

export function DateRangePicker({
  className,
  onDateRangeChange,
  disabled,
  readOnly,
  placeholder,
  triggerClassName,
  ...props
}: DateRangePickerProps) {
  const locale = useLocale();
  const t = useTranslations('base.components.DateRangePicker');

  const isMobile = useIsMobile();

  const [dateRange, setDateRange] = useState(props.dateRange);

  const handleDateRangeChange = (newDateRange?: DateRange) => {
    setDateRange(newDateRange);
    onDateRangeChange?.(newDateRange);
  };

  const formatString = 'PP';

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild onClick={readOnly ? (e) => e.preventDefault() : undefined}>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full min-w-0 justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              triggerClassName,
            )}
            disabled={disabled}
            title={renderPickerText({
              formatString,
              locale,
              defaultPlaceholder: t('placeholder'),
              dateRange,
              placeholder,
            })}
          >
            <CalendarDaysIcon />
            <span className="truncate">
              {renderPickerText({
                formatString,
                locale,
                defaultPlaceholder: t('placeholder'),
                dateRange,
                placeholder,
              })}
            </span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              {renderPickerText({
                formatString,
                locale,
                defaultPlaceholder: t('placeholder'),
                dateRange,
                placeholder,
              })}
            </DrawerTitle>
          </DrawerHeader>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRangeChange}
            initialFocus
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full min-w-0 justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              triggerClassName,
            )}
            disabled={disabled}
            title={renderPickerText({
              formatString,
              locale,
              defaultPlaceholder: t('placeholder'),
              dateRange,
              placeholder,
            })}
          >
            <CalendarDaysIcon />
            <span className="truncate">
              {renderPickerText({
                formatString,
                locale,
                defaultPlaceholder: t('placeholder'),
                dateRange,
                placeholder,
              })}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function renderPickerText({
  formatString,
  dateRange,
  defaultPlaceholder,
  placeholder,
  locale,
}: {
  formatString: string;
  defaultPlaceholder: string;
  locale?: string;
  dateRange?: DateRange;
  placeholder?: string;
}) {
  if (dateRange?.from) {
    if (dateRange.to) {
      return `${format(dateRange.from, formatString, { locale: locales[locale as keyof typeof locales] })} - ${format(dateRange.to, formatString, { locale: locales[locale as keyof typeof locales] })}`;
    }
    return format(dateRange.from, formatString, {
      locale: locales[locale as keyof typeof locales],
    });
  }
  return placeholder ?? defaultPlaceholder;
}
