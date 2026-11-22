import Link from 'next/link';
import { toc } from '@/lib/toc';

export default function HomePage() {
  const parts = toc;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full border border-brand-200 mb-4">
          Free · Visual · Interactive
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Machine Learning,{' '}
          <span className="text-brand-600">explained visually</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Drag a point. Move a slider. Watch the idea come alive. A free interactive
          textbook for high school and undergraduate students — no coding required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/learn"
            className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md text-center"
          >
            Start Learning →
          </Link>
          <Link
            href="/resources"
            className="px-6 py-3 bg-brand-50 text-brand-700 font-semibold rounded-xl border border-brand-200 hover:bg-brand-100 active:scale-95 transition-all duration-200 shadow-xs text-center flex items-center justify-center gap-2"
          >
            <span>📚</span>
            <span>Resources</span>
          </Link>
          <Link
            href="#contents"
            className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200 hover:border-slate-400 text-center"
          >
            Browse Contents
          </Link>
        </div>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
        {[
          { icon: '🎛️', label: 'Interactive figures' },
          { icon: '🧩', label: 'Step-by-step quizzes' },
          { icon: '📐', label: 'Visual math' },
          { icon: '📱', label: 'Mobile friendly' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-700 shadow-sm"
          >
            <span className="text-xl">{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Table of contents */}
      <div id="contents">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Contents</h2>
        <div className="space-y-6">
          {parts.map((part) => (
            <div key={part.slug} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
                <span className="text-2xl">{part.icon}</span>
                <div>
                  <Link href={`/learn/${part.slug}`} className="group">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                      Part {part.number}
                    </p>
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{part.title}</h3>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {part.chapters.map((chapter) => (
                  <div key={chapter.slug} className="px-6 py-3">
                    <Link
                      href={`/learn/${part.slug}/${chapter.slug}`}
                      className="inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 hover:text-brand-600 transition-colors"
                    >
                      {chapter.title} →
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {chapter.subchapters.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
                          className="text-sm text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
