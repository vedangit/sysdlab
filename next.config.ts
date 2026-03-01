import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {

  reactCompiler:true,
  // Enables static HTML export for zero-cost hosting
  output: 'export',
  
  // Configure MDX support alongside standard React components
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
  // Required to load the PGlite WASM binary properly
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false, 
      path: false, 
      crypto: false 
    };
    return config;
  },
};

const withMDX = createMDX({
  // Add markdown plugins here if needed later (e.g., remark-gfm for tables)
});

export default withMDX(nextConfig);