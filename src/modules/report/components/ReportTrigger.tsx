'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';

import { ReportButton, type ReportButtonProps } from './ReportButton';
import { ReportModal } from './ReportModal';

export interface ReportTriggerProps extends Omit<ReportButtonProps, 'onReport'> {
  targetName?: string;
  onReportSuccess?: () => void;
  onReportError?: (error: Error) => void;
}

/**
 * Combined component that renders a ReportButton and manages the ReportModal state.
 * Use this component for easy integration of report functionality.
 */
export function ReportTrigger({
  targetId,
  targetType,
  targetName,
  onReportSuccess,
  onReportError,
  ...buttonProps
}: ReportTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    onReportSuccess?.();
  }, [onReportSuccess]);

  const handleError = useCallback(
    (error: Error) => {
      onReportError?.(error);
    },
    [onReportError],
  );

  return (
    <>
      <ReportButton
        targetId={targetId}
        targetType={targetType}
        onReport={handleReport}
        {...buttonProps}
      />
      <ReportModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        targetId={targetId}
        targetType={targetType}
        targetName={targetName}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}
