'use client';

import { Check, Dumbbell, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/base/components/ui/card';
import { Label } from '@/base/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/base/components/ui/radio-group';

import { type ActivityLevel, activityLevelService } from '../services/activity-level.service';

interface Props {
  currentLevel?: ActivityLevel;
  onSave: (level: ActivityLevel) => Promise<boolean>;
}

// Vietnamese translations for activity levels
const activityLevelVietnamseNames: Record<ActivityLevel, string> = {
  Sedentary: 'Ít Hoạt Động',
  Light: 'Nhẹ',
  Moderate: 'Vừa Phải',
  Active: 'Tích Cực',
  VeryActive: 'Rất Tích Cực',
};

export function ActivityLevelSelector({ currentLevel, onSave }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel>(currentLevel || 'Sedentary');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync selectedLevel when currentLevel prop changes (e.g., after page load with profile data)
  useEffect(() => {
    if (currentLevel) {
      setSelectedLevel(currentLevel);
      setHasChanges(false);
    }
  }, [currentLevel]);

  const activityLevels = activityLevelService.getAllActivityLevels();

  const handleChange = (level: ActivityLevel) => {
    setSelectedLevel(level);
    setHasChanges(level !== currentLevel);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(selectedLevel);
    setSaving(false);
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <Card className="border-0 p-0 pb-6 shadow-md">
      <CardHeader className="rounded-tl-lg border-b-2 border-[#99b94a] bg-gradient-to-r from-[#f0f5f2] to-white px-4 py-2">
        <CardTitle className="flex items-center gap-2 text-lg text-[#5a6f2a]">
          Mức Độ Hoạt Động
        </CardTitle>
        <p className="mt-1 flex items-center gap-2 text-xs text-gray-600">
          <Lightbulb className="h-4 w-4 text-[#99b94a]" />
          Ảnh hưởng đến Tổng Lượng Năng Lượng Tiêu Thụ Hàng Ngày (TDEE)
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <RadioGroup value={selectedLevel} onValueChange={handleChange}>
          <div className="space-y-2">
            {activityLevels.map((level) => (
              <div
                key={level.level}
                className={`flex cursor-pointer items-start space-x-3 rounded-lg border-2 p-3 transition-all ${
                  selectedLevel === level.level
                    ? 'border-[#99b94a] bg-[#f0f5f2]'
                    : 'border-gray-200 hover:border-[#99b94a] hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem value={level.level} id={level.level} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={level.level} className="cursor-pointer font-medium text-gray-900">
                    {activityLevelVietnamseNames[level.level]}{' '}
                    <span className="font-bold text-[#99b94a]">×{level.factor}</span>
                  </Label>
                  <p className="mt-1 text-sm text-gray-600">{level.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <Dumbbell className="inline-block h-4 w-4 text-[#99b94a]" />{' '}
                    {level.exerciseFrequency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        {hasChanges && (
          <div className="mt-5">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 bg-[#99b94a] py-2 font-semibold text-white hover:bg-[#7a9936]"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Đang Lưu...' : 'Lưu Mức Độ Hoạt Động'}
            </Button>
          </div>
        )}

        {!hasChanges && currentLevel && (
          <p className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-[#f0f5f2] py-2 text-center text-sm font-medium text-[#5a6f2a]">
            <Check className="h-4 w-4" />
            Hiện tại: {activityLevelVietnamseNames[currentLevel]}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
