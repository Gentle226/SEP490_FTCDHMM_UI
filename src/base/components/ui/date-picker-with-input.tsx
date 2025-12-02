'use client';

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

interface DatePickerWithInputProps {
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
}

/**
 * A date picker component that allows users to both type a date and select from a calendar.
 * Users can input dates manually or click the calendar icon to pick from a visual calendar.
 */
export function DatePickerWithInput(props: DatePickerWithInputProps) {
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

  const CalendarContent = (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateChange}
      autoFocus
      captionLayout="dropdown"
      disabled={disabledDaysFn}
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
