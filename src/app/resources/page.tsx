import Link from 'next/link';

export const metadata = {
  title: 'Learning Resources & Books — MLens',
  description: 'Curated courses, reference textbooks, and GitHub materials for machine learning students.',
};

interface ResourceCard {
  title: string;
  author: string;
  description: string;
  badge: string;
  badgeColor: string;
  url?: string;
}

const COURSES: ResourceCard[] = [
  {
    title: 'Essence of Linear Algebra',
    author: '3Blue1Brown (Grant Sanderson)',
    description: 'The definitive geometric visualizer for linear transformations, dot products, determinants, and eigenvalues.',
    badge: 'Video Series',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
  },
  {
    title: 'Essence of Calculus & Neural Networks',
    author: '3Blue1Brown',
    description: 'Visual intuition for derivatives, chain rule, backpropagation, and gradient descent.',
    badge: 'Video Series',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr',
  },
  {
    title: 'Machine Learning Specialization',
    author: 'Andrew Ng (DeepLearning.AI / Stanford)',
    description: 'The golden standard introductory course covering classical ML: regression, classification, trees, and unsupervised learning.',
    badge: 'Online Course',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
  },
  {
    title: 'Deep Learning Specialization',
    author: 'Andrew Ng (DeepLearning.AI)',
    description: 'In-depth coverage of neural architectures: CNNs for vision, sequence models (RNN/LSTM), and transformer attention.',
    badge: 'Online Course',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    url: 'https://www.coursera.org/specializations/deep-learning',
  },
  {
    title: 'Practical Deep Learning for Coders',
    author: 'fast.ai (Jeremy Howard)',
    description: 'Top-down, code-first deep learning course utilizing modern PyTorch best practices.',
    badge: 'Free Course',
    badgeColor: 'bg-green-50 text-green-700 border-green-200',
    url: 'https://course.fast.ai/',
  },
  {
    title: 'Kaggle Learn Micro-Courses',
    author: 'Kaggle',
    description: 'Bite-sized, practical tutorials on pandas, feature engineering, and model validation with hands-on notebooks.',
    badge: 'Interactive',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    url: 'https://www.kaggle.com/learn',
  },
];

const BOOKS: ResourceCard[] = [
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    author: 'Aurélien Géron',
    description: 'The most comprehensive, practical book for bridging theory and production implementation in Python.',
    badge: 'Recommended Book',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/',
  },
  {
    title: 'Mathematics for Machine Learning',
    author: 'Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong',
    description: 'Free university textbook covering linear algebra, analytic geometry, matrix decompositions, vector calculus, and probability.',
    badge: 'Free Textbook',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    url: 'https://mml-book.github.io/',
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    description: 'The foundational reference textbook for deep learning mathematical theory and architectural formulations.',
    badge: 'Reference Textbook',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    url: 'https://www.deeplearningbook.org/',
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <nav className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Resources & GitHub</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Curated Resources & Materials</h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          The essential books, video series, and GitHub repositories from the ML Learning Checklist to accompany your interactive studies.
        </p>
      </div>

      {/* GitHub Repository Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-brand-950/80 rounded-lg border border-brand-800 mb-3">
              Open Source GitHub Materials
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Project GitHub Repository
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Find Python/NumPy code implementations, interactive Jupyter notebooks, dataset cleaning scripts, and slide decks organized by chapter.
            </p>
          </div>

          <a
            href="https://github.com/Inzamam-Ul-Haque/mlens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-semibold text-xs sm:text-sm text-white transition-colors flex-shrink-0 text-center justify-center shadow-sm"
          >
            <span>Star on GitHub</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Recommended Books */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span>📖</span>
          <span>Core Reference Textbooks</span>
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Standard academic textbooks from the curriculum checklist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOOKS.map((b, idx) => (
            <a
              key={idx}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${b.badgeColor}`}>
                  {b.badge}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  ↗
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">
                {b.title}
              </h3>
              <p className="text-xs text-brand-700 font-medium mb-2">{b.author}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-auto">
                {b.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Courses & Lectures */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span>🎥</span>
          <span>Top Video Courses & Visual Series</span>
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          High-yield visual lectures to watch alongside interactive figures.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COURSES.map((c, idx) => (
            <a
              key={idx}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                  <span className="text-xs text-slate-400">· {c.author}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.description}
                </p>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform mt-1">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
