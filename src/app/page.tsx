import Link from 'next/link';
import Image from 'next/image';
import { toc } from '@/lib/toc';
import { HomeHeroActions } from '@/components/home/HomeHeroActions';
import { HomeDownloadBanner } from '@/components/home/HomeDownloadBanner';

export default function HomePage() {
  const parts = toc;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="MLTheta Logo"
            width={84}
            height={84}
            className="w-20 h-20 sm:w-22 sm:h-22 object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300"
            priority
          />
        </div>
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full border border-brand-200 mb-4">
          Free · Visual · Interactive
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Machine Learning,{' '}
          <span className="text-brand-600">explained visually</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Drag a point. Move a slider. Watch the idea come alive. A free interactive
          textbook for college and undergraduate students — no coding required.
        </p>
        <HomeHeroActions />
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: '🎛️', label: 'Interactive figures' },
          { icon: '🧩', label: 'Step-by-step quizzes' },
          { icon: '📐', label: 'Visual math' },
          { icon: '📱', label: 'Mobile friendly' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-3 bg-[#fcfaf2]/90 rounded-xl border border-[#ded5bd] text-sm font-medium text-stone-800 shadow-2xs"
          >
            <span className="text-xl">{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* About & Mobile App Banner (hidden inside native app) */}
      <HomeDownloadBanner />

      {/* Table of contents */}
      <div id="contents">
        <h2 className="text-2xl font-bold text-stone-900 mb-8">Contents</h2>
        <div className="space-y-6">
          {parts.map((part) => (
            <div key={part.slug} className="bg-[#fcfaf2]/95 rounded-2xl border border-[#ded5bd] shadow-2xs overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 bg-[#f8f4e6] border-b border-[#ded5bd]">
                <span className="text-2xl">{part.icon}</span>
                <div>
                  <Link href={`/learn/${part.slug}`} className="group">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider group-hover:text-brand-700 transition-colors">
                      Part {part.number}
                    </p>
                    <h3 className="font-bold text-stone-900 group-hover:text-brand-700 transition-colors">{part.title}</h3>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-[#eae2cc]">
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
