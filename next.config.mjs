import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'export',
  
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
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
  // 1. Enable the Rust compiler (this handles Tables/GFM natively)
  mdxRs: true,
  
  options: {
    // 2. LEAVE THESE EMPTY. 
    // Do not put remark-gfm here. The Rust compiler doesn't need it.
    remarkPlugins: [],
    rehypePlugins: [],
    mdxRs: true,
  },
});

export default withMDX(nextConfig);