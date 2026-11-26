/**
 * Pure 2D linear algebra math helpers shared across interactive Linear Algebra figures.
 */

export interface Vec2 {
  x: number;
  y: number;
}

/** Row-major 2x2 matrix: [[a, b], [c, d]]. */
export type Mat2 = [[number, number], [number, number]];

export const IDENTITY_MAT2: Mat2 = [
  [1, 0],
  [0, 1],
];

/** Euclidean magnitude of a 2D vector. */
export function norm2(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

/** General L_p norm of a 2D vector (supports Infinity via p === Infinity). */
export function normP(v: Vec2, p: number): number {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  if (!Number.isFinite(p) || p >= 50) {
    return Math.max(ax, ay);
  }
  return Math.pow(Math.pow(ax, p) + Math.pow(ay, p), 1 / p);
}

/** Dot product u · v in 2D. */
export function dot2(u: Vec2, v: Vec2): number {
  return u.x * v.x + u.y * v.y;
}

/** Counter-clockwise / shortest angle in degrees between two 2D vectors (0..180). */
export function angleDeg2(u: Vec2, v: Vec2): number {
  const nu = norm2(u);
  const nv = norm2(v);
  if (nu < 1e-8 || nv < 1e-8) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot2(u, v) / (nu * nv)));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

/** Orthogonal projection of `a` onto `b`. Returns zero vector if `b` is near zero. */
export function projectOnto(a: Vec2, b: Vec2): { scalarCoeff: number; vec: Vec2 } {
  const denom = dot2(b, b);
  if (denom < 1e-8) {
    return { scalarCoeff: 0, vec: { x: 0, y: 0 } };
  }
  const scalarCoeff = dot2(a, b) / denom;
  return {
    scalarCoeff,
    vec: { x: scalarCoeff * b.x, y: scalarCoeff * b.y },
  };
}

/** Matrix-vector product A * v. */
export function matVec2(m: Mat2, v: Vec2): Vec2 {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y,
    y: m[1][0] * v.x + m[1][1] * v.y,
  };
}

/** Matrix-matrix product A * B for 2x2 matrices. */
export function matMul2(A: Mat2, B: Mat2): Mat2 {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
}

/** Transpose of a 2x2 matrix. */
export function transpose2(m: Mat2): Mat2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
}

/** Determinant ad - bc of a 2x2 matrix. */
export function det2(m: Mat2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

/** Inverse of a 2x2 matrix, or null when singular (|det| < eps). */
export function inv2(m: Mat2, eps = 1e-6): Mat2 | null {
  const d = det2(m);
  if (Math.abs(d) < eps) return null;
  return [
    [m[1][1] / d, -m[0][1] / d],
    [-m[1][0] / d, m[0][0] / d],
  ];
}

/** Linear elementwise blend (1 - t) * A + t * B. */
export function lerpMat2(A: Mat2, B: Mat2, t: number): Mat2 {
  return [
    [A[0][0] + (B[0][0] - A[0][0]) * t, A[0][1] + (B[0][1] - A[0][1]) * t],
    [A[1][0] + (B[1][0] - A[1][0]) * t, A[1][1] + (B[1][1] - A[1][1]) * t],
  ];
}

export interface RealEigenpair2 {
  lambda: number;
  vec: Vec2;
}

export interface Eigen2Result {
  kind: 'real' | 'complex';
  trace: number;
  det: number;
  discriminant: number;
  realPairs: RealEigenpair2[];
  complexParts?: { real: number; imag: number };
}

/**
 * Exact closed-form 2x2 eigendecomposition via characteristic polynomial:
 * lambda^2 - trace(A)*lambda + det(A) = 0.
 */
export function eigen2x2(m: Mat2): Eigen2Result {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];
  const trace = a + d;
  const det = a * d - b * c;
  const disc = trace * trace - 4 * det;

  if (disc < -1e-6) {
    return {
      kind: 'complex',
      trace,
      det,
      discriminant: disc,
      realPairs: [],
      complexParts: { real: trace / 2, imag: Math.sqrt(-disc) / 2 },
    };
  }

  const sqrtDisc = Math.sqrt(Math.max(0, disc));
  const l1 = (trace + sqrtDisc) / 2;
  const l2 = (trace - sqrtDisc) / 2;

  const unitEigenvec = (lambda: number, fallbackIdx: number): Vec2 => {
    let vx = b;
    let vy = lambda - a;
    if (Math.hypot(vx, vy) < 1e-6) {
      vx = lambda - d;
      vy = c;
    }
    if (Math.hypot(vx, vy) < 1e-6) {
      // Scalar multiple of identity (a == d, b == c == 0)
      return fallbackIdx === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
    }
    const len = Math.hypot(vx, vy);
    vx /= len;
    vy /= len;
    // Canonical sign so labels do not flip randomly
    if (vx < -1e-6 || (Math.abs(vx) <= 1e-6 && vy < 0)) {
      vx = -vx;
      vy = -vy;
    }
    return { x: vx, y: vy };
  };

  const v1 = unitEigenvec(l1, 0);
  const v2 = unitEigenvec(l2, 1);

  return {
    kind: 'real',
    trace,
    det,
    discriminant: disc,
    realPairs: [
      { lambda: l1, vec: v1 },
      { lambda: l2, vec: v2 },
    ],
  };
}

export interface SVD2Result {
  U: Mat2;
  sigma: [number, number];
  Vt: Mat2;
  /** Singular vectors in input space (columns of V). */
  v1: Vec2;
  v2: Vec2;
  /** Singular vectors in output space (columns of U). */
  u1: Vec2;
  u2: Vec2;
}

/**
 * Exact 2x2 Singular Value Decomposition A = U * diag(s1, s2) * V^T
 * with s1 >= s2 >= 0 computed via symmetric eigendecomposition of A^T A.
 */
export function svd2x2(m: Mat2): SVD2Result {
  const AtA = matMul2(transpose2(m), m);
  // AtA = [[p, q], [q, r]] is symmetric positive semi-definite
  const p = AtA[0][0];
  const q = AtA[0][1];
  const r = AtA[1][1];

  const phi = 0.5 * Math.atan2(2 * q, p - r);
  const c = Math.cos(phi);
  const s = Math.sin(phi);

  const lam1 = c * c * p + 2 * c * s * q + s * s * r;
  const lam2 = s * s * p - 2 * c * s * q + c * c * r;

  let v1: Vec2 = { x: c, y: s };
  let v2: Vec2 = { x: -s, y: c };
  let s1 = Math.sqrt(Math.max(0, lam1));
  let s2 = Math.sqrt(Math.max(0, lam2));

  // Ensure decreasing ordering s1 >= s2
  if (s2 > s1) {
    [s1, s2] = [s2, s1];
    [v1, v2] = [v2, v1];
  }

  // Ensure right-handed orthonormal V (det = +1) for smooth geometric rotation visualization
  if (v1.x * v2.y - v1.y * v2.x < 0) {
    v2 = { x: -v2.x, y: -v2.y };
  }

  // Compute u_i = (A * v_i) / s_i when s_i > eps
  let u1: Vec2;
  let u2: Vec2;
  if (s1 > 1e-6) {
    const av1 = matVec2(m, v1);
    u1 = { x: av1.x / s1, y: av1.y / s1 };
  } else {
    u1 = { x: 1, y: 0 };
  }

  if (s2 > 1e-6) {
    const av2 = matVec2(m, v2);
    // Re-orthogonalize slightly for floating point hygiene
    const proj = dot2(av2, u1);
    const ortho = { x: av2.x - proj * u1.x, y: av2.y - proj * u1.y };
    const len = norm2(ortho);
    u2 = len > 1e-8 ? { x: ortho.x / len, y: ortho.y / len } : { x: -u1.y, y: u1.x };
  } else {
    // Pick unit vector orthogonal to u1; sign preserves det(U) matching sign(det(m)) if needed
    u2 = { x: -u1.y, y: u1.x };
  }

  const U: Mat2 = [
    [u1.x, u2.x],
    [u1.y, u2.y],
  ];
  const Vt: Mat2 = [
    [v1.x, v1.y],
    [v2.x, v2.y],
  ];

  return { U, sigma: [s1, s2], Vt, v1, v2, u1, u2 };
}

/** Clamps value cleanly to [min, max] and snaps to optional increment. */
export function snapClamp(val: number, min: number, max: number, step = 0.5): number {
  const clamped = Math.max(min, Math.min(max, val));
  return Math.round(clamped / step) * step;
}

/**
 * Computes exact SVD (U, S, V) of a small real m x n matrix via Jacobi eigenvalue rotations on A^T A.
 * Used for interactive low-rank matrix approximation demos without external dependencies.
 */
export function svdSmallMatrix(A: number[][]): {
  U: number[][];
  S: number[];
  V: number[][];
} {
  const m = A.length;
  const n = A[0]?.length ?? 0;
  if (m === 0 || n === 0) return { U: [], S: [], V: [] };

  // Build symmetric matrix B = A^T A (n x n)
  const B: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let r = 0; r < m; r++) sum += A[r][i] * A[r][j];
      B[i][j] = sum;
      B[j][i] = sum;
    }
  }

  // Jacobi rotations to diagonalize B -> V^T B V
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
  );

  for (let sweep = 0; sweep < 40; sweep++) {
    let maxOff = 0;
    let p = 0;
    let q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const val = Math.abs(B[i][j]);
        if (val > maxOff) {
          maxOff = val;
          p = i;
          q = j;
        }
      }
    }
    if (maxOff < 1e-10) break;

    const app = B[p][p];
    const aqq = B[q][q];
    const apq = B[p][q];
    const tau = (aqq - app) / (2 * apq);
    const t =
      tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;

    B[p][p] = app - t * apq;
    B[q][q] = aqq + t * apq;
    B[p][q] = 0;
    B[q][p] = 0;

    for (let k = 0; k < n; k++) {
      if (k !== p && k !== q) {
        const bkp = B[k][p];
        const bkq = B[k][q];
        B[k][p] = c * bkp - s * bkq;
        B[p][k] = B[k][p];
        B[k][q] = s * bkp + c * bkq;
        B[q][k] = B[k][q];
      }
      const vkp = V[k][p];
      const vkq = V[k][q];
      V[k][p] = c * vkp - s * vkq;
      V[k][q] = s * vkp + c * vkq;
    }
  }

  // Sort singular values descending
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => B[j][j] - B[i][i]);
  const S = order.map((idx) => Math.sqrt(Math.max(0, B[idx][idx])));
  const VSorted: number[][] = Array.from({ length: n }, (_, r) => order.map((idx) => V[r][idx]));

  // Compute left singular vectors u_j = (A v_j) / sigma_j
  const U: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const sigma = S[j];
    if (sigma > 1e-8) {
      for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let k = 0; k < n; k++) sum += A[i][k] * VSorted[k][j];
        U[i][j] = sum / sigma;
      }
    }
  }

  return { U, S, V: VSorted };
}

