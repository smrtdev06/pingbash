/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:false,
  experimental: {
    // Allow specific origins to load /_next/* resources in dev
    allowedDevOrigins: [
      "*",
      
    ],
  },
  images:{
    domains:['big-ghastly-imp.ngrok-free.app'],
    unoptimized:true,
    remotePatterns:[
      {
        protocol:'https',
        hostname:'big-ghastly-imp.ngrok-free.app'
      }
    ]
  }
};

export default nextConfig;
