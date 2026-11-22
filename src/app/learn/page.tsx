import Link from 'next/link';
import { CurriculumView } from './CurriculumView';

export const metadata = {
  title: 'Curriculum Directory — MLens',
  description: 'Explore all machine learning topics organized by the ML Learning Checklist.',
};

export default function LearnIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Curriculum</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Machine Learning Curriculum</h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          The complete roadmap for university students and self-learners: from linear algebra and calculus to deep learning and production MLOps.
        </p>
      </div>

      {/* Interactive Curriculum with live search & progress */}
      <CurriculumView />
    </div>
  );
}
