'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';
import { Textarea } from '@/base/components/ui/textarea';

const reasonSchema = z.object({
  reason: z.string().min(5, 'Lí do ít nhất 5 kí tự').max(500, 'Lí do không vượt quá 500 kí tự'),
});

type ReasonFormValues = z.infer<typeof reasonSchema>;

export type ReasonDialogAction = 'lock' | 'reject' | 'delete';

interface ReasonInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ReasonDialogAction;
  recipeName: string;
  onConfirm: (reason: string) => Promise<void>;
}

const actionConfig: Record<
  ReasonDialogAction,
  {
    title: string;
    description: string;
    confirmText: string;
    isDanger: boolean;
  }
> = {
  lock: {
    title: 'Khóa công thức',
    description: 'Vui lòng nhập lí do khóa công thức này.',
    confirmText: 'Khóa',
    isDanger: true,
  },
  reject: {
    title: 'Từ chối công thức',
    description: 'Vui lòng nhập lí do từ chối công thức này.',
    confirmText: 'Từ chối',
    isDanger: true,
  },
  delete: {
    title: 'Xóa công thức',
    description: 'Vui lòng nhập lí do xóa công thức này. Hành động này không thể hoàn tác.',
    confirmText: 'Xóa',
    isDanger: true,
  },
};

export function ReasonInputDialog({
  open,
  onOpenChange,
  action,
  recipeName,
  onConfirm,
}: ReasonInputDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = actionConfig[action];

  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleSubmit = async (values: ReasonFormValues) => {
    setIsSubmitting(true);
    try {
      await onConfirm(values.reason);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            <span className="text-foreground font-medium">{recipeName}</span>
            <br />
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Lí do <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Nhập lí do..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-destructive text-sm">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant={config.isDanger ? 'danger' : 'default'}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config.confirmText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
