// Table of Contents — mirrors the ML Learning Checklist exactly.
// Structure: Part → Chapter (checklist section) → Sub-chapter (checklist bullet).
// Sections excluded: 1 (Programming), 7 (TinyML/IoT), 9 (Courses), 10 (Projects), 11 (Research)

export interface SubChapter {
  slug: string;
  title: string;
  estimatedMinutes?: number;
  done?: boolean; // content file exists
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
  // ── Part 1: Math Foundations (Checklist §2) ───────────────────────────────
  {
    number: 1,
    slug: 'math-foundations',
    title: 'Math Foundations',
    icon: '📐',
    chapters: [
      {
        slug: 'linear-algebra',
        title: 'Linear Algebra',
        subchapters: [
          { slug: 'vectors-and-matrices',          title: 'Vectors and Matrices',              estimatedMinutes: 7 },
          { slug: 'dot-product-matrix-multiply',   title: 'Dot Product and Matrix Multiplication', estimatedMinutes: 7 },
          { slug: 'transpose-inverse-determinant', title: 'Transpose, Inverse and Determinant', estimatedMinutes: 7 },
          { slug: 'norms',                         title: 'Norms — L1 and L2',                 estimatedMinutes: 6 },
          { slug: 'eigenvalues-eigenvectors',      title: 'Eigenvalues and Eigenvectors',      estimatedMinutes: 8 },
          { slug: 'svd',                           title: 'Singular Value Decomposition',       estimatedMinutes: 8 },
        ],
      },
      {
        slug: 'calculus',
        title: 'Calculus',
        subchapters: [
          { slug: 'derivatives-and-chain-rule',    title: 'Derivatives and the Chain Rule',    estimatedMinutes: 7 },
          { slug: 'partial-derivatives',           title: 'Partial Derivatives',               estimatedMinutes: 6 },
          { slug: 'gradients-and-jacobian',        title: 'Gradients and the Jacobian',        estimatedMinutes: 7 },
          { slug: 'what-is-optimization',          title: 'What is Optimization?',             estimatedMinutes: 6,  done: true },
          { slug: 'loss-functions',                title: 'Loss Functions',                    estimatedMinutes: 7,  done: true },
          { slug: 'gradient-descent',              title: 'Gradient Descent',                  estimatedMinutes: 8,  done: true },
          { slug: 'learning-rate',                 title: 'Learning Rate and Convergence',     estimatedMinutes: 7,  done: true },
          { slug: 'sgd-vs-batch',                  title: 'SGD vs Batch Gradient Descent',     estimatedMinutes: 6,  done: true },
        ],
      },
      {
        slug: 'probability',
        title: 'Probability',
        subchapters: [
          { slug: 'random-variables-distributions', title: 'Random Variables and Distributions', estimatedMinutes: 7 },
          { slug: 'expectation-variance-covariance', title: 'Expectation, Variance and Covariance', estimatedMinutes: 7 },
          { slug: 'conditional-probability-bayes',  title: 'Conditional Probability and Bayes\' Rule', estimatedMinutes: 7 },
          { slug: 'common-distributions',           title: 'Common Distributions',              estimatedMinutes: 7 },
          { slug: 'maximum-likelihood-estimation',  title: 'Maximum Likelihood Estimation',     estimatedMinutes: 8 },
        ],
      },
      {
        slug: 'statistics',
        title: 'Statistics',
        subchapters: [
          { slug: 'sampling-and-clt',              title: 'Sampling and the Central Limit Theorem', estimatedMinutes: 7 },
          { slug: 'hypothesis-testing',            title: 'Hypothesis Testing and p-values',   estimatedMinutes: 7 },
          { slug: 'confidence-intervals',          title: 'Confidence Intervals',              estimatedMinutes: 6 },
          { slug: 'correlation-vs-causation',      title: 'Correlation vs Causation',          estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'optimization-and-information-theory',
        title: 'Optimization and Information Theory',
        subchapters: [
          { slug: 'sgd-momentum-adam',             title: 'SGD, Momentum, RMSProp and Adam',   estimatedMinutes: 8 },
          { slug: 'convex-vs-nonconvex',           title: 'Convex vs Non-Convex Functions',    estimatedMinutes: 6 },
          { slug: 'entropy-and-cross-entropy',     title: 'Entropy and Cross-Entropy',         estimatedMinutes: 7 },
          { slug: 'kl-divergence',                 title: 'KL Divergence',                     estimatedMinutes: 7 },
        ],
      },
    ],
  },

  // ── Part 2: Data Handling (Checklist §3) ──────────────────────────────────
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
          { slug: 'eda',                           title: 'Exploratory Data Analysis',         estimatedMinutes: 7 },
          { slug: 'summary-statistics',            title: 'Summary Statistics and Distributions', estimatedMinutes: 6 },
          { slug: 'correlation-analysis',          title: 'Correlation Analysis',              estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'cleaning',
        title: 'Cleaning',
        subchapters: [
          { slug: 'missing-values',                title: 'Missing Values — Drop and Impute',  estimatedMinutes: 6 },
          { slug: 'outlier-detection',             title: 'Outlier Detection and Treatment',   estimatedMinutes: 6 },
          { slug: 'duplicates-labels',             title: 'Duplicates and Inconsistent Labels', estimatedMinutes: 5 },
        ],
      },
      {
        slug: 'feature-work',
        title: 'Feature Work',
        subchapters: [
          { slug: 'scaling',                       title: 'Scaling — Standardization and Min-Max', estimatedMinutes: 6 },
          { slug: 'encoding',                      title: 'Encoding — One-Hot, Label, Target', estimatedMinutes: 6 },
          { slug: 'feature-engineering',           title: 'Feature Engineering',               estimatedMinutes: 7 },
          { slug: 'feature-selection',             title: 'Feature Selection',                 estimatedMinutes: 7 },
          { slug: 'dimensionality-reduction-prep', title: 'Dimensionality Reduction as Preprocessing', estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'splitting-and-pitfalls',
        title: 'Splitting and Pitfalls',
        subchapters: [
          { slug: 'train-val-test-split',          title: 'Train / Validation / Test Split',   estimatedMinutes: 7 },
          { slug: 'stratified-splits',             title: 'Stratified Splits',                 estimatedMinutes: 5 },
          { slug: 'time-based-splits',             title: 'Time-Based Splits',                 estimatedMinutes: 5 },
          { slug: 'data-leakage',                  title: 'Data Leakage',                      estimatedMinutes: 7 },
          { slug: 'class-imbalance',               title: 'Class Imbalance',                   estimatedMinutes: 7 },
        ],
      },
    ],
  },

  // ── Part 3: Classical Machine Learning (Checklist §4) ─────────────────────
  {
    number: 3,
    slug: 'classical-ml',
    title: 'Classical Machine Learning',
    icon: '📊',
    chapters: [
      {
        slug: 'supervised-regression',
        title: 'Supervised — Regression',
        subchapters: [
          { slug: 'linear-regression',             title: 'Linear Regression',                 estimatedMinutes: 8 },
          { slug: 'ordinary-least-squares',        title: 'Ordinary Least Squares (OLS)',       estimatedMinutes: 8 },
          { slug: 'polynomial-regression',         title: 'Polynomial Regression',             estimatedMinutes: 7,  done: true },
          { slug: 'ridge-regression',              title: 'Ridge Regression',                  estimatedMinutes: 7 },
          { slug: 'lasso-regression',              title: 'Lasso Regression',                  estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'supervised-classification',
        title: 'Supervised — Classification',
        subchapters: [
          { slug: 'logistic-regression',           title: 'Logistic Regression',               estimatedMinutes: 8 },
          { slug: 'knn',                           title: 'k-Nearest Neighbors',               estimatedMinutes: 7 },
          { slug: 'naive-bayes',                   title: 'Naive Bayes',                       estimatedMinutes: 6 },
          { slug: 'svm-and-kernels',               title: 'Support Vector Machines and Kernels', estimatedMinutes: 8 },
          { slug: 'decision-trees',                title: 'Decision Trees',                    estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'ensemble-methods',
        title: 'Ensemble Methods',
        subchapters: [
          { slug: 'bagging-and-random-forests',    title: 'Bagging and Random Forests',        estimatedMinutes: 7 },
          { slug: 'gradient-boosting',             title: 'Gradient Boosting',                 estimatedMinutes: 8 },
          { slug: 'xgboost-lightgbm',              title: 'XGBoost and LightGBM',              estimatedMinutes: 7 },
          { slug: 'stacking-and-voting',           title: 'Stacking and Voting',               estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'unsupervised-learning',
        title: 'Unsupervised Learning',
        subchapters: [
          { slug: 'kmeans',                        title: 'k-Means Clustering',                estimatedMinutes: 7 },
          { slug: 'hierarchical-clustering',       title: 'Hierarchical Clustering',           estimatedMinutes: 7 },
          { slug: 'dbscan',                        title: 'DBSCAN',                            estimatedMinutes: 7 },
          { slug: 'gaussian-mixture-models',       title: 'Gaussian Mixture Models',           estimatedMinutes: 7 },
          { slug: 'pca',                           title: 'PCA',                               estimatedMinutes: 8 },
          { slug: 'tsne-umap',                     title: 't-SNE and UMAP',                    estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'anomaly-detection',
        title: 'Anomaly Detection',
        subchapters: [
          { slug: 'statistical-thresholds',        title: 'Statistical Thresholds',            estimatedMinutes: 6 },
          { slug: 'isolation-forest',              title: 'Isolation Forest',                  estimatedMinutes: 7 },
          { slug: 'one-class-svm',                 title: 'One-Class SVM',                     estimatedMinutes: 6 },
          { slug: 'autoencoder-detection',         title: 'Autoencoder-Based Detection',       estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'model-quality',
        title: 'Model Quality',
        subchapters: [
          { slug: 'bias-variance-tradeoff',        title: 'Overfitting, Underfitting and Bias-Variance', estimatedMinutes: 7 },
          { slug: 'l1-l2-regularization',          title: 'L1 and L2 Regularization',         estimatedMinutes: 6 },
          { slug: 'cross-validation',              title: 'k-Fold Cross-Validation',           estimatedMinutes: 7 },
          { slug: 'grid-and-random-search',        title: 'Grid Search and Random Search',     estimatedMinutes: 6 },
          { slug: 'classification-metrics',        title: 'Metrics — Accuracy, Precision, Recall, F1', estimatedMinutes: 8 },
          { slug: 'roc-auc-pr',                   title: 'ROC-AUC and PR Curve',              estimatedMinutes: 7 },
          { slug: 'regression-metrics',            title: 'Metrics — RMSE, MAE, R-squared',   estimatedMinutes: 6 },
          { slug: 'confusion-matrix',              title: 'Confusion Matrix',                  estimatedMinutes: 6 },
        ],
      },
    ],
  },

  // ── Part 4: Deep Learning (Checklist §5) ──────────────────────────────────
  {
    number: 4,
    slug: 'deep-learning',
    title: 'Deep Learning',
    icon: '🧠',
    chapters: [
      {
        slug: 'neural-network-basics',
        title: 'Neural Network Basics',
        subchapters: [
          { slug: 'perceptron-and-mlp',            title: 'Perceptron and Multilayer Networks', estimatedMinutes: 7 },
          { slug: 'activation-functions',          title: 'Activation Functions',              estimatedMinutes: 7 },
          { slug: 'loss-functions-dl',             title: 'Loss Functions — MSE and Cross-Entropy', estimatedMinutes: 6 },
          { slug: 'forward-pass-backprop',         title: 'Forward Pass and Backpropagation',  estimatedMinutes: 9 },
          { slug: 'weight-initialization',         title: 'Weight Initialization',             estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'training-techniques',
        title: 'Training Techniques',
        subchapters: [
          { slug: 'dropout',                       title: 'Dropout',                           estimatedMinutes: 6 },
          { slug: 'batch-normalization',           title: 'Batch Normalization',               estimatedMinutes: 7 },
          { slug: 'lr-schedules',                  title: 'Learning Rate Schedules',           estimatedMinutes: 6 },
          { slug: 'early-stopping',                title: 'Early Stopping',                    estimatedMinutes: 5 },
          { slug: 'data-augmentation',             title: 'Data Augmentation',                 estimatedMinutes: 6 },
          { slug: 'debugging-a-model',             title: 'Debugging a Model That Won\'t Learn', estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'convolutional-networks',
        title: 'Convolutional Networks',
        subchapters: [
          { slug: 'convolution-pooling',           title: 'Convolution, Pooling, Stride and Padding', estimatedMinutes: 8 },
          { slug: 'classic-architectures',         title: 'Classic Architectures — LeNet, VGG, ResNet', estimatedMinutes: 7 },
          { slug: 'transfer-learning',             title: 'Transfer Learning',                 estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'sequence-models',
        title: 'Sequence Models',
        subchapters: [
          { slug: 'rnn-and-vanishing-gradients',   title: 'RNN Basics and Vanishing Gradients', estimatedMinutes: 7 },
          { slug: 'lstm-and-gru',                  title: 'LSTM and GRU',                      estimatedMinutes: 7 },
          { slug: 'sequence-to-sequence',          title: 'Sequence-to-Sequence',              estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'attention-and-transformers',
        title: 'Attention and Transformers',
        subchapters: [
          { slug: 'self-attention',                title: 'Self-Attention',                    estimatedMinutes: 9 },
          { slug: 'transformer-architecture',      title: 'Transformer Architecture',          estimatedMinutes: 9 },
          { slug: 'positional-encoding',           title: 'Positional Encoding',               estimatedMinutes: 6 },
          { slug: 'bert-and-gpt',                  title: 'BERT and GPT Overview',             estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'other-architectures',
        title: 'Other Architectures',
        subchapters: [
          { slug: 'autoencoders',                  title: 'Autoencoders',                      estimatedMinutes: 7 },
          { slug: 'variational-autoencoders',      title: 'Variational Autoencoders',          estimatedMinutes: 8 },
          { slug: 'gans-overview',                 title: 'GANs Overview',                     estimatedMinutes: 7 },
        ],
      },
    ],
  },

  // ── Part 5: Specialized Areas (Checklist §6) ──────────────────────────────
  {
    number: 5,
    slug: 'specialized',
    title: 'Specialized Areas',
    icon: '🔬',
    chapters: [
      {
        slug: 'time-series',
        title: 'Time Series and Sensor Data',
        subchapters: [
          { slug: 'trend-seasonality-stationarity', title: 'Trend, Seasonality and Stationarity', estimatedMinutes: 7 },
          { slug: 'moving-averages-arima',           title: 'Moving Averages and ARIMA',         estimatedMinutes: 7 },
          { slug: 'windowing-sensor-streams',        title: 'Windowing Sensor Streams',          estimatedMinutes: 6 },
          { slug: 'lstm-cnn-time-series',            title: 'LSTM and 1D-CNN for Time Series',   estimatedMinutes: 7 },
          { slug: 'forecasting-evaluation',          title: 'Forecasting Evaluation',            estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'computer-vision',
        title: 'Computer Vision',
        subchapters: [
          { slug: 'image-classification',           title: 'Image Classification',              estimatedMinutes: 7 },
          { slug: 'object-detection',               title: 'Object Detection — YOLO',           estimatedMinutes: 7 },
          { slug: 'segmentation',                   title: 'Segmentation Basics',               estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'nlp',
        title: 'Natural Language Processing',
        subchapters: [
          { slug: 'tokenization',                   title: 'Tokenization',                      estimatedMinutes: 6 },
          { slug: 'bag-of-words-tfidf',             title: 'Bag of Words and TF-IDF',           estimatedMinutes: 6 },
          { slug: 'word-embeddings',                title: 'Word Embeddings',                   estimatedMinutes: 7 },
          { slug: 'text-classification',            title: 'Text Classification',               estimatedMinutes: 7 },
          { slug: 'fine-tuning-pretrained',         title: 'Fine-Tuning a Pretrained Model',    estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'large-language-models',
        title: 'Large Language Models',
        subchapters: [
          { slug: 'how-llms-are-trained',           title: 'How LLMs Are Trained',              estimatedMinutes: 7 },
          { slug: 'prompt-engineering',             title: 'Prompt Engineering',                estimatedMinutes: 6 },
          { slug: 'rag',                            title: 'Retrieval-Augmented Generation',    estimatedMinutes: 7 },
          { slug: 'fine-tuning-and-lora',           title: 'Fine-Tuning and LoRA',              estimatedMinutes: 7 },
          { slug: 'evaluating-llm-outputs',         title: 'Evaluating LLM Outputs',            estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'generative-models',
        title: 'Generative Models',
        subchapters: [
          { slug: 'diffusion-models',               title: 'Diffusion Models Overview',         estimatedMinutes: 7 },
          { slug: 'gans-vs-vaes-vs-diffusion',      title: 'GANs vs VAEs vs Diffusion',         estimatedMinutes: 7 },
        ],
      },
      {
        slug: 'reinforcement-learning',
        title: 'Reinforcement Learning',
        subchapters: [
          { slug: 'agents-environments-rewards',    title: 'Agents, Environments and Rewards',  estimatedMinutes: 7 },
          { slug: 'markov-decision-processes',      title: 'Markov Decision Processes',         estimatedMinutes: 7 },
          { slug: 'q-learning',                     title: 'Q-Learning',                        estimatedMinutes: 8 },
          { slug: 'policy-gradients',               title: 'Policy Gradients Overview',         estimatedMinutes: 7 },
        ],
      },
    ],
  },

  // ── Part 6: MLOps and Deployment (Checklist §8) ───────────────────────────
  {
    number: 6,
    slug: 'mlops',
    title: 'MLOps and Deployment',
    icon: '🚀',
    chapters: [
      {
        slug: 'experiment-management',
        title: 'Experiment Management',
        subchapters: [
          { slug: 'experiment-tracking',            title: 'Experiment Tracking — MLflow and W&B', estimatedMinutes: 6 },
          { slug: 'dataset-model-versioning',       title: 'Dataset and Model Versioning',      estimatedMinutes: 6 },
          { slug: 'reproducibility',                title: 'Reproducibility',                   estimatedMinutes: 5 },
        ],
      },
      {
        slug: 'serving',
        title: 'Serving',
        subchapters: [
          { slug: 'model-as-api',                   title: 'Wrapping a Model in an API',        estimatedMinutes: 6 },
          { slug: 'docker-basics',                  title: 'Docker Basics',                     estimatedMinutes: 6 },
          { slug: 'cloud-deployment',               title: 'Deploying to the Cloud',            estimatedMinutes: 6 },
        ],
      },
      {
        slug: 'operations',
        title: 'Operations',
        subchapters: [
          { slug: 'model-monitoring',               title: 'Model Monitoring',                  estimatedMinutes: 6 },
          { slug: 'data-drift-concept-drift',       title: 'Data Drift and Concept Drift',      estimatedMinutes: 7 },
          { slug: 'retraining-strategy',            title: 'Model Retraining Strategy',         estimatedMinutes: 6 },
        ],
      },
    ],
  },
];

export interface TopicLocation {
  partSlug: string;
  partTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  subSlug: string;
  subTitle: string;
}

const topicLocationMap = new Map<string, TopicLocation>();

for (const part of toc) {
  for (const chapter of part.chapters) {
    for (const sub of chapter.subchapters) {
      topicLocationMap.set(sub.slug, {
        partSlug: part.slug,
        partTitle: part.title,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        subSlug: sub.slug,
        subTitle: sub.title,
      });
    }
  }
}

export function getTopicLocation(subSlug: string): TopicLocation | undefined {
  return topicLocationMap.get(subSlug);
}
