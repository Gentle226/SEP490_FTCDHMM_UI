'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, History } from 'lucide-react';

import { Badge } from '@/base/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { userHealthGoalService } from '../services';
import { UserHealthGoalResponse } from '../types';

function HealthGoalHistoryCard({ goal }: { goal: UserHealthGoalResponse }) {
  const startDate = goal.startedAtUtc ? new Date(goal.startedAtUtc) : null;
  const endDate = goal.expiredAtUtc ? new Date(goal.expiredAtUtc) : null;
  const isActive = !endDate || endDate > new Date();

  return (
    <Card className={isActive ? 'border-[#99b94a] bg-green-50/50 dark:bg-green-950/20' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="truncate text-base sm:text-lg">{goal.name}</CardTitle>
              {isActive && (
                <Badge variant="success" className="flex-shrink-0 text-xs">
                  Đang hoạt động
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2 text-xs sm:text-sm">
              {goal.description || 'Mục tiêu sức khỏe'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Date Range */}
        <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            {startDate && format(startDate, 'dd MMM yyyy', { locale: vi })}
            {endDate && <> - {format(endDate, 'dd MMM yyyy', { locale: vi })}</>}
            {!endDate && startDate && <> - Hiện tại</>}
          </span>
        </div>

        {/* Nutrient Targets */}
        {goal.targets && goal.targets.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium sm:text-sm">Chỉ số dinh dưỡng:</p>
            <div className="space-y-1 sm:space-y-2">
              {goal.targets.slice(0, 3).map((target) => (
                <div
                  key={target.nutrientId}
                  className="flex items-center justify-between rounded-lg border p-1.5 text-xs sm:p-2 sm:text-sm"
                >
                  <span className="truncate pr-2 font-medium">{target.name}</span>
                  <span className="text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {target.minValue} - {target.maxValue} g
                  </span>
                </div>
              ))}
              {goal.targets.length > 3 && (
                <p className="text-muted-foreground text-xs">
                  +{goal.targets.length - 3} chỉ số khác
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HealthGoalHistory() {
  const { data: historyGoals = [], isLoading } = useQuery({
    queryKey: ['healthGoalHistory'],
    queryFn: () => userHealthGoalService.getHistory(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!historyGoals || historyGoals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-center text-sm">
            Chưa có lịch sử mục tiêu sức khỏe nào.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort goals by startedAtUtc (newest first)
  const sortedGoals = [...historyGoals].sort((a, b) => {
    const dateA = a.startedAtUtc ? new Date(a.startedAtUtc).getTime() : 0;
    const dateB = b.startedAtUtc ? new Date(b.startedAtUtc).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-[#99b94a]" />
        <h3 className="text-lg font-semibold">Lịch sử mục tiêu</h3>
      </div>
      <div className="space-y-3">
        {sortedGoals.map((goal) => (
          <HealthGoalHistoryCard key={goal.healthGoalId || goal.customHealthGoalId} goal={goal} />
        ))}
      </div>
    </div>
  );
}
