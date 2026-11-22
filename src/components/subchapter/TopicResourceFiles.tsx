'use client';

import { useState } from 'react';
import type { TopicFile } from '@/lib/topicFiles';

interface TopicResourceFilesProps {
  topicSlug: string;
  topicTitle: string;
  files: TopicFile[];
}

function getFileMeta(ext: string) {
  switch (ext) {
    case 'pdf':
      return { icon: '📕', badge: 'PDF Note', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'ipynb':
      return { icon: '🪐', badge: 'Jupyter Notebook', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'py':
      return { icon: '🐍', badge: 'Python Script', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'md':
    case 'markdown':
      return { icon: '📝', badge: 'Markdown Note', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return { icon: '🖼️', badge: 'Diagram / Image', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'zip':
    case 'tar':
    case 'gz':
      return { icon: '📦', badge: 'Dataset / Archive', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return { icon: '📄', badge: ext.toUpperCase() || 'FILE', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function TopicResourceFiles({ topicSlug, topicTitle, files }: TopicResourceFilesProps) {
  const [copied, setCopied] = useState(false);
  const dirPath = `resources/${topicSlug}/`;

  function copyPath() {
    navigator.clipboard.writeText(dirPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Filter out README.md if there are other files, or keep it if it's the only one
  const displayFiles = files.filter((f) => f.name !== 'README.md');

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📁</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Community Notes & Files
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Uploaded Materials for {topicTitle}
            </h3>
          </div>
        </div>

        <button
          onClick={copyPath}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors self-start sm:self-auto"
          title="Copy directory path"
        >
          <span>{dirPath}</span>
          <span>{copied ? '✓' : '📋'}</span>
        </button>
      </div>

      {displayFiles.length > 0 ? (
        <div className="space-y-2.5">
          {displayFiles.map((file) => {
            const meta = getFileMeta(file.extension);

            return (
              <div
                key={file.name}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/20 transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0">{meta.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {file.name}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${meta.color}`}>
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {file.size} · Updated {file.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={file.href}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs"
                  >
                    Download / Open
                  </a>
                  <a
                    href={file.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center">
          <p className="text-2xl mb-1.5">🗂️</p>
          <p className="text-xs font-semibold text-slate-700 mb-1">
            No custom notes uploaded to this topic yet
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Drop your lecture notes, formula sheets, or <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px]">.ipynb</code> files into <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-mono">{dirPath}</code> and they will automatically appear here for download.
          </p>
        </div>
      )}
    </div>
  );
}
