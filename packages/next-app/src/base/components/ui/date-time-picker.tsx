'use client';

import { format } from 'date-fns';
import * as locales from 'date-fns/locale';
import { CalendarDaysIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Calendar } from '@/base/components/ui/calendar';
import { Checkbox } from '@/base/components/ui/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/base/components/ui/drawer';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { Separator } from '@/base/components/ui/separator';
import { TimeInput } from '@/base/components/ui/time-picker';
import { useIsMobile } from '@/base/hooks';
import { cn } from '@/base/lib';

interface DateTimePickerProps {
  /** The controlled date state. */
  date?: Date;
  /** The date state setter function */
  onDateChange?: (date?: Date) => void;
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

export function DateTimePicker({
  disabled,
  placeholder,
  readOnly,
  includeSeconds,
  toggleTime,
  triggerClassName,
  ...props
}: DateTimePickerProps) {
  const locale = useLocale();
  const t = useTranslations('base.components.DateTimePicker');

  const isMobile = useIsMobile();

  const [date, setDate] = useState(props.date);
  const [timeInputVersion, setTimeInputVersion] = useState(0);
  const [includeTime, setIncludeTime] = useState(true);

  /**
   * carry over the current time when a user clicks a new day
   * instead of resetting to 00:00
   */
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) {
      setDate(undefined);
      props.onDateChange?.(undefined);
      return;
    }
    if (!date) {
      setDate(newDay);
      props.onDateChange?.(newDay);
      return;
    }

    const updatedDate = new Date(
      newDay.setHours(date.getHours(), date.getMinutes(), date.getSeconds()),
    );

    setDate(updatedDate);
    props.onDateChange?.(updatedDate);
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
            variant={'outline'}
            className={cn(
              'w-full min-w-0 justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              triggerClassName,
            )}
            disabled={disabled}
            title={renderPickerText({
              date,
              locale,
              formatString,
              placeholder,
              defaultPlaceholder: t('placeholder'),
            })}
          >
            <CalendarDaysIcon className="mr-2 h-4 w-4" />
            <span className="truncate">
              {renderPickerText({
                date,
                locale,
                formatString,
                placeholder,
                defaultPlaceholder: t('placeholder'),
              })}
            </span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              {renderPickerText({
                date,
                locale,
                formatString,
                placeholder,
                defaultPlaceholder: t('placeholder'),
              })}
            </DrawerTitle>
          </DrawerHeader>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => handleSelect(d)}
            autoFocus
            captionLayout="dropdown"
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
                        handleSelect(!date ? undefined : new Date(date.setHours(0, 0, 0, 0)));
                      }
                    }
                  }}
                />
                <Label htmlFor="show-time">{t('includeTime')}</Label>
              </div>
            )}
            {(!toggleTime || includeTime) && (
              <>
                <TimeInput
                  key={timeInputVersion}
                  date={date}
                  includeSeconds={includeSeconds}
                  onDateChange={(date) => {
                    setDate(date);
                    props.onDateChange?.(date);
                  }}
                  onSetToNow={() => {
                    setTimeInputVersion((prev) => prev + 1);
                  }}
                />
              </>
            )}
          </div>
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
            !date && 'text-muted-foreground',
            triggerClassName,
          )}
          disabled={disabled}
          title={renderPickerText({
            date,
            locale,
            formatString,
            placeholder,
            defaultPlaceholder: t('placeholder'),
          })}
        >
          <CalendarDaysIcon className="mr-2 h-4 w-4" />
          <span className="truncate">
            {renderPickerText({
              date,
              locale,
              formatString,
              placeholder,
              defaultPlaceholder: t('placeholder'),
            })}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => handleSelect(d)}
          autoFocus
          captionLayout="dropdown"
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
                      handleSelect(!date ? undefined : new Date(date.setHours(0, 0, 0, 0)));
                    }
                  }
                }}
              />
              <Label htmlFor="show-time">{t('includeTime')}</Label>
            </div>
          )}
          {(!toggleTime || includeTime) && (
            <>
              <TimeInput
                key={timeInputVersion}
                date={date}
                includeSeconds={includeSeconds}
                onDateChange={(date) => {
                  setDate(date);
                  props.onDateChange?.(date);
                }}
                onSetToNow={() => {
                  setTimeInputVersion((prev) => prev + 1);
                }}
              />
            </>
          )}
        </div>
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
  if (date) {
    return format(date, formatString, { locale: locales[locale as keyof typeof locales] });
  }
  return placeholder ?? defaultPlaceholder;
}
