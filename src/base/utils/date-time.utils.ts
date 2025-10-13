import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export class DateTimeUtils {
  static dateTimeLocale = vi;

  static formatDay(date: Date) {
    return format(date, "d 'tháng' M yyyy", { locale: this.dateTimeLocale });
  }

  static formatWeekday(date: Date) {
    return format(date, 'EEEE', { locale: this.dateTimeLocale });
  }

  static formatTime(date: Date) {
    return format(date, 'hh:mm', { locale: this.dateTimeLocale });
  }
}
