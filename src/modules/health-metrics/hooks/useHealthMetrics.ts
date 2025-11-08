'use client';

import { useCallback, useState } from 'react';

import { userHealthMetricService } from '../services/user-health-metric.service';
import type {
  CreateUserHealthMetricRequest,
  UpdateUserHealthMetricRequest,
  UserHealthMetricResponse,
} from '../types/health-metric.types';

export function useHealthMetrics() {
  const [metrics, setMetrics] = useState<UserHealthMetricResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userHealthMetricService.getHistory();
      setMetrics(
        data.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()),
      );
      return data;
    } catch {
      setError('Failed to load metrics');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (data: CreateUserHealthMetricRequest) => {
      setError(null);
      try {
        await userHealthMetricService.create(data);
        await getHistory(); // Refresh list
        return true;
      } catch {
        setError('Failed to create metric');
        return false;
      }
    },
    [getHistory],
  );

  const update = useCallback(
    async (metricId: string, data: UpdateUserHealthMetricRequest) => {
      setError(null);
      try {
        await userHealthMetricService.update(metricId, data);
        await getHistory(); // Refresh list
        return true;
      } catch {
        setError('Failed to update metric');
        return false;
      }
    },
    [getHistory],
  );

  const delete_ = useCallback(
    async (metricId: string) => {
      setError(null);
      try {
        await userHealthMetricService.deleteMetric(metricId);
        setMetrics(metrics.filter((m) => m.id !== metricId));
        return true;
      } catch {
        setError('Failed to delete metric');
        return false;
      }
    },
    [metrics],
  );

  const getLatest = useCallback((): UserHealthMetricResponse | undefined => {
    return metrics[0];
  }, [metrics]);

  return {
    metrics,
    loading,
    error,
    getHistory,
    create,
    update,
    delete: delete_,
    getLatest,
  };
}
