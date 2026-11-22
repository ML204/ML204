import Link from 'next/link';
import resourcesData from '@/data/resources.json';

export const metadata = {
  title: 'Credits, Sources & Licensing — MLens',
  description: 'Full attribution, open-source licenses, and original sources for all educational materials in MLens.',
};

export default function CreditsPage() {
  const copied = resourcesData.filter((r) => r.type === 'copied');
  const libraries = resourcesData.filter((r) => r.type === 'library');
  const links = resourcesData.filter((r) => r.type === 'link');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Credits & Sources</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full border border-brand-200 mb-3">
          Transparency & Attribution
        </span>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Credits, Sources & Licensing
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          MLens is committed to open educational access and strict copyright compliance.
          Every external diagram, mathematical note, software library, and reference used
          across the curriculum is fully attributed below with its license terms.
        </p>
      </div>

      {/* Bundled Study Materials */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📥</span>
          <h2 className="text-lg font-bold text-slate-900">
            Bundled Study Materials (Offline Ready)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          These documents are embedded directly inside the application APK/bundle and are accessible without an internet connection.
        </p>
        <div className="space-y-3">
          {copied.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-brand-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Offline Bundled
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700">
                    {item.license}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                <span className="font-medium text-slate-700">Author:</span> {item.author} · <span className="font-medium text-slate-700">Topic:</span> {item.topic}
              </p>
              <p className="text-xs text-slate-500 italic">{item.notes}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Source Libraries */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚙️</span>
          <h2 className="text-lg font-bold text-slate-900">
            Core Open-Source Libraries
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {libraries.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.license}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                <span className="font-medium">Maintainer:</span> {item.author}
              </p>
              <p className="text-xs text-slate-500">{item.notes}</p>
            </div>
          ))}
        </div>
      </section>

      {/* External References */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🌐</span>
          <h2 className="text-lg font-bold text-slate-900">
            External References & Suggested Reading
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          External educational videos and textbooks are maintained as links only. Clicking these links will open in your system browser and requires an active internet connection.
        </p>
        <div className="space-y-3">
          {links.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:text-brand-800 text-sm hover:underline flex items-center gap-1.5"
                >
                  {item.title}
                  <span className="text-[11px]">↗</span>
                </a>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    🌐 Needs Internet
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                    {item.license}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1">
                <span className="font-medium">Creator / Publisher:</span> {item.author}
              </p>
              <p className="text-xs text-slate-500 text-balance">{item.notes}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
