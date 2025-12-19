import { Notification, NotificationType } from '../types/notification.types';

/**
 * Định dạng thông báo dựa trên loại và người gửi
 */
export const formatNotificationMessage = (notification: Notification): string => {
  const { type, senders, message } = notification;
  const senderCount = senders?.length ?? 0;
  const typeName = type?.name?.toUpperCase() ?? NotificationType.System;

  // Nếu tồn tại tin nhắn tùy chỉnh (cho thông báo Hệ thống), sử dụng nó
  if (typeName === NotificationType.System && message) {
    return message;
  }

  // Handle system notifications (no sender required)
  if (senderCount === 0) {
    switch (typeName) {
      case NotificationType.LockRecipe:
        return 'Công thức của bạn đã bị khóa';
      case NotificationType.DeleteRecipe:
        return 'Công thức của bạn đã bị xóa';
      case NotificationType.ApproveRecipe:
        return 'Công thức của bạn đã được duyệt';
      case NotificationType.RejectRecipe:
        return 'Công thức của bạn đã bị từ chối';
      default:
        return message || 'Bạn có một thông báo mới';
    }
  }

  // Định dạng tên người gửi
  const firstName = senders[0]?.firstName || 'Ai đó';
  const lastName = senders[0]?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  // Một người gửi
  if (senderCount === 1) {
    switch (typeName) {
      case NotificationType.Comment:
        return `${fullName} đã bình luận về công thức của bạn`;
      case NotificationType.Reply:
        return `${fullName} đã trả lời bình luận của bạn`;
      case NotificationType.Mention:
        return `${fullName} đã nhắc đến bạn trong một bình luận`;
      case NotificationType.NewRecipe:
        return `${fullName} đã tạo một công thức mới`;
      case NotificationType.Like:
        return `${fullName} đã thích công thức của bạn`;
      case NotificationType.Rating:
        return `${fullName} đã đánh giá công thức của bạn`;
      case NotificationType.Follow:
        return `${fullName} đã theo dõi bạn`;
      case NotificationType.LockRecipe:
        return `Công thức của bạn đã bị khóa`;
      case NotificationType.DeleteRecipe:
        return `Công thức của bạn đã bị xóa`;
      case NotificationType.ApproveRecipe:
        return `Công thức của bạn đã được duyệt`;
      case NotificationType.RejectRecipe:
        return `Công thức của bạn đã bị từ chối`;
      default:
        return message || `${fullName} đã tương tác với nội dung của bạn`;
    }
  }

  // Nhiều người gửi
  const othersCount = senderCount - 1;
  const othersText = othersCount === 1 ? '1 người khác' : `${othersCount} người khác`;

  switch (typeName) {
    case NotificationType.Comment:
      return `${fullName} và ${othersText} đã bình luận về công thức của bạn`;
    case NotificationType.Reply:
      return `${fullName} và ${othersText} đã trả lời bình luận của bạn`;
    case NotificationType.Mention:
      return `${fullName} và ${othersText} đã nhắc đến bạn trong bình luận`;
    case NotificationType.NewRecipe:
      return `${fullName} và ${othersText} đã tạo công thức mới`;
    case NotificationType.Like:
      return `${fullName} và ${othersText} đã thích công thức của bạn`;
    case NotificationType.Rating:
      return `${fullName} và ${othersText} đã đánh giá công thức của bạn`;
    case NotificationType.Follow:
      return `${fullName} và ${othersText} đã theo dõi bạn`;
    default:
      return message || `${fullName} và ${othersText} đã tương tác với nội dung của bạn`;
  }
};

/**
 * Lấy tóm tắt ngắn gọn về tên người gửi
 */
export const getSendersSummary = (notification: Notification): string => {
  const { senders } = notification;
  const senderCount = senders.length;

  if (senderCount === 0) {
    return 'Không xác định';
  }

  if (senderCount === 1) {
    return `${senders[0].firstName} ${senders[0].lastName}`.trim();
  }

  const firstName = senders[0]?.firstName || 'Ai đó';
  const othersCount = senderCount - 1;
  return `${firstName} và ${othersCount} ${othersCount === 1 ? 'người khác' : 'người khác'}`;
};
