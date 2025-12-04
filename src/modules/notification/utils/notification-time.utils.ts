import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Lấy offset múi giờ của người dùng từ trình duyệt
 * @returns Offset múi giờ theo giờ (ví dụ: 7 cho UTC+7, -5 cho UTC-5)
 */
export function getUserTimezoneOffset(): number {
  // getTimezoneOffset() trả về phút, chuyển đổi sang giờ
  // Lưu ý: getTimezoneOffset() trả về offset dưới dạng giá trị âm
  // (UTC+7 trả về -420 phút, vì vậy chúng ta cần phủ định nó)
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Lấy offset múi giờ của người dùng dưới dạng chuỗi được định dạng
 * @returns Chuỗi múi giờ được định dạng (ví dụ: "UTC+7", "UTC-5")
 */
export function getUserTimezoneString(): string {
  const offset = getUserTimezoneOffset();
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${offset}`;
}

/**
 * Lấy tên múi giờ của người dùng nếu có sẵn
 * @returns Tên múi giờ (ví dụ: "Asia/Ho_Chi_Minh", "America/New_York") hoặc null
 */
export function getUserTimezoneName(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/**
 * Định dạng timestamp thông báo dưới dạng thời gian tương đối (tiếng Việt)
 */
export const formatNotificationTime = (createdAtUtc: string): string => {
  try {
    // Đảm bảo chuỗi ngày được diễn giải dưới dạng UTC bằng cách thêm 'Z' nếu không có
    const utcDateString = createdAtUtc.endsWith('Z') ? createdAtUtc : createdAtUtc + 'Z';
    const date = new Date(utcDateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return 'gần đây';
  }
};

/**
 * Định dạng timestamp thông báo dưới dạng ngày đầy đủ
 */
export const formatNotificationDate = (createdAtUtc: string): string => {
  try {
    // Đảm bảo chuỗi ngày được diễn giải dưới dạng UTC bằng cách thêm 'Z' nếu không có
    const utcDateString = createdAtUtc.endsWith('Z') ? createdAtUtc : createdAtUtc + 'Z';
    const date = new Date(utcDateString);

    const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const weekday = weekdays[date.getDay()];

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${weekday}, ${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
  } catch {
    return 'Ngày không xác định';
  }
};
