'use client';

import { Goal } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { CurrentGoalHero, GoalSelector } from '@/modules/health-goals';

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

          {/* Current Goal Hero Card */}
          <CurrentGoalHero />

          {/* Goal Selection Section */}
          <GoalSelector />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
