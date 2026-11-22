import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    table: ({ children, ...props }) => (
      <div className="w-full my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-sm text-center border-collapse min-w-[320px]" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 tracking-wider" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-slate-800 font-semibold text-center whitespace-nowrap" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2.5 border-b border-slate-100 text-slate-600 tabular-nums text-center" {...props}>
        {children}
      </td>
    ),
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-slate-50/70 transition-colors last:border-b-0" {...props}>
        {children}
      </tr>
    ),
  };
}
