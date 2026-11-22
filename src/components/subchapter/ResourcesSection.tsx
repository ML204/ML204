'use client';

interface ResourceItem {
  title: string;
  type: 'github' | 'video' | 'book' | 'paper' | 'cheatsheet';
  description: string;
  url?: string;
}

interface ResourcesSectionProps {
  githubPath?: string; // relative path in this project repo, e.g. "notebooks/01-linear-algebra"
  items?: ResourceItem[];
}

const typeIcons: Record<ResourceItem['type'], { icon: string; badge: string; color: string }> = {
  github: { icon: '💻', badge: 'GitHub Notebook', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  video: { icon: '🎥', badge: 'Video Lecture', color: 'bg-red-50 text-red-700 border-red-200' },
  book: { icon: '📖', badge: 'Textbook Reference', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  paper: { icon: '📄', badge: 'Paper / Article', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cheatsheet: { icon: '📝', badge: 'Cheat Sheet', color: 'bg-amber-50 text-amber-700 border-amber-200' },
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
              Resources & GitHub Materials
            </h3>
          </div>
        </div>

        {githubPath && (
          <a
            href={`https://github.com/hamimLohani/mlens/tree/main/${githubPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span>Code & Notes</span>
            <span className="text-slate-400">↗</span>
          </a>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Deepen your understanding with hand-picked textbooks, video series, and code notebooks.
      </p>

      <div className="space-y-2.5">
        {/* GitHub Repository Item */}
        {githubPath && (
          <a
            href={`https://github.com/hamimLohani/mlens/tree/main/${githubPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-400 transition-all group"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">📂</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Topic Code & Notes Repository
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Open Source
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Code examples, Python/NumPy implementations, and study notes for this topic.
              </p>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform">
              ↗
            </span>
          </a>
        )}

        {/* Custom Items */}
        {items.map((item, idx) => {
          const meta = typeIcons[item.type] || typeIcons.book;
          const content = (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-brand-300 transition-all group">
              <span className="text-lg flex-shrink-0 mt-0.5">{meta.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${meta.color}`}>
                    {meta.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
              {item.url && (
                <span className="text-xs text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  ↗
                </span>
              )}
            </div>
          );

          if (item.url) {
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
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
