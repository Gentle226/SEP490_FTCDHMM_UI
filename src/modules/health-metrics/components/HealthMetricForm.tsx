'use client';

import { Activity, Check, FileText, Ruler, Scale, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/base/components/ui/card';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Textarea } from '@/base/components/ui/textarea';

import type { CreateUserHealthMetricRequest } from '../types/health-metric.types';
import { calculateBMI, getBMIStatus, validateHealthMetric } from '../utils/validation';

interface Props {
  onSubmit: (data: CreateUserHealthMetricRequest) => Promise<boolean>;
  onCancel?: () => void;
  initialData?: Partial<CreateUserHealthMetricRequest>;
  isEdit?: boolean;
}

export function HealthMetricForm({ onSubmit, onCancel, initialData, isEdit = false }: Props) {
  const [formData, setFormData] = useState<CreateUserHealthMetricRequest>({
    weightKg: initialData?.weightKg || 0,
    heightCm: initialData?.heightCm || 0,
    bodyFatPercent: initialData?.bodyFatPercent,
    muscleMassKg: initialData?.muscleMassKg,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        weightKg: initialData.weightKg || 0,
        heightCm: initialData.heightCm || 0,
        bodyFatPercent: initialData.bodyFatPercent,
        muscleMassKg: initialData.muscleMassKg,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const bmi =
    formData.weightKg > 0 && formData.heightCm > 0
      ? calculateBMI(formData.weightKg, formData.heightCm)
      : 0;

  // BMI Status Vietnamese translation
  const getBMIStatusVietnamese = (status: string): string => {
    const translations: Record<string, string> = {
      Underweight: 'Thiếu Cân',
      'Normal Weight': 'Bình Thường',
      Overweight: 'Thừa Cân',
      Obese: 'Béo Phì',
    };
    return translations[status] || status;
  };

  const handleChange = (
    field: keyof CreateUserHealthMetricRequest,
    value: string | number | undefined,
  ) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateHealthMetric(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setSubmitting(true);
    const success = await onSubmit(formData);
    setSubmitting(false);

    if (success && !isEdit) {
      // Reset form on successful create
      setFormData({
        weightKg: 0,
        heightCm: 0,
        bodyFatPercent: undefined,
        muscleMassKg: undefined,
        notes: '',
      });
    }
  };

  return (
    <Card className="rounded-tl-lg border-0 pt-0 pb-6 shadow-md">
      <CardHeader className="rounded-tl-lg border-b-2 border-[#99b94a] bg-gradient-to-r from-[#f0f5f2] to-white px-3 py-2 sm:px-4 sm:py-3">
        <CardTitle className="flex items-center gap-2 pt-1 text-lg text-[#5a6f2a] sm:text-xl">
          {isEdit ? 'Chỉnh Sửa' : 'Ghi Lại'} Số Liệu Sức Khỏe
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-4 sm:px-6 md:px-12">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Weight and Height - Same Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Weight */}
            <div>
              <Label
                htmlFor="weightKg"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 sm:gap-2"
              >
                <Scale className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cân Nặng</span>
                <span className="sm:hidden">Cân Nặng</span>
                <span className="text-xs text-gray-500">(kg)</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                placeholder="0.1-300 kg"
                value={formData.weightKg || ''}
                onChange={(e) => handleChange('weightKg', parseFloat(e.target.value) || 0)}
                className={`mt-2 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a] ${errors.weightKg ? 'border-red-500' : ''}`}
              />
              {errors.weightKg && <p className="mt-1 text-sm text-red-500">⚠ {errors.weightKg}</p>}
            </div>

            {/* Height */}
            <div>
              <Label
                htmlFor="heightCm"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 sm:gap-2"
              >
                <Ruler className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Chiều Cao</span>
                <span className="sm:hidden">Chiều Cao</span>
                <span className="text-xs text-gray-500">(cm)</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                placeholder="30-250 cm"
                value={formData.heightCm || ''}
                onChange={(e) => handleChange('heightCm', parseFloat(e.target.value) || 0)}
                className={`mt-2 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a] ${errors.heightCm ? 'border-red-500' : ''}`}
              />
              {errors.heightCm && <p className="mt-1 text-sm text-red-500">⚠ {errors.heightCm}</p>}
            </div>
          </div>

          {/* BMI Preview */}
          {bmi > 0 && (
            <div className="rounded-lg border-2 border-[#99b94a] bg-gradient-to-r from-[#f0f5f2] to-white p-3 sm:p-4">
              <p className="text-[10px] font-semibold tracking-wide text-[#5a6f2a] uppercase sm:text-xs">
                Xem Trước BMI
              </p>
              <p
                className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl"
                data-bmi-value={bmi}
                data-bmi-status={getBMIStatus(bmi)}
              >
                <span
                  className={`${bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-[#99b94a]' : bmi < 30 ? 'text-amber-600' : 'text-red-600'}`}
                >
                  {bmi.toFixed(1)}
                </span>
                <span className="ml-2 text-sm text-gray-600 sm:text-lg">
                  {getBMIStatusVietnamese(getBMIStatus(bmi))}
                </span>
              </p>
            </div>
          )}

          {/* Body Fat and Muscle Mass - Same Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Body Fat */}
            <div>
              <Label
                htmlFor="bodyFatPercent"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 sm:gap-2"
              >
                <Activity className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Tỷ Lệ Mỡ Cơ Thể</span>
                <span className="sm:hidden">Tỷ Lệ Mỡ Cơ Thể</span>
                <span className="text-xs text-gray-500">(%)</span>
              </Label>
              <Input
                id="bodyFatPercent"
                type="number"
                step="0.1"
                placeholder="2-70 %"
                value={formData.bodyFatPercent || ''}
                onChange={(e) =>
                  handleChange(
                    'bodyFatPercent',
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className={`mt-2 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a] ${errors.bodyFatPercent ? 'border-red-500' : ''}`}
              />
              {errors.bodyFatPercent && (
                <p className="mt-1 text-sm text-red-500">⚠ {errors.bodyFatPercent}</p>
              )}
            </div>

            {/* Muscle Mass */}
            <div>
              <Label
                htmlFor="muscleMassKg"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 sm:gap-2"
              >
                <Zap className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Khối Lượng Cơ</span>
                <span className="sm:hidden">Khối Lượng Cơ</span>
                <span className="text-xs text-gray-500">(kg)</span>
              </Label>
              <Input
                id="muscleMassKg"
                type="number"
                step="0.1"
                placeholder="10-150 kg"
                value={formData.muscleMassKg || ''}
                onChange={(e) =>
                  handleChange(
                    'muscleMassKg',
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className={`mt-2 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a] ${errors.muscleMassKg ? 'border-red-500' : ''}`}
              />
              {errors.muscleMassKg && (
                <p className="mt-1 text-sm text-red-500">⚠ {errors.muscleMassKg}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="notes"
              className="flex items-center gap-1 text-sm font-medium text-gray-900 sm:gap-2"
            >
              <FileText className="h-3.5 w-3.5 text-[#99b94a] sm:h-4 sm:w-4" />
              Ghi Chú <span className="text-xs text-gray-400">(tùy chọn)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Thêm ghi chú về số liệu sức khỏe của bạn..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              maxLength={300}
              className={`mt-2 border-gray-300 focus:border-[#99b94a] focus:ring-[#99b94a] ${errors.notes ? 'border-red-500' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">{formData.notes?.length || 0}/300 ký tự</p>
            {errors.notes && <p className="mt-1 text-sm text-red-500">⚠ {errors.notes}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 px-0 pb-2 sm:gap-3 sm:px-6 sm:pb-6">
            <Button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-1.5 bg-[#99b94a] py-2 text-sm font-semibold text-white hover:bg-[#7a9936] sm:gap-2 sm:text-base"
            >
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {submitting ? 'Đang Lưu...' : isEdit ? 'Cập Nhật' : 'Ghi Lại'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center justify-center gap-1.5 border-[#99b94a] text-sm text-[#5a6f2a] hover:bg-[#f0f5f2] sm:gap-2 sm:text-base"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Hủy Bỏ
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
