'use client';

// import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/constants';

export const getToken = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const match = document.cookie.match(new RegExp(`(^| )${ACCESS_TOKEN_KEY}=([^;]+)`));
  if (match) {
    return match[2];
  }

  return undefined;

  // return getCookie(ACCESS_TOKEN_KEY);
};
