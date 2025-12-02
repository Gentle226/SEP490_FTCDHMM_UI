'use client';

import { Goal, History, Library, Target } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { CurrentGoalHero, GoalSelector, HealthGoalHistory } from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 px-2 sm:space-y-8 sm:px-0">
          {/* Header Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10 sm:h-14 sm:w-14">
                <Goal className="h-5 w-5 text-[#99b94a] sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold tracking-tight text-[#99b94a] sm:text-2xl">
                  Mục Tiêu Sức Khỏe
                </h1>
                <p className="text-muted-foreground mt-1 hidden text-sm sm:block">
                  Quản lý mục tiêu sức khỏe của bạn và theo dõi các chỉ số dinh dưỡng
                </p>
              </div>
            </div>
          </div>

          {/* Current Goal Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#99b94a]/10 via-emerald-50 to-transparent p-3 sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#99b94a] to-emerald-500 shadow-lg shadow-[#99b94a]/30 sm:h-10 sm:w-10">
                <Target className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-[#99b94a] to-emerald-600 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                  Mục Tiêu Hiện Tại
                </h2>
                <p className="hidden text-sm text-gray-500 sm:block">
                  Mục tiêu sức khỏe bạn đang theo đuổi
                </p>
              </div>
            </div>
            <CurrentGoalHero />
          </section>

          {/* Goal Selection Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent p-3 sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 sm:h-10 sm:w-10">
                <Library className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                  Thư Viện Mục Tiêu
                </h2>
                <p className="hidden text-sm text-gray-500 sm:block">
                  Chọn từ mục tiêu có sẵn hoặc tạo mục tiêu tùy chỉnh
                </p>
              </div>
            </div>
            <GoalSelector />
          </section>

          {/* Health Goal History Section */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 via-orange-50 to-transparent p-3 sm:gap-3 sm:p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 sm:h-10 sm:w-10">
                <History className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                  Lịch Sử Mục Tiêu
                </h2>
                <p className="hidden text-sm text-gray-500 sm:block">
                  Xem lại các mục tiêu đã hoàn thành
                </p>
              </div>
            </div>
            <HealthGoalHistory />
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
