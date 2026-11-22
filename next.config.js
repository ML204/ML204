/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm').default, require('remark-math').default],
    rehypePlugins: [require('rehype-katex').default],
  },
});

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  outputFileTracingIncludes: {
    '/api/resources/**/*': ['./resources/**/*'],
  },
  experimental: {
    mdxRs: false,
  },
};

module.exports = withMDX(nextConfig);
