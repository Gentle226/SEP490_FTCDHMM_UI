'use client';

import { AxiosError } from 'axios';
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
      } catch (error) {
        // Check if error is related to invalid DoB (status 500 typically indicates validation/database error)
        if (error instanceof AxiosError && error.response?.status === 500) {
          setError(
            'Không thể tạo số liệu sức khỏe. Ngày sinh của bạn chưa được cập nhật hoặc không hợp lệ. Vui lòng kiểm tra và cập nhật Ngày sinh trong Hồ sơ của bạn.',
          );
        } else {
          setError('Không thể tạo số liệu sức khỏe');
        }
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
      } catch (error) {
        // Check if error is related to invalid DoB (status 500 typically indicates validation/database error)
        if (error instanceof AxiosError && error.response?.status === 500) {
          setError(
            'Không thể cập nhật số liệu sức khỏe. Ngày sinh của bạn chưa được cập nhật hoặc không hợp lệ. Vui lòng kiểm tra và cập nhật Ngày sinh trong Hồ sơ của bạn.',
          );
        } else {
          setError('Không thể cập nhật số liệu sức khỏe');
        }
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
        // Refresh the list from server to ensure consistency
        await getHistory();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể xóa số liệu sức khỏe';
        setError(errorMessage);
        return false;
      }
    },
    [getHistory],
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
