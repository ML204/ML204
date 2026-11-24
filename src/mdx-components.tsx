import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/common/CodeBlock';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock {...props} />,
    code: ({ children, className, ...props }) => {
      // Inline code pills (e.g. `learning_rate`, `self.weights_`)
      if (!className) {
        return (
          <code className="px-1.5 py-0.5 rounded-md font-mono text-[13px] bg-stone-200/80 text-brand-900 border border-stone-300/60 font-semibold" {...props}>
            {children}
          </code>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    table: ({ children, ...props }) => (
      <div className="w-full my-6 overflow-x-auto rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 shadow-2xs table-scrollbar">
        <table className="w-full text-sm text-center border-collapse min-w-[540px]" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-[#f8f4e6] border-b border-[#ded5bd] text-xs font-semibold text-stone-800 tracking-wider" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-stone-900 font-semibold text-center whitespace-nowrap" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2.5 border-b border-[#eae2cc] text-stone-700 tabular-nums text-center" {...props}>
        {children}
      </td>
    ),
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-[#f6f0df]/80 transition-colors last:border-b-0" {...props}>
        {children}
      </tr>
    ),
  };
}
