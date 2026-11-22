import { toc } from '@/lib/toc';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Params {
  part: string;
}

export async function generateStaticParams() {
  return toc.map((p) => ({ part: p.slug }));
}

export default async function PartPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { part: partSlug } = await params;
  const part = toc.find((p) => p.slug === partSlug);

  if (!part) return notFound();

  const totalSubchapters = part.chapters.reduce((acc, c) => acc + c.subchapters.length, 0);
  const firstChapter = part.chapters[0];
  const firstSub = firstChapter?.subchapters[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/learn" className="hover:text-brand-600 transition-colors">Curriculum</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{part.title}</span>
      </nav>

      {/* Part Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-3 rounded-2xl bg-slate-50 border border-slate-100">{part.icon}</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Part {part.number}
              </p>
              <h1 className="text-3xl font-bold text-slate-900">{part.title}</h1>
              <p className="text-slate-500 text-sm mt-1">
                {part.chapters.length} chapters · {totalSubchapters} topics
              </p>
            </div>
          </div>

          {firstChapter && firstSub && (
            <Link
              href={`/learn/${part.slug}/${firstChapter.slug}/${firstSub.slug}`}
              className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition-colors text-center shadow-sm"
            >
              Start Part {part.number} →
            </Link>
          )}
        </div>
      </div>

      {/* Chapter List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Chapters in this Part</h2>
        {part.chapters.map((chapter, cIdx) => (
          <div
            key={chapter.slug}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-brand-200 transition-all"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                  {cIdx + 1}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  <Link
                    href={`/learn/${part.slug}/${chapter.slug}`}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {chapter.title}
                  </Link>
                </h3>
              </div>

              <Link
                href={`/learn/${part.slug}/${chapter.slug}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                View Chapter ({chapter.subchapters.length} topics) →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {chapter.subchapters.map((sub, sIdx) => (
                <Link
                  key={sub.slug}
                  href={`/learn/${part.slug}/${chapter.slug}/${sub.slug}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-slate-400 font-mono w-5">
                      {cIdx + 1}.{sIdx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-brand-600 truncate">
                      {sub.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {sub.estimatedMinutes && (
                      <span className="text-xs text-slate-400">
                        {sub.estimatedMinutes} min
                      </span>
                    )}
                    <span className="text-xs text-brand-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
