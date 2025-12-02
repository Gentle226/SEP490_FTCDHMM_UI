'use client';

import { differenceInDays } from 'date-fns';
import { format } from 'date-fns';
import { CalendarDaysIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Calendar } from '@/base/components/ui/calendar';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/base/components/ui/drawer';
import { Input } from '@/base/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { useIsMobile } from '@/base/hooks';
import { cn } from '@/base/lib';

interface DatePickerWithDaysDisplayProps {
  /** The controlled selected date. Must be used in conjunction with `onDateChange`. */
  date?: Date;
  /** Callback fired when the date is changed. */
  onDateChange?: (date?: Date) => void;
  /** Whether the date picker is disabled. */
  disabled?: boolean;
  /** The placeholder text to display when no date is selected. */
  placeholder?: string;
  /** Whether the date picker is read only. */
  readOnly?: boolean;
  /** Custom input class names */
  inputClassName?: string;
  /** Function to determine which days should be disabled. */
  disabledDays?: (date: Date) => boolean;
  /** Theme color for selected days - defaults to primary */
  themeColor?: string;
}

/**
 * A date picker component for health goals that displays the day difference.
 * Shows how many days until the selected date from today.
 * Users can input dates manually or click the calendar icon to pick from a visual calendar.
 */
export function DatePickerWithDaysDisplay(props: DatePickerWithDaysDisplayProps) {
  const t = useTranslations('base.components.DatePicker');

  const isMobile = useIsMobile();

  const [date, setDate] = useState(props.date);
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (newDate?: Date) => {
    setDate(newDate);
    props.onDateChange?.(newDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
      const newDate = new Date(dateString);
      setDate(newDate);
      props.onDateChange?.(newDate);
    } else {
      setDate(undefined);
      props.onDateChange?.(undefined);
    }
  };

  const formatString = 'dd/MM/yyyy';
  const inputValue = date ? format(date, 'yyyy-MM-dd') : '';

  // Disable future dates by default, or use custom disabledDays function
  const disabledDaysFn = props.disabledDays || ((day: Date) => day > new Date());

  const dayCount = date ? differenceInDays(date, new Date()) : undefined;

  const CalendarContent = (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateChange}
      autoFocus
      captionLayout="dropdown"
      disabled={disabledDaysFn}
      classNames={{
        day_selected: props.themeColor
          ? `bg-[${props.themeColor}] text-white font-bold`
          : undefined,
      }}
    />
  );

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          disabled={props.disabled || props.readOnly}
          className={cn(
            'flex-1 [&::-webkit-calendar-picker-indicator]:hidden',
            props.inputClassName,
          )}
        />
        {dayCount !== undefined && dayCount !== null && (
          <div className="border-input bg-background flex items-center justify-center rounded-md border px-3 py-2">
            <span className="text-foreground text-sm font-medium">{dayCount} ngày</span>
          </div>
        )}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild onClick={props.readOnly ? (e) => e.preventDefault() : undefined}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={props.disabled}
              title="Chọn ngày từ lịch"
            >
              <CalendarDaysIcon className="size-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">
                {date ? format(date, formatString) : props.placeholder || t('placeholder')}
              </DrawerTitle>
            </DrawerHeader>
            {CalendarContent}
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        disabled={props.disabled || props.readOnly}
        className={cn('flex-1 [&::-webkit-calendar-picker-indicator]:hidden', props.inputClassName)}
      />
      {dayCount !== undefined && dayCount !== null && (
        <div className="border-input bg-background flex items-center justify-center rounded-md border px-3 py-2">
          <span className="text-foreground text-sm font-medium">{dayCount} ngày</span>
        </div>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild onClick={props.readOnly ? (e) => e.preventDefault() : undefined}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={props.disabled}
            title="Chọn ngày từ lịch"
          >
            <CalendarDaysIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">{CalendarContent}</PopoverContent>
      </Popover>
    </div>
  );
}
