import { Formats } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'vi'] as const;

export const formats = {
  dateTime: {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
  },
  list: {
    enumeration: {
      style: 'long',
      type: 'conjunction',
    },
  },
} satisfies Formats;

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = locales[0];

  return {
    locale,
    formats,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
