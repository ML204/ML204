# Contributing to MLTheta 📖

Welcome to **MLTheta**! We are building a free, visual, interactive machine learning textbook for college and undergraduate students.

To support **10 to 20 contributors** working concurrently without stepping on each other's toes or causing merge conflicts, please follow this topic-distribution guide.

---

## 🎯 Core Philosophy: 1 Contributor = 1 Branch = 1 Topic

Every contributor works on **one specific topic** in **one dedicated branch**. 

Because each topic has its own distinct `.mdx` file, 20 people can work in parallel with **zero merge conflicts** as long as everyone sticks to their assigned topic file.

---

## 📋 The 5-Step Contribution Flow

### Step 1: Claim a Topic on GitHub
Before writing any code, claim your topic so other contributors know it is taken:
1. Open the [GitHub Issues](https://github.com/mltheta/mltheta/issues) or **Project Board**.
2. Find the issue for your desired topic (e.g., `[Topic] Logistic Regression`).
3. Comment *"I would like to work on this"* and assign it to yourself.
4. Move the issue to **In Progress**.

### Step 2: Create Your Topic Branch
Always branch from the latest `main` branch. Use the naming convention:
```bash
git checkout main
git pull origin main
git checkout -b content/<part-slug>/<topic-slug>
```

#### Examples:
```bash
git checkout -b content/math-foundations/eigenvalues-eigenvectors
git checkout -b content/classical-ml/decision-trees
git checkout -b content/classical-ml/logistic-regression
git checkout -b content/deep-learning/backpropagation
```

---

### Step 3: Write Your Topic & Quizzes

Your topic lives in:
```text
src/content/<part>/<chapter>/<topic-slug>.mdx
```

#### What Files You OWN (Allowed to Edit):
- ✅ `src/content/<part>/<chapter>/<topic-slug>.mdx` — Your topic content.
- ✅ `public/images/<topic-slug>/*` — Your diagrams and visual charts.
- ✅ `public/resources/<topic-slug>/*` — Optional offline PDF notes or cheatsheets.
- ✅ `src/components/figures/<topic-slug>/*` — Optional interactive React slider/figure.

#### What Files NOT to Touch:
- ❌ `src/lib/toc.ts` — The repository maintainer marks `done: true` when merging your PR to avoid 20-person merge conflicts.
- ❌ `package.json` / `package-lock.json` — Do not install new dependencies without prior approval.
- ❌ `android/*`, `src/app/layout.tsx`, `src/app/globals.css` — Core infrastructure files.

---

### Step 4: Topic Quality Checklist

Every completed chapter must meet these pedagogical standards:

1. **Target Audience**: High school and university students learning ML concepts for the first time.
2. **Visual & Intuitive**: Explain ideas using geometric analogies, coordinate spaces, and visual intuition before introducing mathematical formulas.
3. **Responsive LaTeX Math**:
   - Wrap all multi-line equations inside `\begin{aligned} ... \end{aligned}` with `&=` alignment.
   - Never leave unwrapped `\\` or `&` directly inside `$$ ... $$` (this causes KaTeX parse errors on mobile).
   - Break long equations across lines so they fit comfortably on mobile phone screens.
4. **Comprehensive Interactive Quiz**:
   - Provide **15 to 25 MCQs** using the `<Quiz questions={[...]} />` component.
   - Every question must include a thorough `explanation` note explaining *why* the correct answer is true and *why* common traps fail.
   - Note: The app automatically enforces a 3-second study countdown on incorrect answers so students read your notes!
5. **Takeaways & Self-Check**:
   - Include `<TeachThisCard />` summarizing the one-liner, 4 key takeaways, and the #1 common trap.
   - Include `<ExplainInOwnWords />` checklist.
   - Include `<ResourcesSection />` with offline/reading materials.

---

### Step 5: Test Locally & Open a Pull Request

Before pushing, always run the production build to ensure there are no syntax, TypeScript, or KaTeX errors:

```bash
npm run build
```

If the build outputs `✓ Generating static pages (176/176)` with 0 errors:

```bash
git add src/content/<part>/<chapter>/<topic-slug>.mdx public/
git commit -m "feat(content): add <topic-name> interactive chapter and quiz bank"
git push origin content/<part-slug>/<topic-slug>
```

Then go to GitHub and click **"Compare & pull request"**:
- Target: `main`
- PR Title: `feat(content): <Topic Name>`
- Description: Link the issue you claimed (e.g., `Closes #12`).

---

## 🤝 Questions & Review Process

- Once your PR is submitted, maintainers will review the pedagogical flow, visual formatting, and quiz explanations.
- Once approved, your PR will be **Squashed and Merged** into `main`, and your topic will go live on the website and offline Android app!
