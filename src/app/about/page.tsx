import Link from 'next/link';

export const metadata = {
  title: 'About MLens — Free Interactive Machine Learning Book',
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
          About ML<span className="text-brand-600">ens</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          MLens is a free, visual, and interactive machine learning textbook engineered
          for high school and undergraduate students. It strips away dense code boilerplate
          to focus purely on geometric intuition, mathematical rigor, and visual discovery.
        </p>
      </div>

      {/* App Download Highlight Card */}
      <section className="mb-14 p-6 sm:p-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Official Android Release · v1.0.0
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Take MLens Anywhere — 100% Offline
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Install the standalone native Android app. Enjoy fully functional interactive figures,
              math renderers, and quiz revision banks with <strong>zero internet connection</strong> required.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
              <span>📦 Size: <strong>10.7 MB</strong></span>
              <span>•</span>
              <span>🔑 Signed Release Build</span>
              <span>•</span>
              <span>⚡ Android 7.0+ (API 24+)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <a
              href="https://github.com/hamimLohani/mlens/releases/download/v1.0.0/app.apk"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <span className="text-xl">📱</span>
              <span>Download APK</span>
            </a>
            <a
              href="https://github.com/hamimLohani/mlens/releases/tag/v1.0.0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Release Notes</span>
            </a>
          </div>
        </div>

        {/* Quick Android Install Instructions */}
        <div className="mt-6 pt-5 border-t border-emerald-200/70 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">💡 How to install on your Android phone:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
            <li>Download the <code>app.apk</code> file above.</li>
            <li>Tap the downloaded file in your browser or Downloads folder.</li>
            <li>If prompted, enable <em>&quot;Allow from this source&quot;</em> in Android Settings.</li>
            <li>Tap <strong>Install</strong> and launch MLens anytime!</li>
          </ol>
        </div>
      </section>

      {/* Core Principles */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Our Educational Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-2xl mb-3 block">👁️</span>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Visual & Intuitive</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every theoretical machine learning concept is grounded in interactive geometry,
              drag-and-drop points, and live parameter sliders.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-2xl mb-3 block">📐</span>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Rigorous Derivations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step-by-step matrix calculus and algebraic proofs rendered with responsive LaTeX
              so undergraduate students gain deep mathematical confidence.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-2xl mb-3 block">🧩</span>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Test Banks & Pacing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Up to 25 curated MCQs per topic with detailed explanations and study timers
              to solidify core intuitions and clear common traps.
            </p>
          </div>
        </div>
      </section>

      {/* Open Source & Community */}
      <section className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base mb-1">
            Free & Open Source Software
          </h2>
          <p className="text-xs text-slate-500">
            MLens is built with Next.js, Tailwind CSS, KaTeX, and Capacitor under open educational licenses.
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
            href="https://github.com/hamimLohani/mlens"
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
