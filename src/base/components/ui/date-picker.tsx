'use client';

import { format } from 'date-fns';
import * as locales from 'date-fns/locale';
import { CalendarDaysIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { useIsMobile } from '@/base/hooks';
import { cn } from '@/base/lib';

interface DatePickerProps {
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
  /** Custom trigger button class names */
  triggerClassName?: string;
}

/**
 * A simple date picker component that allows users to select a date from a calendar. Crafted from `<Popover>`, `<Button>`, and `<Calendar>` components.
 */
export function DatePicker(props: DatePickerProps) {
  const locale = useLocale();
  const t = useTranslations('base.components.DatePicker');

  const isMobile = useIsMobile();

  const [date, setDate] = useState(props.date);

  const handleDateChange = (newDate?: Date) => {
    setDate(newDate);
    props.onDateChange?.(newDate);
  };

  const formatString = 'PP';

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild onClick={props.readOnly ? (e) => e.preventDefault() : undefined}>
          <Button
            variant="outline"
            className={cn(
              'w-full min-w-0 justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              props.triggerClassName,
            )}
            disabled={props.disabled}
            title={renderPickerText({
              formatString,
              locale,
              defaultPlaceholder: t('placeholder'),
              date,
              placeholder: props.placeholder,
            })}
          >
            <CalendarDaysIcon />
            <span className="truncate">
              {renderPickerText({
                formatString,
                locale,
                defaultPlaceholder: t('placeholder'),
                date,
                placeholder: props.placeholder,
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
                date,
                placeholder: props.placeholder,
              })}
            </DrawerTitle>
          </DrawerHeader>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            autoFocus
            captionLayout="dropdown"
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild onClick={props.readOnly ? (e) => e.preventDefault() : undefined}>
        <Button
          variant="outline"
          className={cn(
            'w-full min-w-0 justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            props.triggerClassName,
          )}
          disabled={props.disabled}
        >
          <CalendarDaysIcon />
          <span className="truncate">
            {renderPickerText({
              formatString,
              locale,
              defaultPlaceholder: t('placeholder'),
              date,
              placeholder: props.placeholder,
            })}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          autoFocus
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}

function renderPickerText({
  formatString,
  defaultPlaceholder,
  date,
  placeholder,
  locale,
}: {
  formatString: string;
  defaultPlaceholder: string;
  locale?: string;
  date?: Date;
  placeholder?: string;
}) {
  if (!date) {
    return placeholder ?? defaultPlaceholder;
  }

  return format(date, formatString, { locale: locales[locale as keyof typeof locales] });
}
