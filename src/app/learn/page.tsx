import Link from 'next/link';
import { toc } from '@/lib/toc';

export const metadata = {
  title: 'All Topics — MLens',
  description: 'Explore all machine learning topics organized by the ML Learning Checklist.',
};

export default function LearnIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Curriculum</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Machine Learning Curriculum</h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Follow the structured roadmap from mathematical foundations to classical models, deep learning, and MLOps.
        </p>
      </div>

      {/* Parts List */}
      <div className="space-y-6">
        {toc.map((part) => {
          const totalSubchapters = part.chapters.reduce((acc, c) => acc + c.subchapters.length, 0);
          const firstSub = part.chapters[0]?.subchapters[0];

          return (
            <div
              key={part.slug}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-brand-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-slate-50 border border-slate-100">{part.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Part {part.number}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      <Link href={`/learn/${part.slug}`} className="hover:text-brand-600 transition-colors">
                        {part.title}
                      </Link>
                    </h2>
                  </div>
                </div>

                <Link
                  href={`/learn/${part.slug}`}
                  className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  View Part →
                </Link>
              </div>

              {/* Chapters overview */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{part.chapters.length} chapters · {totalSubchapters} topics</span>
                {firstSub && (
                  <Link
                    href={`/learn/${part.slug}/${part.chapters[0].slug}/${firstSub.slug}`}
                    className="text-brand-600 font-medium hover:underline"
                  >
                    Start with {firstSub.title} →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
