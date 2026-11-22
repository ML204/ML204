import { toc } from '@/lib/toc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FeedbackBar } from '@/components/subchapter/FeedbackBar';

// Dynamically import the MDX content for each sub-chapter
async function getSubchapterModule(part: string, chapter: string, sub: string) {
  try {
    const mod = await import(`@/content/${part}/${chapter}/${sub}.mdx`);
    return mod;
  } catch {
    return null;
  }
}

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

  // Load MDX
  const mod = await getSubchapterModule(partSlug, chapterSlug, subSlug);

  // Prev / Next navigation
  const allSubs = toc.flatMap((p) =>
    p.chapters.flatMap((c) =>
      c.subchapters.map((s) => ({ partSlug: p.slug, chapterSlug: c.slug, ...s }))
    )
  );
  const idx = allSubs.findIndex((s) => s.slug === subSlug && s.chapterSlug === chapterSlug);
  const prev = idx > 0 ? allSubs[idx - 1] : null;
  const next = idx < allSubs.length - 1 ? allSubs[idx + 1] : null;

  const Content = mod?.default;

  return (
    <article className="max-w-3xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/learn" className="hover:text-brand-600 transition-colors">Curriculum</Link>
        <span>/</span>
        <Link href={`/learn/${part.slug}`} className="hover:text-brand-600 transition-colors">{part.title}</Link>
        <span>/</span>
        <Link href={`/learn/${part.slug}/${chapter.slug}`} className="hover:text-brand-600 transition-colors">{chapter.title}</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{subchapter.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
        {subchapter.title}
      </h1>
      {subchapter.estimatedMinutes && (
        <p className="text-sm text-slate-400 mb-8">
          ⏱ {subchapter.estimatedMinutes} min read
        </p>
      )}

      {/* MDX Content */}
      {Content ? (
        <div className="prose prose-slate max-w-none">
          <Content />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          <p className="text-2xl mb-2">🚧</p>
          <p className="font-semibold">This sub-chapter is coming soon.</p>
          <p className="text-sm mt-1">We&apos;re working on it — check back later.</p>
        </div>
      )}

      {/* Feedback */}
      <FeedbackBar subchapterSlug={`${partSlug}/${chapterSlug}/${subSlug}`} />

      {/* Prev / Next */}
      <div className="mt-10 flex gap-3 justify-between">
        {prev ? (
          <Link
            href={`/learn/${prev.partSlug}/${prev.chapterSlug}/${prev.slug}`}
            className="flex-1 flex flex-col px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 transition-colors"
          >
            <span className="text-xs text-slate-400 font-medium mb-0.5">← Previous</span>
            <span className="text-sm font-semibold text-slate-700">{prev.title}</span>
          </Link>
        ) : <div className="flex-1" />}

        {next ? (
          <Link
            href={`/learn/${next.partSlug}/${next.chapterSlug}/${next.slug}`}
            className="flex-1 flex flex-col items-end px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 transition-colors"
          >
            <span className="text-xs text-slate-400 font-medium mb-0.5">Next →</span>
            <span className="text-sm font-semibold text-slate-700">{next.title}</span>
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </article>
  );
}
