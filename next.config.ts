import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'pdf2json'],
};

export default nextConfig;
