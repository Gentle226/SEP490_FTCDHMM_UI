import { NotificationType } from '../types/notification.types';

/**
 * Tạo URL liên kết dựa trên loại thông báo và ID đích
 */
export const getNotificationLink = (type: NotificationType, targetId?: string): string => {
  if (!targetId) {
    return '/';
  }

  switch (type) {
    case NotificationType.Comment:
    case NotificationType.Reply:
      // Liên kết đến công thức với bình luận được làm nổi bật
      // targetId là commentId, chúng ta cần trích xuất recipeId từ ngữ cảnh
      // Hiện tại, trả về liên kết chung - có thể cải thiện sau
      return `/recipes?commentId=${targetId}`;
    case NotificationType.System:
    default:
      return '/';
  }
};

/**
 * Kiểm tra xem thông báo có nên bấm được không
 */
export const isNotificationClickable = (type: NotificationType, targetId?: string): boolean => {
  return !!targetId && (type === NotificationType.Comment || type === NotificationType.Reply);
};
