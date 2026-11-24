import { toc, getTopicLocation } from './toc';
import manifestData from '@/data/resourcesManifest.json';

export interface TopicFile {
  name: string;
  size: string;
  extension: string;
  href: string;
  githubUrl: string;
  updatedAt: string;
}

export interface TopicDirectory {
  slug: string;
  title: string;
  partNumber: number;
  partTitle: string;
  chapterTitle: string;
  chapterSlug: string;
  partSlug: string;
  files: TopicFile[];
}

interface ManifestFile {
  name: string;
  size: string;
  extension: string;
}

interface ManifestEntry {
  part: string;
  chapter: string;
  sub: string;
  files: ManifestFile[];
}

const manifest = manifestData as unknown as Record<string, ManifestEntry>;

export function getTopicFiles(topicSlug: string): TopicFile[] {
  const entry = manifest[topicSlug];
  if (!entry || !entry.files) return [];

  const loc = getTopicLocation(topicSlug);
  const part = loc?.partSlug || entry.part;
  const chapter = loc?.chapterSlug || entry.chapter;
  const sub = loc?.subSlug || topicSlug;
  const relPath = `${part}/${chapter}/${sub}`;

  return entry.files.map((file) => {
    const encFile = encodeURIComponent(file.name);
    const rawUrl = `https://raw.githubusercontent.com/ML204/resources/main/${relPath}/${encFile}`;
    const treeUrl = `https://github.com/ML204/resources/blob/main/${relPath}/${encFile}`;

    return {
      name: file.name,
      size: file.size,
      extension: file.extension,
      href: rawUrl,
      githubUrl: treeUrl,
      updatedAt: 'Latest',
    };
  });
}

export function getAllTopicsWithFiles(): TopicDirectory[] {
  const result: TopicDirectory[] = [];

  for (const part of toc) {
    for (const chapter of part.chapters) {
      for (const sub of chapter.subchapters) {
        const files = getTopicFiles(sub.slug);
        result.push({
          slug: sub.slug,
          title: sub.title,
          partNumber: part.number,
          partTitle: part.title,
          chapterTitle: chapter.title,
          chapterSlug: chapter.slug,
          partSlug: part.slug,
          files,
        });
      }
    }
  }

  return result;
}
