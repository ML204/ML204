import { toc } from '@/lib/toc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTopicFiles } from '@/lib/topicFiles';

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

function getFileIcon(ext: string) {
  switch (ext) {
    case 'pdf': return '📕';
    case 'ipynb': return '🪐';
    case 'py': return '🐍';
    case 'md': return '📝';
    default: return '📄';
  }
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

  // Load resources for each topic in this chapter
  const topicsWithFiles = chapter.subchapters.map((sub) => ({
    ...sub,
    files: getTopicFiles(sub.slug),
  }));

  const totalFiles = topicsWithFiles.reduce((acc, t) => acc + t.files.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{part.icon}</span>
              <Link href={`/learn/${part.slug}`} className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:underline">
                Part {part.number}: {part.title}
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{chapter.title}</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {chapter.subchapters.length} topics · ~{totalMinutes} min read time · <strong className="text-slate-700">{totalFiles} study files</strong> available
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <a
              href={`https://github.com/ML204/ML204/tree/main/public/resources`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors text-center whitespace-nowrap"
            >
              Study Notes on GitHub ↗
            </a>

            {firstSub && (
              <Link
                href={`/learn/${part.slug}/${chapter.slug}/${firstSub.slug}`}
                className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-brand-700 transition-colors text-center shadow-sm whitespace-nowrap"
              >
                Start Chapter →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Subchapter Lessons List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Lessons in {chapter.title}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Step-by-step
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {topicsWithFiles.map((sub, idx) => (
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
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {sub.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {sub.estimatedMinutes && (
                      <span className="text-xs text-slate-400">
                        ⏱ {sub.estimatedMinutes} min
                      </span>
                    )}
                    {sub.done && (
                      <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        Interactive lesson ready
                      </span>
                    )}
                    {sub.files.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        📚 {sub.files.length} {sub.files.length === 1 ? 'study file' : 'study files'}
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

      {/* Section 2: Chapter Wise Study Notes & Files */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Chapter Resources
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Study Notes & Materials for {chapter.title}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {totalFiles} {totalFiles === 1 ? 'file' : 'files'} available
          </span>
        </div>

        <div className="space-y-4">
          {topicsWithFiles.map((topic, tIdx) => (
            <div key={topic.slug} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    {tIdx + 1}.
                  </span>
                  <Link
                    href={`/learn/${part.slug}/${chapter.slug}/${topic.slug}`}
                    className="text-xs font-bold text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    {topic.title}
                  </Link>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {topic.files.length} {topic.files.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              {topic.files.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  {topic.files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-300 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{getFileIcon(file.extension)}</span>
                        <span className="font-medium text-slate-700 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">({file.size})</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                        <a
                          href={file.href}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors text-[11px] text-center"
                        >
                          Download
                        </a>
                        <a
                          href={file.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-[11px] text-center"
                        >
                          GitHub ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic mt-1">
                  Study notes and resources coming soon for this topic.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
