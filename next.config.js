/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure turbopack resolves the correct workspace root.
  // This avoids selecting an unrelated lockfile from a parent directory.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
