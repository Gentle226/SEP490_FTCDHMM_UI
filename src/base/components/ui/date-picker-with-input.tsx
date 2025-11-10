'use client';

import { format, parse } from 'date-fns';
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
}

/**
 * A date picker component that allows users to both type a date and select from a calendar.
 * Users can input dates manually or click the calendar icon to pick from a visual calendar.
 */
export function DatePickerWithInput(props: DatePickerWithInputProps) {
  const t = useTranslations('base.components.DatePicker');

  const isMobile = useIsMobile();

  const [date, setDate] = useState(props.date);
  const [inputValue, setInputValue] = useState(date ? format(date, 'dd/MM/yyyy') : '');
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (newDate?: Date) => {
    setDate(newDate);
    if (newDate) {
      setInputValue(format(newDate, 'dd/MM/yyyy'));
    }
    props.onDateChange?.(newDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Remove any non-digit characters
    const digitsOnly = rawValue.replace(/\D/g, '');

    // Limit to 8 digits (ddmmyyyy)
    if (digitsOnly.length > 8) {
      return;
    }

    // Format as we type: dd/mm/yyyy
    let formattedValue = '';
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i === 2 || i === 4) {
        formattedValue += '/';
      }
      formattedValue += digitsOnly[i];
    }

    setInputValue(formattedValue);

    // Try to parse the input date when complete (dd/MM/yyyy format = 10 chars)
    if (formattedValue.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(formattedValue)) {
      try {
        const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date());
        // Validate that parsed date is valid
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          props.onDateChange?.(parsedDate);
        }
      } catch {
        // Invalid date, keep the input as is
      }
    }
  };

  const handleInputBlur = () => {
    // If input is empty, clear the date
    if (!inputValue.trim()) {
      setDate(undefined);
      props.onDateChange?.(undefined);
    }
  };

  const formatString = 'dd/MM/yyyy';

  const CalendarContent = (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateChange}
      autoFocus
      captionLayout="dropdown"
    />
  );

  if (isMobile) {
    return (
      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="numeric"
          placeholder={props.placeholder || 'dd/MM/yyyy'}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={props.disabled || props.readOnly}
          className={cn('flex-1', props.inputClassName)}
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
    <div className="flex gap-2">
      <Input
        type="text"
        inputMode="numeric"
        placeholder={props.placeholder || 'dd/MM/yyyy'}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={props.disabled || props.readOnly}
        className={cn('flex-1', props.inputClassName)}
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
