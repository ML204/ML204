'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
  id: string;
  kind: 'mcq' | 'numeric';
  text: string;
  options?: string[];        // for mcq
  correctIndex?: number;     // for mcq
  correctValue?: number;     // for numeric
  tolerance?: number;        // for numeric (±)
  explanation: string;
  figureHint?: string;       // what to try in the figure
}

interface QuizProps {
  questions: QuizQuestion[];
}

type AnswerState = {
  selected: number | string | null;
  submitted: boolean;
  correct: boolean;
};

export function Quiz({ questions }: QuizProps) {
  const [phase, setPhase] = useState<'idle' | 'answering' | 'results'>('idle');
  const [current, setCurrent] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    questions.map(() => ({ selected: null, submitted: false, correct: false }))
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const q = questions[current];
  const ans = answers[current];
  const score = answers.filter((a) => a.correct).length;

  function selectOption(idx: number) {
    if (ans.submitted) return;
    setAnswers((prev) =>
      prev.map((a, i) => (i === current ? { ...a, selected: idx } : a))
    );
  }

  function submitAnswer() {
    if (ans.selected === null) return;
    let correct = false;
    if (q.kind === 'mcq') {
      correct = ans.selected === q.correctIndex;
    } else if (q.kind === 'numeric') {
      const diff = Math.abs(Number(ans.selected) - (q.correctValue ?? 0));
      correct = diff <= (q.tolerance ?? 0.01);
    }
    if (!correct) {
      setCountdown(3);
    } else {
      setCountdown(0);
    }
    setAnswers((prev) =>
      prev.map((a, i) => (i === current ? { ...a, submitted: true, correct } : a))
    );
  }

  function next() {
    setCountdown(0);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setPhase('results');
    }
  }

  function retake() {
    setCurrent(0);
    setCountdown(0);
    setAnswers(questions.map(() => ({ selected: null, submitted: false, correct: false })));
    setPhase('answering');
  }

  // ── Idle ──
  if (phase === 'idle') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-2xl mb-2">🧩</p>
        <p className="font-semibold text-slate-800 mb-1">Ready to test yourself?</p>
        <p className="text-sm text-slate-500 mb-4">{questions.length} questions · explanations shown after</p>
        <button
          onClick={() => setPhase('answering')}
          className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          Take the quiz →
        </button>
      </div>
    );
  }

  // ── Results ──
  if (phase === 'results') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Score header */}
        <div className={cn(
          'px-6 py-5 text-center',
          score === questions.length ? 'bg-green-50' : 'bg-blue-50'
        )}>
          <p className="text-3xl font-black text-slate-900">
            {score} / {questions.length}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {score === questions.length
              ? '🎉 Perfect! You got them all.'
              : score >= questions.length / 2
              ? '👍 Good work — check the explanations below.'
              : '📖 Review the explanations and try again.'}
          </p>
        </div>

        {/* Per-question explanation */}
        <div className="divide-y divide-slate-100">
          {questions.map((q, i) => (
            <div key={q.id} className="px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {answers[i].correct ? '✅' : '❌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 mb-2">{q.text}</p>
                  {q.kind === 'mcq' && q.options && (
                    <p className="text-sm text-green-700 mb-2">
                      ✓ Correct answer: <strong>{q.options[q.correctIndex ?? 0]}</strong>
                    </p>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed">{q.explanation}</p>
                  {q.figureHint && (
                    <p className="mt-2 text-xs text-brand-600 font-medium">
                      🔭 {q.figureHint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-center">
          <button
            onClick={retake}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white transition-colors"
          >
            ↺ Retake quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Answering ──
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="px-6 py-5">
        {/* Counter */}
        <p className="text-xs font-semibold text-slate-400 mb-3">
          Question {current + 1} of {questions.length}
        </p>

        {/* Question */}
        <p className="text-base font-semibold text-slate-900 mb-5 leading-snug">{q.text}</p>

        {/* MCQ options */}
        {q.kind === 'mcq' && q.options && (
          <div className="space-y-2 mb-5">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={cn('quiz-option', {
                  'selected':  !ans.submitted && ans.selected === idx,
                  'correct':   ans.submitted && idx === q.correctIndex,
                  'incorrect': ans.submitted && ans.selected === idx && idx !== q.correctIndex,
                })}
              >
                <span className="font-semibold text-slate-400 mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Numeric input */}
        {q.kind === 'numeric' && (
          <div className="mb-5">
            <input
              type="number"
              placeholder="Your answer"
              disabled={ans.submitted}
              onChange={(e) =>
                setAnswers((prev) =>
                  prev.map((a, i) => (i === current ? { ...a, selected: e.target.value } : a))
                )
              }
              className="w-40 px-3 py-2 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-brand-400 text-sm"
            />
          </div>
        )}

        {/* Explanation (shown after submitting) */}
        {ans.submitted && (
          <div className={cn(
            'rounded-xl px-4 py-3 mb-4 text-sm transition-all',
            ans.correct
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-amber-50 text-amber-950 border border-amber-200'
          )}>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <p className="font-bold text-sm">
                {ans.correct ? '✅ Correct!' : '❌ Not quite.'}
              </p>
              {!ans.correct && countdown > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  <span>⏳ Read the notes</span>
                  <span className="font-mono font-bold text-amber-900">{countdown}s</span>
                </span>
              )}
            </div>
            <p className="leading-relaxed text-slate-700">{q.explanation}</p>
            {q.figureHint && (
              <p className="mt-2 text-xs font-medium text-brand-700">🔭 {q.figureHint}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!ans.submitted ? (
            <button
              onClick={submitAnswer}
              disabled={ans.selected === null}
              className="px-5 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              Check answer
            </button>
          ) : (
            <button
              onClick={next}
              disabled={countdown > 0}
              className={cn(
                'px-5 py-2 font-semibold rounded-xl transition-all inline-flex items-center gap-2',
                countdown > 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:scale-[0.98]'
              )}
            >
              {countdown > 0 ? (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold font-mono">
                    {countdown}
                  </span>
                  <span>
                    {current < questions.length - 1
                      ? `Next question (${countdown}s)`
                      : `See results (${countdown}s)`}
                  </span>
                </>
              ) : (
                <span>{current < questions.length - 1 ? 'Next question →' : 'See results →'}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
