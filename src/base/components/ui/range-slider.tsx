import { Input } from './input';
import { Slider } from './slider';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: [min: number, max: number];
  onChange?: (value: [min: number, max: number]) => void;
  numberFormat?: (value: number) => string;
}

export function RangeSlider({
  min,
  max,
  step,
  value,
  numberFormat = (value) => value.toString(),
  onChange,
}: RangeSliderProps) {
  return (
    <div className="space-y-4">
      <div className="px-3">
        <Slider value={value} min={min} max={max} step={step} onValueChange={onChange} />
      </div>
      <div className="flex justify-between px-3 text-xs font-medium tracking-wide text-gray-500 uppercase">
        <span>Tối thiểu</span>
        <span>Tối đa</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            value={value ? numberFormat(value[0]) : ''}
            readOnly
            className="border-gray-200 bg-gray-50 text-center font-medium"
          />
        </div>
        <div className="">-</div>
        <div className="flex-1">
          <Input
            value={value ? numberFormat(value[1]) : ''}
            readOnly
            className="border-gray-200 bg-gray-50 text-center font-medium"
          />
        </div>
      </div>
    </div>
  );
}
