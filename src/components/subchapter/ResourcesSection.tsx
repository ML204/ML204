'use client';

import { openExternalUrl } from '@/lib/externalLinks';

interface ResourceItem {
  title: string;
  type: 'github' | 'video' | 'book' | 'paper' | 'cheatsheet' | 'pdf' | 'code';
  description: string;
  url?: string;
}

interface ResourcesSectionProps {
  githubPath?: string; // relative path in this project repo, e.g. "resources/linear-regression"
  items?: ResourceItem[];
}

const typeIcons: Record<string, { icon: string; badge: string; color: string }> = {
  github: { icon: '💻', badge: 'GitHub Notebook', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  video: { icon: '🎥', badge: 'Video Lecture', color: 'bg-red-50 text-red-700 border-red-200' },
  book: { icon: '📖', badge: 'Textbook Reference', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  paper: { icon: '📄', badge: 'Paper / Article', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cheatsheet: { icon: '📝', badge: 'Cheat Sheet', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  pdf: { icon: '📕', badge: 'PDF Study Notes', color: 'bg-red-50 text-red-700 border-red-200' },
  code: { icon: '📐', badge: 'LaTeX / Code', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export function ResourcesSection({ githubPath, items = [] }: ResourcesSectionProps) {
  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📚</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Supplementary Study
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Resources & Study Materials
            </h3>
          </div>
        </div>

        {githubPath && (
          <a
            href={`https://github.com/ML204/ML204/tree/main/${githubPath}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl(`https://github.com/ML204/ML204/tree/main/${githubPath}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span>GitHub</span>
            <span className="text-slate-400">↗</span>
          </a>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Deepen your understanding with author-prepared study notes, derivation proofs, and curated educational lectures.
      </p>

      <div className="space-y-2.5">
        {/* Custom Items */}
        {items.map((item, idx) => {
          const meta = typeIcons[item.type] || typeIcons.book;
          const isLocal = item.url?.startsWith('/');
          const isExternal = item.url?.startsWith('http');

          const content = (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-brand-300 transition-all group">
              <span className="text-lg flex-shrink-0 mt-0.5">{meta.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${meta.color}`}>
                    {meta.badge}
                  </span>
                  {isLocal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Offline Ready
                    </span>
                  )}
                  {isExternal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      🌐 Needs Internet
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
              {item.url && (
                <span className="text-xs text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  {isLocal ? '↓' : '↗'}
                </span>
              )}
            </div>
          );

          if (item.url) {
            if (isLocal) {
              return (
                <a
                  key={idx}
                  href={item.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              );
            }

            return (
              <a
                key={idx}
                href={item.url}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.url) openExternalUrl(item.url);
                }}
                className="block cursor-pointer"
              >
                {content}
              </a>
            );
          }
          return <div key={idx}>{content}</div>;
        })}
      </div>
    </div>
  );
}

