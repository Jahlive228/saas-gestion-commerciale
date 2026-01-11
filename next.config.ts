import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Configuration pour gérer les symlinks pnpm
  // Ces options doivent être au niveau racine, pas dans experimental
  outputFileTracingExcludes: {
    '*': [
      'node_modules/.pnpm/**/*',
      'node_modules/.pnpm',
      '**/.pnpm/**',
      '**/node_modules/.pnpm/**',
    ],
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    // Résoudre les symlinks pnpm
    config.resolve.symlinks = false;
    
    return config;
  },
};

export default nextConfig;
