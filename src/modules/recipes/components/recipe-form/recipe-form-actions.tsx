'use client';

import { Button } from '@/base/components/ui/button';

interface RecipeFormActionsProps {
  mode: 'create' | 'edit' | 'draft-edit';
  isSubmitting: boolean;
  onClearForm?: () => void;
  onSaveDraft?: () => void;
  onPublishDraft?: () => void;
}

export function RecipeFormActions({
  mode,
  isSubmitting,
  onClearForm,
  onSaveDraft,
  onPublishDraft,
}: RecipeFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
      {mode === 'create' && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClearForm}
            disabled={isSubmitting}
            className="w-full text-sm sm:w-auto"
          >
            Xóa biểu mẫu
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="w-full text-sm sm:w-auto"
          >
            Lưu bản nháp
          </Button>
        </>
      )}
      {mode === 'draft-edit' && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="w-full text-sm sm:w-auto"
          >
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật nháp'}
          </Button>
          <Button
            type="button"
            onClick={onPublishDraft}
            disabled={isSubmitting}
            className="w-full bg-[#99b94a] text-sm hover:bg-[#7a9a3d] sm:w-auto"
          >
            {isSubmitting ? 'Đang xuất bản...' : 'Xuất bản'}
          </Button>
        </>
      )}
      {mode !== 'draft-edit' && (
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#99b94a] text-sm hover:bg-[#7a9a3d] sm:w-auto"
        >
          {isSubmitting
            ? mode === 'edit'
              ? 'Đang cập nhật...'
              : 'Đang tạo...'
            : mode === 'edit'
              ? 'Cập nhật'
              : 'Lên bài'}
        </Button>
      )}
    </div>
  );
}
