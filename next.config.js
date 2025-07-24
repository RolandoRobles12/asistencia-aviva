/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow Server Actions
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ]
  }
};

module.exports = nextConfig;