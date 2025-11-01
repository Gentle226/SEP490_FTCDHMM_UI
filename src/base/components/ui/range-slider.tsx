import * as SliderPrimitive from '@radix-ui/react-slider';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/base/lib';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: [min: number, max: number];
  onChange?: (value: [min: number, max: number]) => void;
  numberFormat?: (value: number) => string;
  unit?: string;
}

export function RangeSlider({
  min,
  max,
  step,
  value,
  numberFormat = (value) => value.toString(),
  onChange,
  unit = '',
}: RangeSliderProps) {
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);
  const [minInputValue, setMinInputValue] = useState<string>(value ? value[0].toString() : '');
  const [maxInputValue, setMaxInputValue] = useState<string>(value ? value[1].toString() : '');

  // Sync input values when slider value changes from form
  useEffect(() => {
    if (value) {
      setMinInputValue(value[0].toString());
      setMaxInputValue(value[1].toString());
    }
  }, [value]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMinInputValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && value && numValue <= value[1]) {
      onChange?.([numValue, value[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMaxInputValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && value && numValue >= value[0]) {
      onChange?.([value[0], numValue]);
    }
  };

  const handleSliderChange = (newValue: [number, number]) => {
    setMinInputValue(newValue[0].toString());
    setMaxInputValue(newValue[1].toString());
    onChange?.(newValue);
  };

  const stopDragAndFocusMin = (e: React.SyntheticEvent) => {
    // CHỈ chặn lan truyền – KHÔNG preventDefault
    e.stopPropagation();
    // đảm bảo focus (nhất là mobile)
    minInputRef.current?.focus();
  };

  const stopDragAndFocusMax = (e: React.SyntheticEvent) => {
    // CHỈ chặn lan truyền – KHÔNG preventDefault
    e.stopPropagation();
    // đảm bảo focus (nhất là mobile)
    maxInputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* Slider with integrated input boxes in thumbs */}
      <div className="relative pt-12">
        <SliderPrimitive.Root
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className={cn('relative flex w-full touch-none items-center select-none')}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-gray-800" />
          </SliderPrimitive.Track>

          {/* Min Thumb with Input */}
          <SliderPrimitive.Thumb className="group relative block size-4 shrink-0 rounded-full border-2 border-gray-400 bg-white shadow-sm focus-visible:outline-none">
            {/* Wrapper không bắt sự kiện, để thumb vẫn kéo bình thường */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 flex -translate-x-1/2 flex-col items-center">
              {/* Input Box được bật sự kiện để có thể click/nhập */}
              <div
                className="pointer-events-auto flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 whitespace-nowrap shadow-sm"
                onPointerDownCapture={stopDragAndFocusMin}
                onMouseDownCapture={stopDragAndFocusMin}
                onTouchStartCapture={stopDragAndFocusMin}
              >
                <input
                  ref={minInputRef}
                  type="number"
                  step={step || 1}
                  min={min}
                  max={value ? value[1] : max}
                  value={minInputValue}
                  onChange={handleMinInputChange}
                  onClick={(e) => e.stopPropagation()}
                  title="Giá trị tối thiểu"
                  placeholder="Min"
                  className="slider-input w-12 text-center text-sm font-medium focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
              {/* Arrow pointing down */}
              <div className="mx-auto h-0 w-0 border-t-[6px] border-r-[6px] border-l-[6px] border-t-gray-300 border-r-transparent border-l-transparent" />
            </div>
          </SliderPrimitive.Thumb>

          {/* Max Thumb with Input */}
          <SliderPrimitive.Thumb className="group relative block size-4 shrink-0 rounded-full border-2 border-gray-400 bg-white shadow-sm focus-visible:outline-none">
            {/* Wrapper không bắt sự kiện, để thumb vẫn kéo bình thường */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 flex -translate-x-1/2 flex-col items-center">
              {/* Input Box được bật sự kiện để có thể click/nhập */}
              <div
                className="pointer-events-auto flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 whitespace-nowrap shadow-sm"
                onPointerDownCapture={stopDragAndFocusMax}
                onMouseDownCapture={stopDragAndFocusMax}
                onTouchStartCapture={stopDragAndFocusMax}
              >
                <input
                  ref={maxInputRef}
                  type="number"
                  step={step || 1}
                  min={value ? value[0] : min}
                  max={max}
                  value={maxInputValue}
                  onChange={handleMaxInputChange}
                  onClick={(e) => e.stopPropagation()}
                  title="Giá trị tối đa"
                  placeholder="Max"
                  className="slider-input w-12 text-center text-sm font-medium focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
              {/* Arrow pointing down */}
              <div className="mx-auto h-0 w-0 border-t-[6px] border-r-[6px] border-l-[6px] border-t-gray-300 border-r-transparent border-l-transparent" />
            </div>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>

      {/* Labels */}
      <div className="flex justify-between px-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
        <span>{numberFormat(min)}</span>
        <span>{numberFormat(max)}</span>
      </div>
    </div>
  );
}
