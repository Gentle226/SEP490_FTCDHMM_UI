'use client';

import { Goal, History, Library, Sparkles, Target } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { CurrentGoalHero, GoalSelector, HealthGoalHistory } from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
                <Goal className="h-7 w-7 text-[#99b94a]" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                  Mục Tiêu Sức Khỏe
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Quản lý mục tiêu sức khỏe của bạn và theo dõi các chỉ số dinh dưỡng
                </p>
              </div>
            </div>
          </div>

          {/* Current Goal Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#99b94a]/10 via-emerald-50 to-transparent p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#99b94a] to-emerald-500 shadow-lg shadow-[#99b94a]/30">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-[#99b94a] to-emerald-600 bg-clip-text text-lg font-bold text-transparent">
                  Mục Tiêu Hiện Tại
                </h2>
                <p className="text-sm text-gray-500">Mục tiêu sức khỏe bạn đang theo đuổi</p>
              </div>
            </div>
            <CurrentGoalHero />
          </section>

          {/* Goal Selection Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Library className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
                  Thư Viện Mục Tiêu
                </h2>
                <p className="text-sm text-gray-500">
                  Chọn từ mục tiêu có sẵn hoặc tạo mục tiêu tùy chỉnh
                </p>
              </div>
            </div>
            <GoalSelector />
          </section>

          {/* Health Goal History Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-50 via-orange-50 to-transparent p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-lg font-bold text-transparent">
                  Lịch Sử Mục Tiêu
                </h2>
                <p className="text-sm text-gray-500">Xem lại các mục tiêu đã hoàn thành</p>
              </div>
            </div>
            <HealthGoalHistory />
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
