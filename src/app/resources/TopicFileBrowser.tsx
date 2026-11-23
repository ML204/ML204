'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TopicDirectory, TopicFile } from '@/lib/topicFiles';
import { downloadStudyResource } from '@/lib/resourceDownload';
import { openExternalUrl } from '@/lib/externalLinks';
import { OfflineModal } from '@/components/common/OfflineModal';

interface TopicFileBrowserProps {
  topics: TopicDirectory[];
}

function getFileBadge(name: string, ext: string) {
  if (name.toLowerCase() === 'readme.md') {
    return { icon: '📖', badge: 'README', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }
  switch (ext) {
    case 'pdf':
      return { icon: '📕', badge: 'PDF', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'ipynb':
      return { icon: '🪐', badge: 'Jupyter', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'py':
      return { icon: '🐍', badge: 'Python', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'tex':
      return { icon: '📐', badge: 'LaTeX', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'md':
      return { icon: '📝', badge: 'Markdown', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    default:
      return { icon: '📄', badge: ext.toUpperCase(), color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function TopicFileBrowser({ topics }: TopicFileBrowserProps) {
  const [search, setSearch] = useState('');
  const [filterCustomOnly, setFilterCustomOnly] = useState(false);
  const [selectedPart, setSelectedPart] = useState<number | 'all'>('all');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    new Set(['vectors-and-matrices', 'gradient-descent'])
  );
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [activeFileName, setActiveFileName] = useState('');

  async function handleDownload(file: TopicFile, topicSlug: string) {
    setActiveFileName(file.name);
    await downloadStudyResource(
      {
        name: file.name,
        href: file.href,
        githubUrl: file.githubUrl,
      },
      topicSlug,
      () => setOfflineModalOpen(true)
    );
  }

  const q = search.trim().toLowerCase();

  // Group topics by Part -> Chapter
  const partMap = new Map<number, {
    partNumber: number;
    partTitle: string;
    partSlug: string;
    chapters: Map<string, {
      chapterTitle: string;
      chapterSlug: string;
      topics: TopicDirectory[];
    }>;
  }>();

  for (const topic of topics) {
    if (selectedPart !== 'all' && topic.partNumber !== selectedPart) continue;

    // Filter logic
    const hasCustom = topic.files.some((f) => f.name.toLowerCase() !== 'readme.md');
    if (filterCustomOnly && !hasCustom) continue;

    if (q) {
      const matchTopic = topic.title.toLowerCase().includes(q) || topic.slug.includes(q) || topic.chapterTitle.toLowerCase().includes(q) || topic.partTitle.toLowerCase().includes(q);
      const matchFile = topic.files.some((f) => f.name.toLowerCase().includes(q));
      if (!matchTopic && !matchFile) continue;
    }

    if (!partMap.has(topic.partNumber)) {
      partMap.set(topic.partNumber, {
        partNumber: topic.partNumber,
        partTitle: topic.partTitle,
        partSlug: topic.partSlug,
        chapters: new Map(),
      });
    }

    const p = partMap.get(topic.partNumber)!;
    if (!p.chapters.has(topic.chapterSlug)) {
      p.chapters.set(topic.chapterSlug, {
        chapterTitle: topic.chapterTitle,
        chapterSlug: topic.chapterSlug,
        topics: [],
      });
    }

    p.chapters.get(topic.chapterSlug)!.topics.push(topic);
  }

  const partsArray = Array.from(partMap.values());
  const totalMatchedTopics = partsArray.reduce(
    (acc, p) => acc + Array.from(p.chapters.values()).reduce((cAcc, c) => cAcc + c.topics.length, 0),
    0
  );

  function toggleExpand(slug: string) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function expandAll() {
    const allSlugs = new Set<string>();
    for (const p of partsArray) {
      for (const c of Array.from(p.chapters.values())) {
        for (const t of c.topics) {
          allSlugs.add(t.slug);
        }
      }
    }
    setExpandedTopics(allSlugs);
  }

  function collapseAll() {
    setExpandedTopics(new Set());
  }

  return (
    <div>
      {/* Controls Bar */}
      <div className="bg-[#fcfaf2]/95 rounded-2xl border border-[#ded5bd] p-5 mb-6 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all chapters, topics, or file names..."
            className="w-full text-sm pl-9 pr-8 py-2.5 rounded-xl border border-[#ded5bd] bg-[#f4eed9]/40 text-stone-800
                       focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                       placeholder:text-stone-400 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Part Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedPart('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              selectedPart === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Parts
          </button>
          {[1, 2, 3, 4, 5, 6].map((pNum) => (
            <button
              key={pNum}
              onClick={() => setSelectedPart(pNum)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                selectedPart === pNum
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Part {pNum}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 pl-3 border-l border-slate-200 flex-shrink-0">
            <button
              onClick={() => setFilterCustomOnly(!filterCustomOnly)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap border ${
                filterCustomOnly
                  ? 'bg-brand-50 text-brand-700 border-brand-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filterCustomOnly ? '✓ Only Uploaded Notes' : 'Show All Files'}
            </button>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{totalMatchedTopics}</strong> topics organized by chapter
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              Expand all
            </button>
            <span>·</span>
            <button
              onClick={collapseAll}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {/* Chapter-wise Hierarchical Tree */}
      <div className="space-y-8">
        {partsArray.map((part) => (
          <div key={part.partNumber} className="space-y-4">
            {/* Part Title Banner */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                Part {part.partNumber}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {part.partTitle}
              </h2>
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              {Array.from(part.chapters.values()).map((chapter) => (
                <div
                  key={chapter.chapterSlug}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Chapter Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">📖</span>
                      <h3 className="text-sm font-bold text-slate-800">
                        Chapter: {chapter.chapterTitle}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        ({chapter.topics.length} {chapter.topics.length === 1 ? 'topic' : 'topics'})
                      </span>
                    </div>

                    <Link
                      href={`/learn/${part.partSlug}/${chapter.chapterSlug}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                    >
                      View Chapter Page →
                    </Link>
                  </div>

                  {/* Topics in this Chapter */}
                  <div className="divide-y divide-slate-100">
                    {chapter.topics.map((topic) => {
                      const isExpanded = expandedTopics.has(topic.slug);
                      const hasCustomNotes = topic.files.some((f) => f.name.toLowerCase() !== 'readme.md');

                      return (
                        <div key={topic.slug} className="transition-colors">
                          {/* Topic Bar */}
                          <div
                            onClick={() => toggleExpand(topic.slug)}
                            className="flex items-center justify-between p-3.5 px-5 cursor-pointer hover:bg-slate-50/60 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-base flex-shrink-0">
                                {hasCustomNotes ? '📂' : '📁'}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-slate-800 truncate">
                                    {topic.title}
                                  </p>
                                  {hasCustomNotes && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                                      Notes ready
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  public/resources/{topic.slug}/
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px]">
                                {topic.files.length} {topic.files.length === 1 ? 'file' : 'files'}
                              </span>
                              <span className="text-slate-400 text-xs font-bold w-4 text-center">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Files */}
                          {isExpanded && (
                            <div className="px-5 pb-3.5 pt-1 bg-slate-50/40 space-y-1.5 border-t border-slate-50">
                              <div className="flex items-center justify-between pb-1 text-xs">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                                  Study Materials & Notes
                                </span>
                                <Link
                                  href={`/learn/${part.partSlug}/${chapter.chapterSlug}/${topic.slug}`}
                                  className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                                >
                                  <span>Go to lesson</span>
                                  <span>→</span>
                                </Link>
                              </div>

                              {topic.files.length > 0 ? (
                                <div className="space-y-1.5">
                                  {topic.files.map((file) => {
                                    const meta = getFileBadge(file.name, file.extension);
                                    return (
                                      <div
                                        key={file.name}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-300 transition-all gap-3"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span className="text-base flex-shrink-0">{meta.icon}</span>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-slate-800 truncate">
                                                {file.name}
                                              </span>
                                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium border ${meta.color}`}>
                                                {meta.badge}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              {file.size}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                                          <button
                                            onClick={() => handleDownload(file, topic.slug)}
                                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            <span>⬇</span>
                                            <span>Download</span>
                                          </button>
                                          <button
                                            onClick={() => openExternalUrl(file.githubUrl)}
                                            className="inline-flex items-center justify-center px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-center cursor-pointer"
                                          >
                                            GitHub ↗
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic py-2 text-center">
                                  Study notes and resources coming soon for this topic.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <OfflineModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        fileName={activeFileName}
      />
    </div>
  );
}
