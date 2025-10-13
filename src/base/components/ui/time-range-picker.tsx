import { format } from 'date-fns';
import { ChevronRight, ClockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/base/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { TimeInput } from '@/base/components/ui/time-picker';
import { cn } from '@/base/lib';

interface TimeRangePickerProps {
  /** The controlled date state. */
  dateRange?: DateRange;
  /** The date state setter function */
  onDateRangeChange?: (date: DateRange) => void;
  /** Whether the time picker is disabled. */
  disabled?: boolean;
  /** Whether the time picker is read only. */
  readOnly?: boolean;
  /** The placeholder text to display when no date is selected. */
  placeholder?: string;
  /** Whether to include seconds in the time picker. */
  includeSeconds?: boolean;
  /** Custom trigger button class names */
  triggerClassName?: string;
}

export function TimeRangePicker({
  disabled,
  readOnly,
  placeholder,
  includeSeconds,
  triggerClassName,
  ...props
}: TimeRangePickerProps) {
  const t = useTranslations('base.components.TimeRangePicker');

  const [dateRange, setDateRange] = useState(props.dateRange);
  const [versionFromInput, setVersionFromInput] = useState(0);
  const [versionToInput, setVersionToInput] = useState(0);

  const formatString = includeSeconds ? 'pp' : 'p';

  const handleChangeDateRange = (dateRange: DateRange) => {
    setDateRange(dateRange);
    props.onDateRangeChange?.(dateRange);
  };

  return (
    <Popover>
      <PopoverTrigger asChild onClick={readOnly ? (e) => e.preventDefault() : undefined}>
        <Button
          id="date"
          variant={'outline'}
          className={cn(
            'w-full min-w-0 justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
            triggerClassName,
          )}
          disabled={disabled}
        >
          <ClockIcon />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, formatString)} - {format(dateRange.to, formatString)}
              </>
            ) : (
              format(dateRange.from, formatString)
            )
          ) : (
            <span>{placeholder ?? t('placeholder')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="center">
        <div className="flex items-center gap-2">
          <div className="space-y-2">
            <TimeInput
              key={versionFromInput}
              date={dateRange?.from}
              onSetToNow={() => setVersionFromInput(versionToInput + 1)}
              onDateChange={(date) =>
                handleChangeDateRange({
                  from: date,
                  to: dateRange?.to,
                })
              }
              includeSeconds={includeSeconds}
            />
          </div>
          <ChevronRight className="text-muted-foreground size-6" />
          <div className="space-y-2">
            <TimeInput
              key={versionToInput}
              date={dateRange?.to}
              onDateChange={(date) =>
                handleChangeDateRange({
                  from: dateRange?.from,
                  to: date,
                })
              }
              onSetToNow={() => setVersionToInput(versionToInput + 1)}
              includeSeconds={includeSeconds}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
