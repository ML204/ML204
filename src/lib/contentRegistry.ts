import type { ComponentType } from 'react';

type MDXModule = {
  default: ComponentType;
};

type Loader = () => Promise<MDXModule>;

export const contentRegistry: Record<string, Loader> = {
  'math-foundations/linear-algebra/vectors-and-matrices': () =>
    import('@/content/math-foundations/linear-algebra/vectors-and-matrices.mdx'),
  'math-foundations/calculus/what-is-optimization': () =>
    import('@/content/math-foundations/calculus/what-is-optimization.mdx'),
  'math-foundations/calculus/loss-functions': () =>
    import('@/content/math-foundations/calculus/loss-functions.mdx'),
  'math-foundations/calculus/gradient-descent': () =>
    import('@/content/math-foundations/calculus/gradient-descent.mdx'),
  'math-foundations/calculus/learning-rate': () =>
    import('@/content/math-foundations/calculus/learning-rate.mdx'),
  'math-foundations/calculus/sgd-vs-batch': () =>
    import('@/content/math-foundations/calculus/sgd-vs-batch.mdx'),
  'classical-ml/supervised-regression/linear-regression': () =>
    import('@/content/classical-ml/supervised-regression/linear-regression.mdx'),
  'classical-ml/supervised-regression/ordinary-least-squares': () =>
    import('@/content/classical-ml/supervised-regression/ordinary-least-squares.mdx'),
  'classical-ml/supervised-regression/ridge-regression': () =>
    import('@/content/classical-ml/supervised-regression/ridge-regression.mdx'),
};

export async function getSubchapterContent(part: string, chapter: string, sub: string): Promise<ComponentType | null> {
  const key = `${part}/${chapter}/${sub}`;
  const loader = contentRegistry[key];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch (err) {
    console.error(`[ContentRegistry] Error loading MDX module for ${key}:`, err);
    return null;
  }
}
