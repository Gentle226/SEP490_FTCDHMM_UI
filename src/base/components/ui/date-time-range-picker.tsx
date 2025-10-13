'use client';

import { add, format } from 'date-fns';
import * as locales from 'date-fns/locale';
import { CalendarDaysIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/base/components/ui/button';
import { Calendar } from '@/base/components/ui/calendar';
import { Checkbox } from '@/base/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerTrigger } from '@/base/components/ui/drawer';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { ScrollArea } from '@/base/components/ui/scroll-area';
import { Separator } from '@/base/components/ui/separator';
import { TimeInput } from '@/base/components/ui/time-picker';
import { useIsMobile } from '@/base/hooks';
import { cn } from '@/base/lib';

interface DateTimeRangePickerProps {
  /** The controlled date state. */
  dateRange?: DateRange;
  /** The date state setter function */
  onDateRangeChange?: (date?: DateRange) => void;
  /** Whether the date picker is disabled. */
  disabled?: boolean;
  /** The placeholder text to display when no date is selected. */
  placeholder?: string;
  /** Whether the date picker is read only. */
  readOnly?: boolean;
  /** Whether to include seconds in the time picker. */
  includeSeconds?: boolean;
  /** If `true`, add a button to toggle hide/show the time input */
  toggleTime?: boolean;
  /** Custom trigger button class names */
  triggerClassName?: string;
}

export function DateTimeRangePicker({
  disabled,
  placeholder,
  readOnly,
  includeSeconds,
  toggleTime,
  triggerClassName,
  ...props
}: DateTimeRangePickerProps) {
  const locale = useLocale();
  const t = useTranslations('base.components.DateTimeRangePicker');

  const isMobile = useIsMobile();

  const [dateRange, setDateRange] = useState(props.dateRange);
  const [fromTimeInputVersion, setFromTimeInputVersion] = useState(0);
  const [toTimeInputVersion, setToTimeInputVersion] = useState(0);
  const [includeTime, setIncludeTime] = useState(true);

  /**
   * carry over the current time when a user clicks a new day
   * instead of resetting to 00:00
   */
  const handleSelect = (newDay: DateRange | undefined) => {
    if (!newDay) {
      setDateRange(undefined);
      props.onDateRangeChange?.(undefined);
      return;
    }
    if (!dateRange) {
      setDateRange(newDay);
      props.onDateRangeChange?.(newDay);
      return;
    }
    const newStart = newDay.from;
    const newEnd = newDay.to;

    const updatedRange = { ...dateRange };

    if (newStart) {
      if (!dateRange.from) {
        updatedRange.from = newStart;
      } else {
        const diff = newStart.getTime() - (dateRange.from?.getTime() ?? 0);
        const diffInDays = diff / (1000 * 60 * 60 * 24);
        const newStartDate = add(dateRange.from ?? new Date(), { days: Math.ceil(diffInDays) });
        updatedRange.from = newStartDate;
      }
    }

    if (newEnd) {
      if (!dateRange.to) {
        updatedRange.to = newEnd;
      } else {
        const diff = newEnd.getTime() - (dateRange.to?.getTime() ?? 0);
        const diffInDays = diff / (1000 * 60 * 60 * 24);
        const newEndDate = add(dateRange.to ?? new Date(), { days: Math.ceil(diffInDays) });
        updatedRange.to = newEndDate;
      }
    }

    setDateRange(updatedRange);
    props.onDateRangeChange?.(updatedRange);
  };

  const dateFormatString = 'PP';
  const timeFormatString = includeSeconds ? 'pp' : 'p';
  const formatString =
    !toggleTime || includeTime ? `${dateFormatString}${timeFormatString}` : dateFormatString;

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
          <ScrollArea className="flex max-h-screen w-full flex-col overflow-y-auto">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleSelect}
              initialFocus
            />
            <Separator />
            <div className="w-full space-y-2 p-4">
              {toggleTime && (
                <div className="flex items-center gap-4">
                  <Checkbox
                    id="show-time"
                    checked={includeTime}
                    onCheckedChange={(checked) => {
                      if (checked !== 'indeterminate') {
                        setIncludeTime(checked);
                        if (!checked) {
                          handleSelect({
                            ...dateRange,
                            from: dateRange?.from
                              ? new Date(dateRange.from.setHours(0, 0, 0, 0))
                              : undefined,
                            to: dateRange?.to
                              ? new Date(dateRange.to.setHours(0, 0, 0, 0))
                              : undefined,
                          });
                        }
                      }
                    }}
                  />
                  <Label htmlFor="show-time">{t('includeTime')}</Label>
                </div>
              )}
              {(!toggleTime || includeTime) && (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    {dateRange?.from && (
                      <span className="text-sm">
                        {t('fromDateAt', {
                          date: format(dateRange.from, dateFormatString, {
                            locale: locales[locale as keyof typeof locales],
                          }),
                        })}
                      </span>
                    )}
                    <TimeInput
                      key={fromTimeInputVersion}
                      date={dateRange?.from}
                      includeSeconds={includeSeconds}
                      onDateChange={(date) => {
                        const newDateRange = { ...dateRange, from: date };
                        setDateRange(newDateRange);
                        props.onDateRangeChange?.(newDateRange);
                      }}
                      onSetToNow={() => {
                        setFromTimeInputVersion((prev) => prev + 1);
                      }}
                    />
                  </div>
                  <ChevronDownIcon className="text-muted-foreground size-6" />
                  <div className="flex flex-col items-center gap-2">
                    {dateRange?.to && (
                      <span className="text-sm">
                        {t('toDateAt', {
                          date: format(dateRange.to, dateFormatString, {
                            locale: locales[locale as keyof typeof locales],
                          }),
                        })}
                      </span>
                    )}
                    <TimeInput
                      key={toTimeInputVersion}
                      date={dateRange?.to}
                      includeSeconds={includeSeconds}
                      onDateChange={(date) => {
                        const newDateRange = { from: dateRange?.from, to: date };
                        setDateRange(newDateRange);
                        props.onDateRangeChange?.(newDateRange);
                      }}
                      onSetToNow={() => {
                        setToTimeInputVersion((prev) => prev + 1);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild onClick={readOnly ? (e) => e.preventDefault() : undefined}>
        <Button
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
          <CalendarDaysIcon className="mr-2 h-4 w-4" />
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
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={dateRange}
          onSelect={(range) => handleSelect(range)}
          initialFocus
        />
        <Separator />
        <div className="w-full space-y-2 p-4">
          {toggleTime && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-time"
                checked={includeTime}
                onCheckedChange={(checked) => {
                  if (checked !== 'indeterminate') {
                    setIncludeTime(checked);
                    if (!checked) {
                      handleSelect({
                        ...dateRange,
                        from: dateRange?.from
                          ? new Date(dateRange.from.setHours(0, 0, 0, 0))
                          : undefined,
                        to: dateRange?.to ? new Date(dateRange.to.setHours(0, 0, 0, 0)) : undefined,
                      });
                    }
                  }
                }}
              />
              <Label htmlFor="show-time">{t('includeTime')}</Label>
            </div>
          )}
          {(!toggleTime || includeTime) && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                {dateRange?.from && (
                  <span className="text-sm">
                    {t('fromDateAt', {
                      date: format(dateRange.from, dateFormatString, {
                        locale: locales[locale as keyof typeof locales],
                      }),
                    })}
                  </span>
                )}
                <TimeInput
                  key={fromTimeInputVersion}
                  date={dateRange?.from}
                  includeSeconds={includeSeconds}
                  onDateChange={(date) => {
                    const newDateRange = { ...dateRange, from: date };
                    setDateRange(newDateRange);
                    props.onDateRangeChange?.(newDateRange);
                  }}
                  onSetToNow={() => {
                    setFromTimeInputVersion((prev) => prev + 1);
                  }}
                />
              </div>
              <ChevronRightIcon className="text-muted-foreground size-6" />
              <div className="flex flex-col items-center gap-2">
                {dateRange?.to && (
                  <span className="text-sm">
                    {t('toDateAt', {
                      date: format(dateRange.to, dateFormatString, {
                        locale: locales[locale as keyof typeof locales],
                      }),
                    })}
                  </span>
                )}
                <TimeInput
                  key={toTimeInputVersion}
                  date={dateRange?.to}
                  includeSeconds={includeSeconds}
                  onDateChange={(date) => {
                    const newDateRange = { from: dateRange?.from, to: date };
                    setDateRange(newDateRange);
                    props.onDateRangeChange?.(newDateRange);
                  }}
                  onSetToNow={() => {
                    setToTimeInputVersion((prev) => prev + 1);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
