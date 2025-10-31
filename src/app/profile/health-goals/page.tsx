'use client';

import { useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/components/ui/tabs';
import { ProtectedRoute } from '@/modules/auth';
import {
  CurrentHealthGoalCard,
  CustomHealthGoalList,
  HealthGoalLibrary,
} from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CurrentHealthGoalCard />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Thư Viện Mục Tiêu</TabsTrigger>
              <TabsTrigger value="custom">Mục Tiêu Tùy Chỉnh</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-6">
              <HealthGoalLibrary />
            </TabsContent>
            <TabsContent value="custom" className="mt-6">
              <CustomHealthGoalList />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
