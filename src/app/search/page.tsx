'use client';

import { Suspense } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { useAuth } from '@/modules/auth';

import { SearchContent } from './components/search-content';

function SearchPageContent() {
  const { user } = useAuth();

  const mainContent = (
    <main className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600">Đang tải...</div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );

  // Show with dashboard layout if user is logged in
  if (user) {
    return (
      <DashboardLayout>
        <div className="-m-4">{mainContent}</div>
      </DashboardLayout>
    );
  }

  return mainContent;
}

export default SearchPageContent;
