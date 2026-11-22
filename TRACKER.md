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
| Prev / Next navigation between sub-chapters | ✅ Done |
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
| `what-is-optimization.mdx` | 🔲 Not started |
| `loss-functions.mdx` + LossFunctionsFigure | 🔲 Not started |
| `learning-rate.mdx` + LearningRateFigure | 🔲 Not started |
| `sgd-vs-batch.mdx` + SGDFigure | 🔲 Not started |

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

## 📊 Phase 5 — Expand Content

### Part 1: Math Foundations

| Chapter | Sub-chapters | Status |
|---|---|---|
| Gradient Descent | 5 sub-chapters | 🟡 1/5 done |
| Linear Algebra | Vectors & Matrices, Dot Product, Matrix Multiplication | 🔲 |
| Probability | Random Variables, Distributions, Bayes' Rule | 🔲 |

### Part 2: Data Handling

| Chapter | Sub-chapters | Status |
|---|---|---|
| Exploring Data | EDA, Distributions & Statistics | 🔲 |
| Preparing Data | Scaling, Encoding, Train/Val/Test, Data Leakage, Class Imbalance | 🔲 |

### Part 3: Classical ML

| Chapter | Sub-chapters | Status |
|---|---|---|
| Regression | Linear, Polynomial, Ridge & Lasso | 🔲 |
| Classification | Logistic, k-NN, Decision Trees, SVM | 🔲 |
| Ensemble Methods | Random Forests, Gradient Boosting | 🔲 |
| Unsupervised | k-Means, PCA | 🔲 |
| Model Quality | Bias-Variance, Metrics, Cross-Validation | 🔲 |

### Part 4: Deep Learning

| Chapter | Status |
|---|---|
| Neural Networks (Perceptron, Activation Functions, Backprop) | 🔲 |
| CNNs (Convolution, Pooling) | 🔲 |
| Attention & Transformers | 🔲 |

### Part 5: Specialized Areas

| Chapter | Status |
|---|---|
| NLP (Tokenization, Word Embeddings) | 🔲 |
| Reinforcement Learning (Agents, Q-Learning) | 🔲 |

### Part 6: MLOps

| Chapter | Status |
|---|---|
| Experiment Tracking | 🔲 |
| Monitoring & Data Drift | 🔲 |

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
