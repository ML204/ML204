import Link from 'next/link';
import { AboutAppCard } from '@/components/about/AboutAppCard';

export const metadata = {
  title: 'About ML204 — Free Interactive Machine Learning Book',
  description: 'Learn machine learning visually without code prerequisites. Download the offline Android APK app.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">About</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full border border-brand-200 mb-3">
          Mission & Technology
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          About ML<span className="text-brand-600">204</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          ML204 is a free, visual, and interactive machine learning textbook engineered
          for high school and undergraduate students. It strips away dense code boilerplate
          to focus purely on geometric intuition, mathematical rigor, and visual discovery.
        </p>
      </div>

      {/* App Highlight Card: Share in App, Download on Web */}
      <AboutAppCard />

      {/* Core Principles */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-stone-900 mb-6">Our Educational Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 shadow-2xs">
            <span className="text-2xl mb-3 block">👁️</span>
            <h3 className="font-bold text-stone-900 text-sm mb-2">Visual & Intuitive</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Every theoretical machine learning concept is grounded in interactive geometry,
              drag-and-drop points, and live parameter sliders.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 shadow-2xs">
            <span className="text-2xl mb-3 block">📐</span>
            <h3 className="font-bold text-stone-900 text-sm mb-2">Rigorous Derivations</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Step-by-step matrix calculus and algebraic proofs rendered with responsive LaTeX
              so undergraduate students gain deep mathematical confidence.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 shadow-2xs">
            <span className="text-2xl mb-3 block">🧩</span>
            <h3 className="font-bold text-stone-900 text-sm mb-2">Test Banks & Pacing</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Up to 25 curated MCQs per topic with detailed explanations and study timers
              to solidify core intuitions and clear common traps.
            </p>
          </div>
        </div>
      </section>

      {/* Open Source & Community */}
      <section className="p-6 rounded-2xl border border-[#ded5bd] bg-[#fcfaf2]/95 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="font-bold text-slate-900 text-base mb-1">
            Free & Open Source Software
          </h2>
          <p className="text-xs text-slate-500">
            ML204 is built with Next.js, Tailwind CSS, KaTeX, and Capacitor under open educational licenses.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/credits"
            className="px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ⚖️ Credits & Licenses
          </Link>
          <a
            href="https://github.com/ML204/ML204"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <span>⭐ Star on GitHub</span>
          </a>
        </div>
      </section>
    </div>
  );
}
