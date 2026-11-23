import { toc } from '@/lib/toc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FeedbackBar } from '@/components/subchapter/FeedbackBar';
import { CompletionToggle } from '@/components/subchapter/CompletionToggle';
import { getTopicFiles } from '@/lib/topicFiles';
import { TopicResourceFiles } from '@/components/subchapter/TopicResourceFiles';

import { getSubchapterContent } from '@/lib/contentRegistry';

interface Params {
  part: string;
  chapter: string;
  sub: string;
}

export async function generateStaticParams() {
  const params: Params[] = [];
  for (const part of toc) {
    for (const chapter of part.chapters) {
      for (const sub of chapter.subchapters) {
        params.push({ part: part.slug, chapter: chapter.slug, sub: sub.slug });
      }
    }
  }
  return params;
}

export default async function SubchapterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { part: partSlug, chapter: chapterSlug, sub: subSlug } = await params;

  // Find metadata from TOC
  const part = toc.find((p) => p.slug === partSlug);
  const chapter = part?.chapters.find((c) => c.slug === chapterSlug);
  const subchapter = chapter?.subchapters.find((s) => s.slug === subSlug);

  if (!part || !chapter || !subchapter) return notFound();

  // Load MDX Content
  const Content = await getSubchapterContent(partSlug, chapterSlug, subSlug);
  const topicFiles = getTopicFiles(subSlug);

  // Prev / Next navigation
  const allSubs = toc.flatMap((p) =>
    p.chapters.flatMap((c) =>
      c.subchapters.map((s) => ({ partSlug: p.slug, chapterSlug: c.slug, ...s }))
    )
  );
  const idx = allSubs.findIndex((s) => s.slug === subSlug && s.chapterSlug === chapterSlug);
  const prev = idx > 0 ? allSubs[idx - 1] : null;
  const next = idx < allSubs.length - 1 ? allSubs[idx + 1] : null;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full min-w-0">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/learn" className="hover:text-brand-700 transition-colors">Curriculum</Link>
        <span>/</span>
        <Link href={`/learn/${part.slug}`} className="hover:text-brand-700 transition-colors">{part.title}</Link>
        <span>/</span>
        <Link href={`/learn/${part.slug}/${chapter.slug}`} className="hover:text-brand-700 transition-colors">{chapter.title}</Link>
        <span>/</span>
        <span className="text-stone-800 font-semibold">{subchapter.title}</span>
      </nav>

      {/* Title & Reading Meta */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1917] mb-3 leading-tight tracking-tight">
          {subchapter.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          {subchapter.estimatedMinutes && (
            <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
              <span>⏱</span>
              <span>{subchapter.estimatedMinutes} min read</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eae2cc] text-stone-700 border border-[#d8cfb4]" title="Eye-Comfort Sepia Paper Theme Active">
            <span>👁️</span>
            <span>Eye-Care Reading Mode</span>
          </span>
        </div>
      </div>

      {/* MDX Content or Student Preparation Card */}
      {Content ? (
        <div className="prose prose-slate max-w-none">
          <Content />
          <CompletionToggle slug={subSlug} />
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/40 via-white to-slate-50/50 p-8 sm:p-10 mb-8 shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl mx-auto mb-4">
            📖
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-3">
            Lesson In Preparation
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            {subchapter.title}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
            The interactive visual diagrams and step-by-step intuitive guide for this topic are currently being prepared.
            In the meantime, you can review the study notes, summaries, and code resources available in the section below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/learn/${part.slug}/${chapter.slug}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              ← Back to {chapter.title}
            </Link>
            <Link
              href="/resources"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs"
            >
              Browse Resource Vault →
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 max-w-sm mx-auto">
            <CompletionToggle slug={subSlug} />
          </div>
        </div>
      )}

      {/* Uploaded community & personal notes for this topic */}
      <TopicResourceFiles topicSlug={subSlug} topicTitle={subchapter.title} files={topicFiles} />

      {/* Feedback */}
      <FeedbackBar subchapterSlug={`${partSlug}/${chapterSlug}/${subSlug}`} />

      {/* Prev / Next */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-between">
        {prev ? (
          <Link
            href={`/learn/${prev.partSlug}/${prev.chapterSlug}/${prev.slug}`}
            className="flex-1 flex flex-col px-4 py-3 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/90 hover:border-brand-400 hover:bg-[#fffdf8] transition-all shadow-2xs"
          >
            <span className="text-xs text-stone-500 font-medium mb-0.5">← Previous</span>
            <span className="text-sm font-semibold text-stone-800">{prev.title}</span>
          </Link>
        ) : <div className="hidden sm:block flex-1" />}

        {next ? (
          <Link
            href={`/learn/${next.partSlug}/${next.chapterSlug}/${next.slug}`}
            className="flex-1 flex flex-col items-start sm:items-end px-4 py-3 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/90 hover:border-brand-400 hover:bg-[#fffdf8] transition-all shadow-2xs"
          >
            <span className="text-xs text-stone-500 font-medium mb-0.5">Next →</span>
            <span className="text-sm font-semibold text-stone-800">{next.title}</span>
          </Link>
        ) : <div className="hidden sm:block flex-1" />}
      </div>
    </article>
  );
}
