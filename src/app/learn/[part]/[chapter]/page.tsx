import { toc } from '@/lib/toc';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Params {
  part: string;
  chapter: string;
}

export async function generateStaticParams() {
  const params: Params[] = [];
  for (const part of toc) {
    for (const chapter of part.chapters) {
      params.push({ part: part.slug, chapter: chapter.slug });
    }
  }
  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { part: partSlug, chapter: chapterSlug } = await params;
  const part = toc.find((p) => p.slug === partSlug);
  const chapter = part?.chapters.find((c) => c.slug === chapterSlug);

  if (!part || !chapter) return notFound();

  const firstSub = chapter.subchapters[0];
  const totalMinutes = chapter.subchapters.reduce((acc, s) => acc + (s.estimatedMinutes ?? 5), 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/learn" className="hover:text-brand-600 transition-colors">Curriculum</Link>
        <span>/</span>
        <Link href={`/learn/${part.slug}`} className="hover:text-brand-600 transition-colors">{part.title}</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{chapter.title}</span>
      </nav>

      {/* Chapter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{part.icon}</span>
              <Link href={`/learn/${part.slug}`} className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:underline">
                Part {part.number}: {part.title}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{chapter.title}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {chapter.subchapters.length} topics · ~{totalMinutes} min total read time
            </p>
          </div>

          {firstSub && (
            <Link
              href={`/learn/${part.slug}/${chapter.slug}/${firstSub.slug}`}
              className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors text-center shadow-sm whitespace-nowrap"
            >
              Start Chapter →
            </Link>
          )}
        </div>
      </div>

      {/* Subchapter List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            All Lessons in {chapter.title}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Step-by-step
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {chapter.subchapters.map((sub, idx) => (
            <Link
              key={sub.slug}
              href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-brand-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {sub.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {sub.estimatedMinutes && (
                      <span className="text-xs text-slate-400">
                        ⏱ {sub.estimatedMinutes} min
                      </span>
                    )}
                    {sub.done && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        Interactive lesson ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 flex-shrink-0 group-hover:translate-x-1 transition-transform">
                <span>Start</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
