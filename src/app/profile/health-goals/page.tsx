'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { CurrentGoalHero, GoalSelector } from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mục Tiêu Sức Khỏe</h1>
            <p className="mt-2 text-gray-600">
              Quản lý mục tiêu sức khỏe của bạn và theo dõi các chỉ số dinh dưỡng
            </p>
          </div>

          {/* Current Goal Hero Card */}
          <CurrentGoalHero />

          {/* Goal Selection Section */}
          <GoalSelector />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
