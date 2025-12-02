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
    <div className="flex justify-end gap-3 border-t pt-6">
      {mode === 'create' && (
        <>
          <Button type="button" variant="outline" onClick={onClearForm} disabled={isSubmitting}>
            Xóa biểu mẫu
          </Button>
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
            Lưu bản nháp
          </Button>
        </>
      )}
      {mode === 'draft-edit' && (
        <>
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật bản nháp'}
          </Button>
          <Button
            type="button"
            onClick={onPublishDraft}
            disabled={isSubmitting}
            className="bg-[#99b94a] hover:bg-[#7a9a3d]"
          >
            {isSubmitting ? 'Đang xuất bản...' : 'Xuất bản'}
          </Button>
        </>
      )}
      {mode !== 'draft-edit' && (
        <Button type="submit" disabled={isSubmitting} className="bg-[#99b94a] hover:bg-[#7a9a3d]">
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
