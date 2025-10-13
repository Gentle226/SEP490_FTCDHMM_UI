'use client';

import { format } from 'date-fns';
import * as locales from 'date-fns/locale';
import { ClockIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ComponentProps, Ref, useEffect, useRef, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { Select } from '@/base/components/ui/select';
import { cn } from '@/base/lib';

interface TimePickerProps {
  /** The controlled date state. */
  date?: Date;
  /** The date state setter function */
  onDateChange?: (date: Date) => void;
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

/**
 * A simple time picker component that allows users to select a time from a clock.
 */
export function TimePicker({
  disabled,
  readOnly,
  placeholder,
  includeSeconds,
  triggerClassName,
  ...props
}: TimePickerProps) {
  const locale = useLocale();
  const t = useTranslations('base.components.TimePicker');

  const [date, setDate] = useState(props.date);
  const [version, setVersion] = useState(0); // Reset the state of the time input when the 'Set to now' button clicked

  const handleChangeDate = (date: Date) => {
    setDate(date);
    props.onDateChange?.(date);
  };

  const formatString = includeSeconds ? 'pp' : 'p';

  return (
    <Popover>
      <PopoverTrigger asChild onClick={readOnly ? (e) => e.preventDefault() : undefined}>
        <Button
          variant="outline"
          className={cn(
            'w-full min-w-0 justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            triggerClassName,
          )}
          disabled={disabled}
        >
          <ClockIcon />
          {date ? (
            format(date, formatString, { locale: locales[locale as keyof typeof locales] })
          ) : (
            <span>{placeholder ?? t('placeholder')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="space-y-2">
          <TimeInput
            key={version}
            date={date}
            includeSeconds={includeSeconds}
            onDateChange={handleChangeDate}
            onSetToNow={() => {
              setVersion(version + 1);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

type TimeInputProps = Omit<TimePickerProps, 'placeholder'> & {
  onSetToNow?: () => void;
};

export function TimeInput(props: TimeInputProps) {
  const locale = useLocale();
  const [date, setDate] = useState(props.date ?? new Date(new Date().setHours(0, 0, 0, 0)));

  const isHour12 = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions().hour12;

  const handleChangeDate = (date: Date) => {
    setDate(date);
    props.onDateChange?.(date);
  };

  return isHour12 ? (
    <TimePickerInput12h {...props} date={date} onDateChange={handleChangeDate} />
  ) : (
    <TimePickerInput24h {...props} date={date} onDateChange={handleChangeDate} />
  );
}

function TimePickerInput12h(
  props: TimeInputProps &
    Required<Pick<TimeInputProps, 'date' | 'onDateChange'>> & { onSetToNow?: () => void },
) {
  const t = useTranslations('base.components.TimePicker');
  const [period, setPeriod] = useState<Period>(
    !props.date ? 'AM' : (format(props.date, 'aa') as Period),
  );

  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-2">
        <div className="flex flex-col items-center justify-center gap-1">
          <Label htmlFor="hours" className="text-xs">
            {t('hours')}
          </Label>
          <TimePickerEntryInput
            picker="12hours"
            period={period}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
            {...props}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Label htmlFor="minutes" className="text-xs">
            {t('minutes')}
          </Label>
          <TimePickerEntryInput
            picker="minutes"
            id="minutes12"
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => secondRef.current?.focus()}
            {...props}
          />
        </div>
        {props.includeSeconds && (
          <div className="flex flex-col items-center gap-1">
            <Label htmlFor="seconds" className="text-xs">
              {t('seconds')}
            </Label>
            <TimePickerEntryInput
              picker="seconds"
              id="seconds12"
              ref={secondRef}
              onLeftFocus={() => minuteRef.current?.focus()}
              onRightFocus={() => periodRef.current?.focus()}
              {...props}
            />
          </div>
        )}
        <div className="flex flex-col items-center gap-1 text-center">
          <Label htmlFor="period" className="text-xs">
            {t('period')}
          </Label>
          <TimePeriodSelect
            period={period}
            setPeriod={setPeriod}
            ref={periodRef}
            onLeftFocus={() => secondRef.current?.focus()}
            {...props}
          />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          props.onDateChange(new Date());
          props.onSetToNow?.();
        }}
      >
        {t('setToNow')}
      </Button>
    </div>
  );
}

function TimePickerInput24h(
  props: TimeInputProps &
    Required<Pick<TimeInputProps, 'date' | 'onDateChange'>> & { onSetToNow?: () => void },
) {
  const t = useTranslations('base.components.TimePicker');

  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="grid gap-1 text-center">
          <Label htmlFor="hours" className="text-xs">
            {t('hours')}
          </Label>
          <TimePickerEntryInput
            picker="hours"
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
            {...props}
          />
        </div>
        <div className="grid gap-1 text-center">
          <Label htmlFor="minutes" className="text-xs">
            {t('minutes')}
          </Label>
          <TimePickerEntryInput
            picker="minutes"
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => secondRef.current?.focus()}
            {...props}
          />
        </div>
        {props.includeSeconds && (
          <div className="grid gap-1 text-center">
            <Label htmlFor="seconds" className="text-xs">
              {t('seconds')}
            </Label>
            <TimePickerEntryInput
              picker="seconds"
              ref={secondRef}
              onLeftFocus={() => minuteRef.current?.focus()}
              {...props}
            />
          </div>
        )}
        <div className="flex h-10 items-center">
          <ClockIcon className="ml-2 h-4 w-4" />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          props.onDateChange(new Date());
          props.onSetToNow?.();
        }}
      >
        {t('setToNow')}
      </Button>
    </div>
  );
}

interface TimePickerEntryInputProps extends ComponentProps<typeof Input> {
  picker: TimePickerType;
  date: Date;
  onDateChange: (date: Date) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

function TimePickerEntryInput({
  className,
  type = 'tel',
  value,
  id,
  name,
  date,
  onDateChange,
  onChange,
  onKeyDown,
  picker,
  period,
  onLeftFocus,
  onRightFocus,
  ...props
}: TimePickerEntryInputProps) {
  const [flag, setFlag] = useState<boolean>(false);
  const [prevIntKey, setPrevIntKey] = useState<string>('0');

  /**
   * allow the user to enter the second digit within 2 seconds
   * otherwise start again with entering first digit
   */
  useEffect(() => {
    if (flag) {
      const timer = setTimeout(() => {
        setFlag(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flag]);

  const calculatedValue = getDateByType(date, picker);

  const calculateNewValue = (key: string) => {
    /*
     * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
     * The second entered digit will break the condition and the value will be set to 10-12.
     */
    if (picker === '12hours') {
      if (flag && calculatedValue.slice(1, 2) === '1' && prevIntKey === '0') return '0' + key;
    }

    return !flag ? '0' + key : calculatedValue.slice(1, 2) + key;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') return;
    e.preventDefault();
    if (e.key === 'ArrowRight') onRightFocus?.();
    if (e.key === 'ArrowLeft') onLeftFocus?.();
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      const step = e.key === 'ArrowUp' ? 1 : -1;
      const newValue = getArrowByType(calculatedValue, step, picker);
      if (flag) setFlag(false);
      const tempDate = new Date(date);
      onDateChange(setDateByType(tempDate, newValue, picker, period));
    }
    if (e.key >= '0' && e.key <= '9') {
      if (picker === '12hours') setPrevIntKey(e.key);

      const newValue = calculateNewValue(e.key);
      if (flag) onRightFocus?.();
      setFlag((prev) => !prev);
      const tempDate = new Date(date);
      onDateChange(setDateByType(tempDate, newValue, picker, period));
    }
  };

  return (
    <Input
      id={id || picker}
      name={name || picker}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground w-[48px] text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none',
        className,
      )}
      value={value || calculatedValue}
      onChange={(e) => {
        e.preventDefault();
        onChange?.(e);
      }}
      type={type}
      inputMode="decimal"
      onKeyDown={(e) => {
        onKeyDown?.(e);
        handleKeyDown(e);
      }}
      {...props}
    />
  );
}

interface PeriodSelectorProps {
  period: Period;
  setPeriod: (m: Period) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
  ref?: Ref<HTMLButtonElement>;
  disabled?: boolean;
  readOnly?: boolean;
}

function TimePeriodSelect({
  period,
  setPeriod,
  date,
  onDateChange,
  disabled,
  readOnly,
}: PeriodSelectorProps) {
  const handleValueChange = (value: Period) => {
    setPeriod(value);

    /**
     * trigger an update whenever the user switches between AM and PM;
     * otherwise user must manually change the hour each time
     */
    if (date) {
      const tempDate = new Date(date);
      const hours = display12HourValue(date.getHours());
      onDateChange(
        setDateByType(tempDate, hours.toString(), '12hours', period === 'AM' ? 'PM' : 'AM'),
      );
    }
  };

  return (
    <div className="flex items-center">
      <Select
        multiple={false}
        options={[
          { value: 'AM', label: 'AM' },
          { value: 'PM', label: 'PM' },
        ]}
        value={period}
        onChange={(value: string | undefined) => handleValueChange(value as Period)}
        disabled={disabled || readOnly}
        searchable={false}
        triggerClassName="h-10"
      />
    </div>
  );
}

/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(value: string, { max, min = 0, loop = false }: GetValidNumberConfig) {
  let numericValue = parseInt(value, 10);

  if (!isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, '0');
  }

  return '00';
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
  let numericValue = parseInt(value, 10);
  if (!isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return '00';
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours';
type Period = 'AM' | 'PM';

function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value);
    case 'seconds':
      return setSeconds(date, value);
    case 'hours':
      return setHours(date, value);
    case '12hours': {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case 'hours':
      return getValidHour(String(date.getHours()));
    case '12hours':
      const hours = display12HourValue(date.getHours());
      return getValid12Hour(String(hours));
    default:
      return '00';
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step);
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step);
    case 'hours':
      return getValidArrowHour(value, step);
    case '12hours':
      return getValidArrow12Hour(value, step);
    default:
      return '00';
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') {
    if (hour <= 11) {
      return hour + 12;
    } else {
      return hour;
    }
  } else if (period === 'AM') {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return '12';
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}
