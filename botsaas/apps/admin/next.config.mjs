/** @type {import('next').NextConfig} */
const nextConfig = {
  // CONSTRAINT 1: static export. There is no Node server in production, so
  // there are no API routes, no server actions, no SSR and no middleware.
  // Everything dynamic is a client-side fetch to the PHP API.
  output: 'export',

  // Hostinger serves from a directory, so emit /path/index.html rather than
  // /path.html — otherwise deep links 404 on a plain Apache host.
  trailingSlash: true,

  // next/image needs a server-side optimiser, which a static export has not got.
  images: { unoptimized: true },

  // Fail the build on type or lint errors instead of shipping them.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  },
};

export default nextConfig;
