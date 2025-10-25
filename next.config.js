/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
  experimental: {
    // Enable server components and other modern Next.js features
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
  // Configure to handle static file imports
  staticPageGenerationTimeout: 120,
  // Enable experimental features for better performance
  swcMinify: true,
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Handle dynamic imports
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
}

module.exports = nextConfig