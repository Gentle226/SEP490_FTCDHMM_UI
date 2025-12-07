'use client';

import { ChefHat, Clock, Flame, Users, UtensilsCrossed } from 'lucide-react';

import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Select } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';

import { Difficulty } from './types';

interface RecipeBasicInfoProps {
  name: string;
  description: string;
  difficulty: Difficulty;
  cookTime: number;
  ration: number;
  isNameFocused: boolean;
  isDescriptionFocused: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onCookTimeChange: (value: number) => void;
  onRationChange: (value: number) => void;
  onNameFocusChange: (focused: boolean) => void;
  onDescriptionFocusChange: (focused: boolean) => void;
}

export function RecipeBasicInfo({
  name,
  description,
  difficulty,
  cookTime,
  ration,
  isNameFocused,
  isDescriptionFocused,
  onNameChange,
  onDescriptionChange,
  onDifficultyChange,
  onCookTimeChange,
  onRationChange,
  onNameFocusChange,
  onDescriptionFocusChange,
}: RecipeBasicInfoProps) {
  const handleInvalidField = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    if (input.validity.valueMissing) {
      input.setCustomValidity('Vui lòng điền vào trường này');
    } else if (input.validity.rangeUnderflow) {
      input.setCustomValidity('Giá trị phải lớn hơn 0');
    } else if (input.validity.rangeOverflow) {
      input.setCustomValidity('Giá trị quá lớn');
    }
  };

  const handleInvalidTextarea = (e: React.InvalidEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    if (textarea.validity.valueMissing) {
      textarea.setCustomValidity('Vui lòng điền vào trường này');
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      {/* Recipe Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-1">
          <ChefHat className="h-4 w-4 text-[#99b94a]" />
          Tên món
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Tên món ăn của bạn"
          value={name ?? ''}
          onChange={(e) => onNameChange(e.target.value.slice(0, 200))}
          onFocus={() => onNameFocusChange(true)}
          onBlur={() => onNameFocusChange(false)}
          onInvalid={handleInvalidField}
          maxLength={200}
        />
        <p
          className={`text-right text-xs transition-opacity ${isNameFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
        >
          {name.length}/200
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-1">
          <UtensilsCrossed className="h-4 w-4 text-[#99b94a]" />
          Mô tả
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Hãy chia sẻ với mọi người về món này của bạn nhé - ai đã truyền cảm hứng cho bạn, tại sao nó đặc biệt, bạn thích thưởng thức nó như thế nào..."
          rows={2}
          value={description ?? ''}
          onChange={(e) => onDescriptionChange(e.target.value.slice(0, 2000))}
          onFocus={() => onDescriptionFocusChange(true)}
          onBlur={() => onDescriptionFocusChange(false)}
          onInvalid={handleInvalidTextarea}
          maxLength={2000}
          className="w-full break-words sm:min-h-24 md:min-h-28"
        />
        <p
          className={`text-right text-xs transition-opacity ${isDescriptionFocused ? 'text-gray-500 opacity-100' : 'text-gray-300 opacity-0'}`}
        >
          {description.length}/2000
        </p>
      </div>

      {/* Difficulty, Cook Time, Ration - Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Difficulty */}
        <div className="space-y-2">
          <Label
            htmlFor="difficulty"
            className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm"
          >
            <Flame className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
            Độ khó
            <span className="text-red-500">*</span>
          </Label>
          <Select
            options={[
              { value: 'Easy', label: 'Dễ' },
              { value: 'Medium', label: 'Trung bình' },
              { value: 'Hard', label: 'Khó' },
            ]}
            value={difficulty}
            onChange={(value) => onDifficultyChange(value as Difficulty)}
            placeholder="Chọn độ khó"
            searchable={false}
          />
        </div>

        {/* Cook Time */}
        <div className="space-y-2">
          <Label htmlFor="cookTime" className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
            <Clock className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Thời gian nấu</span>
            <span className="sm:hidden">T.gian</span>
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="cookTime"
              type="number"
              placeholder="30"
              value={cookTime}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onCookTimeChange(Math.min(Math.max(val, 1), 1440));
              }}
              min="1"
              max="1440"
              step="1"
              className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
              phút
            </span>
          </div>
        </div>

        {/* Ration */}
        <div className="space-y-2">
          <Label htmlFor="ration" className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
            <Users className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
            Khẩu phần
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="ration"
              type="number"
              placeholder="2"
              value={ration}
              onChange={(e) => onRationChange(parseInt(e.target.value) || 1)}
              onInvalid={handleInvalidField}
              min="1"
              className="pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-gray-500">
              người
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
