import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow all sigroup.com.bd subdomains
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
    ]
  },
}

export default nextConfig
