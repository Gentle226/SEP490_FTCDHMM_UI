import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  transpilePackages: ['react-native'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sep490-images.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, _options) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = ['.web.js', '.web.ts', '.web.tsx', ...config.resolve.extensions];
    return config;
  },
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/base/i18n/request.ts',
  experimental: {
    createMessagesDeclaration: ['./messages/en.json', './messages/vi.json'],
  },
});
export default withPWA(withNextIntl(nextConfig));
