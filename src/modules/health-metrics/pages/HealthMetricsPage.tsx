'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ActivityLevelSelector } from '../components/ActivityLevelSelector';
import { HealthMetricForm } from '../components/HealthMetricForm';
import { MetricsHistory } from '../components/MetricsHistory';
import { useHealthMetrics } from '../hooks/useHealthMetrics';
import { activityLevelService } from '../services/activity-level.service';
import type {
  ActivityLevel,
  CreateUserHealthMetricRequest,
  UpdateUserHealthMetricRequest,
  UserHealthMetricResponse,
} from '../types/health-metric.types';

export function HealthMetricsPage() {
  const {
    metrics,
    loading,
    error,
    getHistory,
    create,
    update,
    delete: deleteMetric,
  } = useHealthMetrics();
  const [currentActivityLevel, setCurrentActivityLevel] = useState<ActivityLevel>('Sedentary');
  const [editingMetric, setEditingMetric] = useState<UserHealthMetricResponse | null>(null);
  const [showActivityLevelSuccess, setShowActivityLevelSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user's current activity level
        const activityLevel = await activityLevelService.getActivityLevel();
        if (activityLevel) {
          setCurrentActivityLevel(activityLevel);
        }
        // Load metrics history
        await getHistory();
      } catch (error) {
        console.error('Failed to load activity level:', error);
      }
    };
    loadData();
  }, [getHistory]);

  const handleCreateMetric = async (data: CreateUserHealthMetricRequest) => {
    const success = await create(data);
    if (success) {
      toast.success('Ghi lại số liệu sức khỏe thành công!');
    }
    return success;
  };

  const handleUpdateMetric = async (data: UpdateUserHealthMetricRequest) => {
    if (!editingMetric) return false;
    const success = await update(editingMetric.id, data);
    if (success) {
      toast.success('Cập nhật số liệu sức khỏe thành công!');
      setEditingMetric(null);
    }
    return success;
  };

  const handleDeleteMetric = async (metricId: string) => {
    const success = await deleteMetric(metricId);
    if (success) {
      toast.success('Xóa số liệu sức khỏe thành công!');
    } else {
      toast.error(`Không thể xóa số liệu: ${error || 'Lỗi không xác định'}`);
    }
    return success;
  };

  const handleSaveActivityLevel = async (level: ActivityLevel) => {
    try {
      await activityLevelService.changeActivityLevel(level);
      setCurrentActivityLevel(level);
      toast.success('Mức độ hoạt động đã được cập nhật thành công!');
      setShowActivityLevelSuccess(true);
      setTimeout(() => setShowActivityLevelSuccess(false), 3000);
      // Refresh metrics to get updated TDEE
      await getHistory();
      return true;
    } catch {
      toast.error('Không thể cập nhật mức độ hoạt động');
      return false;
    }
  };

  const handleEditMetric = (metric: UserHealthMetricResponse) => {
    setEditingMetric(metric);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
  };

  return (
    <div className="min-h-screenbg-gradient-to-b from-white to-[#f0f5f2]">
      <div className="container mx-auto max-w-7xl px-4 pt-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-[#99b94a]">Số Liệu Sức Khỏe</h1>
          <p className="text-gray-600">
            Theo dõi và quản lý dữ liệu sức khỏe của bạn để đạt được mục tiêu sức khỏe
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {showActivityLevelSuccess && (
          <div className="mb-4 rounded-lg border border-[#99b94a] bg-[#f0f5f2] px-4 py-3 text-[#5a6f2a]">
            ✓ Mức độ hoạt động đã được cập nhật thành công!
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Forms */}
          <div className="space-y-6 lg:col-span-2">
            {/* Health Metric Form */}
            <HealthMetricForm
              onSubmit={editingMetric ? handleUpdateMetric : handleCreateMetric}
              onCancel={editingMetric ? handleCancelEdit : undefined}
              initialData={editingMetric || undefined}
              isEdit={!!editingMetric}
            />

            {/* Metrics History */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Lịch Sử Của Bạn</h2>
              <MetricsHistory
                metrics={metrics}
                onDelete={handleDeleteMetric}
                onEdit={handleEditMetric}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column: Activity Level & Summary */}
          <div className="space-y-6">
            <ActivityLevelSelector
              currentLevel={currentActivityLevel}
              onSave={handleSaveActivityLevel}
            />

            {/* Latest Metrics Summary */}
            {metrics.length > 0 && (
              <div className="rounded-lg border-2 border-[#99b94a] bg-gradient-to-br from-[#f0f5f2] to-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#99b94a]"></div>
                  <h3 className="font-semibold text-gray-900">Số Liệu Mới Nhất</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cân nặng:</span>
                    <span className="font-semibold text-gray-900">{metrics[0].weightKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">BMI:</span>
                    <span className="font-semibold text-gray-900">{metrics[0].bmi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">BMR:</span>
                    <span className="font-semibold text-gray-900">{metrics[0].bmr} kcal</span>
                  </div>
                  <div className="border-t border-[#99b94a] pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-[#5a6f2a]">
                        Calo Hàng Ngày (TDEE):
                      </span>
                      <span className="font-bold text-[#99b94a]">{metrics[0].tdee} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
