import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { HealthMetricsPage } from '@/modules/health-metrics';

export const metadata = {
  title: 'Health Metrics',
};

export default function Page() {
  return (
    <DashboardLayout>
      <HealthMetricsPage />
    </DashboardLayout>
  );
}
