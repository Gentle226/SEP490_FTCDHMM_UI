'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BarChart3, Calendar, Clock, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/base/components/ui/card';

import type { UserHealthMetricResponse } from '../types/health-metric.types';
import { getBMIStatus } from '../utils/validation';

interface Props {
  metrics: UserHealthMetricResponse[];
  onDelete: (metricId: string) => Promise<boolean>;
  onEdit?: (metric: UserHealthMetricResponse) => void;
  loading?: boolean;
}

export function MetricsHistory({ metrics, onDelete, onEdit, loading }: Props) {
  const handleDelete = async (metricId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
      await onDelete(metricId);
    }
  };

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

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#99b94a] border-t-transparent"></div>
            <p className="text-gray-500">Đang tải số liệu sức khỏe của bạn...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="mb-4">
            <BarChart3 className="h-12 w-12 text-[#99b94a]" />
          </div>
          <p className="text-center text-gray-600">
            Chưa có số liệu sức khỏe nào được ghi lại. Bắt đầu bằng cách thêm bản ghi đầu tiên của
            bạn!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="border-0 shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="border-b border-gray-200 px-4 py-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Calendar className="h-4 w-4 text-[#99b94a]" />
                  {format(new Date(metric.recordedAt), 'PPPP', { locale: vi })}
                </CardTitle>
                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 text-[#99b94a]" />
                  {format(new Date(metric.recordedAt), 'p', { locale: vi })}
                </p>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(metric)}
                    className="text-[#99b94a] hover:bg-[#f0f5f2] hover:text-[#5a6f2a]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(metric.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Weight */}
              <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">Cân Nặng</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {metric.weightKg} <span className="text-sm text-gray-500">kg</span>
                </p>
              </div>

              {/* Height */}
              <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">Chiều Cao</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {metric.heightCm} <span className="text-sm text-gray-500">cm</span>
                </p>
              </div>

              {/* BMI */}
              <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">BMI</p>
                <p className="mt-1 text-lg font-bold">
                  <span
                    className={`${metric.bmi < 18.5 ? 'text-blue-600' : metric.bmi < 25 ? 'text-[#99b94a]' : metric.bmi < 30 ? 'text-amber-600' : 'text-red-600'}`}
                  >
                    {metric.bmi}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {getBMIStatusVietnamese(getBMIStatus(metric.bmi))}
                </p>
              </div>

              {/* BMR */}
              <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">BMR</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{metric.bmr}</p>
              </div>

              {/* TDEE */}
              <div className="rounded-lg border-2 border-[#99b94a] bg-gradient-to-br from-[#f0f5f2] to-white p-3 md:col-span-2">
                <p className="text-xs font-semibold text-[#5a6f2a] uppercase">
                  Calo Hàng Ngày (TDEE)
                </p>
                <p className="mt-1 text-lg font-bold text-[#99b94a]">{metric.tdee}</p>
              </div>

              {/* Body Fat */}
              {metric.bodyFatPercent !== undefined && (
                <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Tỷ Lệ Mỡ</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {metric.bodyFatPercent} <span className="text-sm text-gray-500">%</span>
                  </p>
                </div>
              )}

              {/* Muscle Mass */}
              {metric.muscleMassKg !== undefined && (
                <div className="rounded-lg bg-gradient-to-br from-[#f0f5f2] to-white p-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Khối Lượng Cơ</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {metric.muscleMassKg} <span className="text-sm text-gray-500">kg</span>
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {metric.notes && (
              <div className="mt-4 rounded-lg border-l-4 border-[#99b94a] bg-[#f0f5f2] p-3">
                <p className="text-xs font-semibold text-[#5a6f2a] uppercase">Ghi Chú</p>
                <p className="mt-1 text-sm text-gray-700">{metric.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
