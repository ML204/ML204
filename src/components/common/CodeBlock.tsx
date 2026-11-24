'use client';

import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return '';
}

function getLanguage(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1].toLowerCase() : 'text';
}

function getLangMeta(lang: string) {
  switch (lang) {
    case 'python':
    case 'py':
      return { label: 'Python', icon: '🐍', color: 'text-amber-400' };
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return { label: 'Terminal / Bash', icon: '🐚', color: 'text-emerald-400' };
    case 'json':
      return { label: 'JSON', icon: '📦', color: 'text-sky-400' };
    case 'sql':
      return { label: 'SQL', icon: '🗄️', color: 'text-purple-400' };
    case 'c':
    case 'cpp':
      return { label: 'C / C++', icon: '⚙️', color: 'text-blue-400' };
    default:
      return { label: lang.toUpperCase() || 'Code', icon: '📄', color: 'text-slate-300' };
  }
}

export function CodeBlock({ children, className: preClassName }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract raw text and language from the inner <code> element
  let codeText = '';
  let lang = 'python';

  if (React.isValidElement(children)) {
    const codeProps = children.props as { className?: string; children?: React.ReactNode };
    lang = getLanguage(codeProps.className || preClassName);
    codeText = extractText(codeProps.children);
  } else {
    codeText = extractText(children);
    lang = getLanguage(preClassName);
  }

  // Trim trailing newline only
  const cleanCode = codeText.replace(/\n$/, '');

  // Highlight syntax using Prism
  let highlightedHtml = '';
  try {
    const grammar = Prism.languages[lang] || Prism.languages.python;
    highlightedHtml = Prism.highlight(cleanCode, grammar, lang);
  } catch {
    highlightedHtml = cleanCode;
  }

  const meta = getLangMeta(lang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="not-prose my-6 rounded-2xl overflow-hidden border border-[#2e3440] bg-[#1a1b26] shadow-xl text-slate-100 font-mono text-[13px] leading-relaxed">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#16161e] border-b border-[#2e3440]/80 select-none">
        <div className="flex items-center gap-2.5">
          {/* macOS traffic light window buttons */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs opacity-90 hover:opacity-100" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs opacity-90 hover:opacity-100" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs opacity-90 hover:opacity-100" />
          </div>

          <div className="flex items-center gap-1.5 ml-2 text-xs font-semibold tracking-wide text-slate-300">
            <span>{meta.icon}</span>
            <span className={meta.color}>{meta.label}</span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#24283b] hover:bg-[#2f3549] border border-[#3b4261] transition-all duration-150 active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Python IDE Syntax Highlighting */}
      <div className="p-4 sm:p-5 overflow-x-auto text-slate-200 selection:bg-[#3b4261] selection:text-white">
        <pre className="!bg-transparent !p-0 !m-0 font-mono text-[13px] leading-6 tracking-normal">
          <code
            className={`language-${lang} block`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
