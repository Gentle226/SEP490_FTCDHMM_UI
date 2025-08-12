import { Formats } from 'next-intl';

import en from '../messages/en.json';
import vi from '../messages/vi.json';

const messagesByLocale: Record<string, unknown> = { en, vi };

const formats = {
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

const nextIntl = {
  defaultLocale: 'en',
  formats,
  messagesByLocale,
};

export default nextIntl;
