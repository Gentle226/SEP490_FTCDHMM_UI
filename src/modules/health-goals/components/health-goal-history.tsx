'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { History } from 'lucide-react';

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
import { formatNutrientTargetValue, getVietnameseNutrientName } from '../utils';

function HealthGoalHistoryCard({ goal }: { goal: UserHealthGoalResponse }) {
  const startDate = goal.startedAtUtc ? new Date(goal.startedAtUtc) : null;
  const endDate = goal.expiredAtUtc ? new Date(goal.expiredAtUtc) : null;
  const isActive = !endDate || endDate > new Date();

  return (
    <Card
      className={`transition-all ${
        isActive ? 'border-2 border-[#99b94a] bg-[#99b94a]/5' : 'border border-gray-200'
      }`}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-sm font-semibold text-gray-900">
              {goal.name}
            </CardTitle>
            {isActive && (
              <Badge variant="success" className="flex-shrink-0 text-xs">
                Đang hoạt động
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2 text-xs">
            {startDate && format(startDate, 'dd MMM yyyy', { locale: vi })}
            {endDate && <> - {format(endDate, 'dd MMM yyyy', { locale: vi })}</>}
            {!endDate && startDate && <> - Hiện tại</>}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Nutrient Targets */}
        {goal.targets && goal.targets.length > 0 && (
          <div className="space-y-1">
            {goal.targets.map((target) => (
              <div key={target.nutrientId} className="rounded bg-[#99b94a]/10 px-2 py-1.5">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">{getVietnameseNutrientName(target.name)}:</span>{' '}
                  {formatNutrientTargetValue(target)}
                </p>
              </div>
            ))}
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {sortedGoals.map((goal, index) => (
        <HealthGoalHistoryCard key={goal.id || `goal-${index}`} goal={goal} />
      ))}
    </div>
  );
}
