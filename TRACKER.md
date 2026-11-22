# MLens — Development Tracker

> Last updated: 2026-11-22

---

## 🏗️ Phase 1 — Foundation

| Task | Status |
|---|---|
| Next.js 15 + TypeScript setup | ✅ Done |
| Tailwind CSS + design tokens (brand colors, fig colors) | ✅ Done |
| MDX + remark-math + rehype-katex | ✅ Done |
| `next.config.js` | ✅ Done |
| `tsconfig.json` | ✅ Done |
| Root layout (header + sidebar shell) | ✅ Done |
| `SiteHeader` component | ✅ Done |
| `Sidebar` component (collapsible, mobile-aware) | ✅ Done |
| Landing page (`/`) with hero + TOC | ✅ Done |
| `toc.ts` — single source of truth for all content | ✅ Done |
| `lib/figureState.ts` — URL-serializable state | ✅ Done |
| `lib/progress.ts` — localStorage progress tracking | ✅ Done |
| `lib/utils.ts` — `cn()` helper | ✅ Done |
| `locales/en.json` — i18n-ready UI strings | ✅ Done |
| Dynamic sub-chapter route `/learn/[part]/[chapter]/[sub]` | ✅ Done |
| Part listing page `/learn/[part]` (e.g. `/learn/math-foundations`) | ✅ Done |
| Chapter listing page `/learn/[part]/[chapter]` (e.g. `/learn/math-foundations/linear-algebra`) | ✅ Done |
| All topics curriculum directory `/learn` | ✅ Done |
| Prev / Next navigation between sub-chapters | ✅ Done |
| Clickable breadcrumb hierarchy throughout all pages | ✅ Done |
| `FigureBox` — shared figure wrapper | ✅ Done |
| `FigureControls` — Slider, Toggle, Dropdown, Presets, PlayControls, LiveValuesPanel | ✅ Done |
| `SubchapterBlocks` — Section, Callout, Analogy, Formula, SymbolTable, Divider | ✅ Done |
| `Quiz` engine — MCQ, numeric, results page, retake | ✅ Done |
| `FeedbackBar` — "Was this clear?" + suggestion box | ✅ Done |
| `.gitignore` | ✅ Done |
| Production build passes (`npm run build`) | ✅ Done |
| Dev server running (`npm run dev` → localhost:3000) | ✅ Done |

---

## 📐 Phase 2 — Vertical Slice: Gradient Descent

### Sub-chapters

| Sub-chapter | MDX Content | Figure | Quiz | Status |
|---|---|---|---|---|
| What is Optimization? | ⬜ | ⬜ | ⬜ | 🔲 Not started |
| Loss Functions | ⬜ | ⬜ | ⬜ | 🔲 Not started |
| **Gradient Descent** | ✅ | ✅ D3 animated | ✅ 4 Qs | ✅ Done |
| Learning Rate & Convergence | ⬜ | ⬜ | ⬜ | 🔲 Not started |
| SGD vs Batch GD | ⬜ | ⬜ | ⬜ | 🔲 Not started |

### Phase 2 Checklist

| Task | Status |
|---|---|
| `GradientDescentFigure` — D3 loss curve, animated ball, gradient arrow, presets | ✅ Done |
| "Break it" preset (α = 1.2 → divergence) | ✅ Done |
| Play / Pause / Step / Reset controls | ✅ Done |
| Live values panel (w, Loss, ∇L, Steps, α) | ✅ Done |
| History trail on figure | ✅ Done |
| `gradient-descent.mdx` — full sub-chapter with 9 sections | ✅ Done |
| `what-is-optimization.mdx` + OptimizationFigure | ✅ Done |
| `loss-functions.mdx` + LossFunctionsFigure | ✅ Done |
| `learning-rate.mdx` + LearningRateFigure | ✅ Done |
| `sgd-vs-batch.mdx` + SGDBatchFigure | ✅ Done |

---

## 🧪 Phase 3 — Student Testing

| Task | Status |
|---|---|
| Deploy to Vercel | 🔲 Not started |
| Recruit 3–5 test students | 🔲 Not started |
| Collect clarity ratings + quiz scores | 🔲 Not started |
| Rewrite low-clarity sub-chapters | 🔲 Not started |

---

## 🌐 Phase 4 — Bangla

| Task | Status |
|---|---|
| `locales/bn.json` — Bangla UI strings | 🔲 Not started |
| Language toggle in header | 🔲 Not started |
| Noto Sans Bengali font integration | 🔲 Not started |
| Translate Gradient Descent slice | 🔲 Not started |
| Native-reader review | 🔲 Not started |
| Bengali chart labels | 🔲 Not started |

---

## 📊 Phase 5 — Content (Follows ML Learning Checklist Exactly)

### Part 1: Math Foundations (Checklist §2)

#### 1. Linear Algebra
| Sub-chapter | MDX Content | Figure | Quiz | Status |
|---|---|---|---|---|
| **Vectors and Matrices** | ✅ | ✅ VectorMatrixFigure | ✅ 4 Qs | ✅ Done |
| Dot Product and Matrix Multiplication | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Transpose, Inverse and Determinant | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Norms — L1 and L2 | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Eigenvalues and Eigenvectors | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Singular Value Decomposition (SVD) | 🔲 | 🔲 | 🔲 | 🔲 Not started |

#### 2. Calculus
| Sub-chapter | MDX Content | Figure | Quiz | Status |
|---|---|---|---|---|
| Derivatives and the Chain Rule | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Partial Derivatives | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| Gradients and the Jacobian | 🔲 | 🔲 | 🔲 | 🔲 Not started |
| **What is Optimization?** | ✅ | ✅ OptimizationFigure | ✅ 4 Qs | ✅ Done |
| **Loss Functions** | ✅ | ✅ LossFunctionsFigure | ✅ 4 Qs | ✅ Done |
| **Gradient Descent** | ✅ | ✅ GradientDescentFigure | ✅ 4 Qs | ✅ Done |
| **Learning Rate and Convergence** | ✅ | ✅ LearningRateFigure | ✅ 4 Qs | ✅ Done |
| **SGD vs Batch Gradient Descent** | ✅ | ✅ SGDBatchFigure | ✅ 4 Qs | ✅ Done |

#### 3. Probability
| Sub-chapter | Status |
|---|---|
| Random Variables and Distributions | 🔲 |
| Expectation, Variance and Covariance | 🔲 |
| Conditional Probability and Bayes' Rule | 🔲 |
| Common Distributions (Gaussian, Bernoulli, Binomial, Poisson) | 🔲 |
| Maximum Likelihood Estimation (MLE) | 🔲 |

#### 4. Statistics
| Sub-chapter | Status |
|---|---|
| Sampling and the Central Limit Theorem | 🔲 |
| Hypothesis Testing and p-values | 🔲 |
| Confidence Intervals | 🔲 |
| Correlation vs Causation | 🔲 |

#### 5. Optimization and Information Theory
| Sub-chapter | Status |
|---|---|
| SGD, Momentum, RMSProp and Adam | 🔲 |
| Convex vs Non-Convex Functions | 🔲 |
| Entropy and Cross-Entropy | 🔲 |
| KL Divergence | 🔲 |

---

### Part 2: Data Handling and Preparation (Checklist §3)

| Chapter | Sub-chapters | Status |
|---|---|---|
| Exploring Data | EDA, Summary Statistics, Correlation Analysis | 🔲 |
| Cleaning | Missing Values, Outlier Detection, Duplicates & Inconsistent Labels | 🔲 |
| Feature Work | Scaling, Encoding, Feature Engineering, Feature Selection, Dimensionality Reduction | 🔲 |
| Splitting & Pitfalls | Train/Val/Test Splits, Stratified Splits, Time-Based Splits, Data Leakage, Class Imbalance | 🔲 |

---

### Part 3: Classical Machine Learning (Checklist §4)

| Chapter | Sub-chapters | Status |
|---|---|---|
| Supervised: Regression | Linear Regression, Polynomial Regression, Ridge & Lasso | 🔲 |
| Supervised: Classification | Logistic Regression, k-NN, Naive Bayes, SVM & Kernels, Decision Trees | 🔲 |
| Ensemble Methods | Bagging & Random Forests, Gradient Boosting, XGBoost/LightGBM, Stacking & Voting | 🔲 |
| Unsupervised Learning | k-Means, Hierarchical Clustering, DBSCAN, Gaussian Mixture Models, PCA, t-SNE & UMAP | 🔲 |
| Anomaly Detection | Statistical Thresholds, Isolation Forest, One-Class SVM, Autoencoder-based | 🔲 |
| Model Quality | Bias-Variance Tradeoff, L1/L2 Regularization, Cross-Validation, Grid/Random Search, Metrics (Accuracy, Precision, Recall, F1, ROC-AUC, PR), Confusion Matrix | 🔲 |

---

### Part 4: Deep Learning (Checklist §5)

| Chapter | Sub-chapters | Status |
|---|---|---|
| Neural Network Basics | Perceptron & Multilayer Networks, Activation Functions, Loss Functions, Forward & Backprop, Weight Initialization | 🔲 |
| Training Techniques | Dropout, Batch Normalization, LR Schedules, Early Stopping, Data Augmentation, Debugging | 🔲 |
| Convolutional Networks (Vision) | Convolution, Pooling, Stride, Padding, Classic Architectures (LeNet, VGG, ResNet), Transfer Learning | 🔲 |
| Sequence Models | RNN Basics & Vanishing Gradients, LSTM & GRU, Sequence-to-Sequence | 🔲 |
| Attention & Transformers | Self-Attention, Transformer Architecture, Positional Encoding, BERT & GPT Overview | 🔲 |
| Other Architectures | Autoencoders, Variational Autoencoders (VAE), GANs Overview | 🔲 |

---

### Part 5: Specialized Areas (Checklist §6)

| Chapter | Sub-chapters | Status |
|---|---|---|
| Time-Series & Sensor Data | Trend, Seasonality, Stationarity, Moving Averages & ARIMA, Windowing, LSTM/1D-CNN, Forecasting Evaluation | 🔲 |
| Computer Vision | Image Classification, Object Detection (YOLO), Segmentation Basics | 🔲 |
| Natural Language Processing | Tokenization, Bag of Words & TF-IDF, Word Embeddings, Text Classification, Fine-Tuning | 🔲 |
| Large Language Models | How LLMs Are Trained, Prompt Engineering, RAG, Fine-Tuning & LoRA, Evaluating LLM Outputs | 🔲 |
| Generative Models | Diffusion Models, GANs vs VAEs vs Diffusion | 🔲 |
| Reinforcement Learning | Agents & Environments, Markov Decision Processes, Q-Learning, Policy Gradients | 🔲 |

---

### Part 6: MLOps and Deployment (Checklist §8)

| Chapter | Sub-chapters | Status |
|---|---|---|
| Experiment Management | Experiment Tracking (MLflow/W&B), Dataset & Model Versioning, Reproducibility | 🔲 |
| Serving | Model as an API (FastAPI), Docker Basics, Cloud Deployment | 🔲 |
| Operations | Model Monitoring, Data Drift & Concept Drift, Model Retraining Strategy | 🔲 |

---

## ✨ Phase 6 — Polish & Launch

| Task | Status |
|---|---|
| Figure state → URL hash (shareable links) | ✅ Infrastructure done |
| "Explain in your own words" box | 🔲 |
| "Teach This" summary card | 🔲 |
| Teacher presenter mode | 🔲 |
| Spaced review / weak-spot practice | 🔲 |
| Offline / PWA support | 🔲 |
| Audio narration (Bangla + English) | 🔲 |
| Public launch | 🔲 |

---

## 🐛 Known Issues / To Fix

| Issue | Priority |
|---|---|
| — | — |

---

## 📝 Notes

- Content is in `src/content/[part]/[chapter]/[sub].mdx`
- TOC is `src/lib/toc.ts` — update this when adding new sub-chapters
- All figure colors: use `fig.*` tokens from `tailwind.config.js` for consistency
- Locales: add all new UI strings to `src/locales/en.json` (and later `bn.json`)
