/**
 * Formats a date string into a relative time display in Vietnamese
 * @param dateString - ISO date string or date that can be parsed
 * @returns Relative time string (e.g., "1 phút", "2 giờ", "3 ngày")
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'Vừa xong';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} tuần`;
  } else if (diffMonths < 12) {
    return `${diffMonths} tháng`;
  } else {
    return `${diffYears} năm`;
  }
}

/**
 * Formats a date string into a full date display for tooltip
 * @param dateString - ISO date string or date that can be parsed
 * @returns Formatted date string (e.g., "Thứ 5, 7 tháng 11, 2025 lúc 22:40")
 */
export function getFullDateTimeVN(dateString: string): string {
  const date = new Date(dateString);

  const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const weekday = weekdays[date.getDay()];

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${weekday}, ${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
}
