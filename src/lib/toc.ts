// Table of Contents — the single source of truth for all content.
// Add chapters and sub-chapters here as content is written.

export interface SubChapter {
  slug: string;
  title: string;
  estimatedMinutes?: number;
}

export interface Chapter {
  slug: string;
  title: string;
  subchapters: SubChapter[];
}

export interface Part {
  number: number;
  slug: string;
  title: string;
  icon: string;
  chapters: Chapter[];
}

export const toc: Part[] = [
  {
    number: 1,
    slug: 'math-foundations',
    title: 'Math Foundations',
    icon: '📐',
    chapters: [
      {
        slug: 'gradient-descent',
        title: 'Gradient Descent',
        subchapters: [
          { slug: 'what-is-optimization',   title: 'What is Optimization?',       estimatedMinutes: 6 },
          { slug: 'loss-functions',         title: 'Loss Functions',               estimatedMinutes: 7 },
          { slug: 'gradient-descent',       title: 'Gradient Descent',             estimatedMinutes: 8 },
          { slug: 'learning-rate',          title: 'Learning Rate & Convergence',  estimatedMinutes: 7 },
          { slug: 'sgd-vs-batch',           title: 'SGD vs Batch GD',             estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'linear-algebra',
        title: 'Linear Algebra',
        subchapters: [
          { slug: 'vectors-and-matrices',   title: 'Vectors & Matrices',           estimatedMinutes: 7 },
          { slug: 'dot-product',            title: 'Dot Product',                  estimatedMinutes: 6 },
          { slug: 'matrix-multiplication',  title: 'Matrix Multiplication',        estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'probability',
        title: 'Probability',
        subchapters: [
          { slug: 'random-variables',       title: 'Random Variables',             estimatedMinutes: 6 },
          { slug: 'probability-distributions', title: 'Distributions',             estimatedMinutes: 8 },
          { slug: 'bayes-rule',             title: "Bayes' Rule",                  estimatedMinutes: 7 },
        ],
      },
    ],
  },
  {
    number: 2,
    slug: 'data-handling',
    title: 'Data Handling',
    icon: '🗄️',
    chapters: [
      {
        slug: 'exploring-data',
        title: 'Exploring Data',
        subchapters: [
          { slug: 'eda',                    title: 'Exploratory Data Analysis',    estimatedMinutes: 7 },
          { slug: 'distributions',          title: 'Distributions & Statistics',   estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'preparing-data',
        title: 'Preparing Data',
        subchapters: [
          { slug: 'scaling',                title: 'Scaling & Normalization',      estimatedMinutes: 6 },
          { slug: 'encoding',               title: 'Encoding Categories',          estimatedMinutes: 6 },
          { slug: 'train-test-split',       title: 'Train / Val / Test Split',     estimatedMinutes: 7 },
          { slug: 'data-leakage',           title: 'Data Leakage',                 estimatedMinutes: 6 },
          { slug: 'class-imbalance',        title: 'Class Imbalance',              estimatedMinutes: 7 },
        ],
      },
    ],
  },
  {
    number: 3,
    slug: 'classical-ml',
    title: 'Classical Machine Learning',
    icon: '📊',
    chapters: [
      {
        slug: 'regression',
        title: 'Regression',
        subchapters: [
          { slug: 'linear-regression',      title: 'Linear Regression',            estimatedMinutes: 8 },
          { slug: 'polynomial-regression',  title: 'Polynomial Regression',        estimatedMinutes: 7 },
          { slug: 'regularization',         title: 'Ridge & Lasso',                estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'classification',
        title: 'Classification',
        subchapters: [
          { slug: 'logistic-regression',    title: 'Logistic Regression',          estimatedMinutes: 8 },
          { slug: 'knn',                    title: 'k-Nearest Neighbors',          estimatedMinutes: 7 },
          { slug: 'decision-trees',         title: 'Decision Trees',               estimatedMinutes: 8 },
          { slug: 'svm',                    title: 'Support Vector Machines',      estimatedMinutes: 8 },
        ],
      },
      {
        slug: 'ensembles',
        title: 'Ensemble Methods',
        subchapters: [
          { slug: 'random-forests',         title: 'Random Forests',               estimatedMinutes: 7 },
          { slug: 'gradient-boosting',      title: 'Gradient Boosting',            estimatedMinutes: 8 },
        ],
      },
      {
        slug: 'unsupervised',
        title: 'Unsupervised Learning',
        subchapters: [
          { slug: 'kmeans',                 title: 'k-Means Clustering',           estimatedMinutes: 7 },
          { slug: 'pca',                    title: 'PCA',                          estimatedMinutes: 8 },
        ],
      },
      {
        slug: 'model-quality',
        title: 'Model Quality',
        subchapters: [
          { slug: 'bias-variance',          title: 'Bias-Variance Tradeoff',       estimatedMinutes: 7 },
          { slug: 'metrics',                title: 'Metrics: Accuracy, F1, ROC',   estimatedMinutes: 8 },
          { slug: 'cross-validation',       title: 'Cross-Validation',             estimatedMinutes: 6 },
        ],
      },
    ],
  },
  {
    number: 4,
    slug: 'deep-learning',
    title: 'Deep Learning',
    icon: '🧠',
    chapters: [
      {
        slug: 'neural-networks',
        title: 'Neural Networks',
        subchapters: [
          { slug: 'perceptron',             title: 'Perceptron & Neurons',         estimatedMinutes: 7 },
          { slug: 'activation-functions',   title: 'Activation Functions',         estimatedMinutes: 7 },
          { slug: 'backpropagation',        title: 'Backpropagation',              estimatedMinutes: 9 },
        ],
      },
      {
        slug: 'cnns',
        title: 'Convolutional Networks',
        subchapters: [
          { slug: 'convolution',            title: 'Convolution & Filters',        estimatedMinutes: 8 },
          { slug: 'pooling',                title: 'Pooling & Architecture',       estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'attention',
        title: 'Attention & Transformers',
        subchapters: [
          { slug: 'self-attention',         title: 'Self-Attention',               estimatedMinutes: 9 },
          { slug: 'transformer',            title: 'Transformer Architecture',     estimatedMinutes: 9 },
        ],
      },
    ],
  },
  {
    number: 5,
    slug: 'specialized',
    title: 'Specialized Areas',
    icon: '🔬',
    chapters: [
      {
        slug: 'nlp',
        title: 'NLP',
        subchapters: [
          { slug: 'tokenization',           title: 'Tokenization',                 estimatedMinutes: 6 },
          { slug: 'word-embeddings',        title: 'Word Embeddings',              estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'reinforcement-learning',
        title: 'Reinforcement Learning',
        subchapters: [
          { slug: 'agents-and-rewards',     title: 'Agents, Environments & Rewards', estimatedMinutes: 7 },
          { slug: 'q-learning',             title: 'Q-Learning',                   estimatedMinutes: 8 },
        ],
      },
    ],
  },
  {
    number: 6,
    slug: 'mlops',
    title: 'MLOps & Deployment',
    icon: '🚀',
    chapters: [
      {
        slug: 'experiment-tracking',
        title: 'Experiment Tracking',
        subchapters: [
          { slug: 'tracking',               title: 'Tracking Experiments',         estimatedMinutes: 6 },
          { slug: 'versioning',             title: 'Model Versioning',             estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'monitoring',
        title: 'Monitoring',
        subchapters: [
          { slug: 'data-drift',             title: 'Data Drift',                   estimatedMinutes: 7 },
        ],
      },
    ],
  },
];
