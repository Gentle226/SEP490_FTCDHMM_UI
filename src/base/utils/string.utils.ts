export class StringUtils {
  static readonly PHONE_REGEX = /((o+84|0)[3|5|7|8|9]){1}([0-9]{8})\b/g;

  static unaccent(str: string) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  static formatCurrency(str: string) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(str));
  }

  static formatDate(str: string) {
    // Ensure the date string is interpreted as UTC by appending 'Z' if not present
    const utcDateString = str.endsWith('Z') ? str : str + 'Z';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(utcDateString));
  }
}
