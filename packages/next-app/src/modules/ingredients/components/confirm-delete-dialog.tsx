'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientName: string;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  ingredientName,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg text-red-600">Xác nhận xóa nguyên liệu</DialogTitle>
              <DialogDescription className="mt-1">
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Bạn có chắc chắn muốn xóa nguyên liệu{' '}
            <span className="text-foreground font-semibold">"{ingredientName}"</span>?
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Nguyên liệu này sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Xóa nguyên liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
