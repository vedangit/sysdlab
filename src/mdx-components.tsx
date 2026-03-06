import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // This turns the raw HTML <table> into your dark-mode component
    table: (props) => (
      <div className="overflow-x-auto my-8 border border-zinc-800 rounded-sm">
        <table className="w-full text-sm text-left text-zinc-400" {...props} />
      </div>
    ),
    thead: (props) => (
      <thead className="bg-zinc-900 text-zinc-200 uppercase text-xs font-mono tracking-wider border-b border-zinc-800" {...props} />
    ),
    tr: (props) => (
      <tr className="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/50" {...props} />
    ),
    th: (props) => (
      <th className="px-6 py-3 font-semibold" {...props} />
    ),
    td: (props) => (
      <td className="px-6 py-4 font-mono text-zinc-400" {...props} />
    ),
  };
}