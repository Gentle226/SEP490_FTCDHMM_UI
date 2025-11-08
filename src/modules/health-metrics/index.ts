// Services
export { ACTIVITY_LEVEL_MAP, activityLevelService } from './services/activity-level.service';
export { userHealthMetricService } from './services/user-health-metric.service';

// Types
export type {
  ActivityLevel,
  ActivityLevelInfo,
  ChangeActivityLevelRequest,
  CreateUserHealthMetricRequest,
  UpdateUserHealthMetricRequest,
  UserHealthMetricResponse,
} from './types/health-metric.types';

// Components
export { ActivityLevelSelector } from './components/ActivityLevelSelector';
export { HealthMetricForm } from './components/HealthMetricForm';
export { MetricsHistory } from './components/MetricsHistory';

// Hooks
export { useHealthMetrics } from './hooks/useHealthMetrics';

// Utils
export { calculateBMI, getBMIColor, getBMIStatus, validateHealthMetric } from './utils/validation';

// Pages
export { HealthMetricsPage } from './pages/HealthMetricsPage';
