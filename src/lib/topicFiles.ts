import fs from 'fs';
import path from 'path';
import { toc, getTopicLocation } from './toc';

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

export function getTopicFiles(topicSlug: string): TopicFile[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'resources', topicSlug);
    if (!fs.existsSync(dir)) return [];
    const filenames = fs.readdirSync(dir);

    return filenames
      .filter((f) => !f.startsWith('.') && f.toLowerCase() !== 'readme.md')
      .map((filename) => {
        const fullPath = path.join(dir, filename);
        const stat = fs.statSync(fullPath);
        const ext = path.extname(filename).toLowerCase().replace('.', '');

        // Format size
        const bytes = stat.size;
        let size = `${bytes} B`;
        if (bytes >= 1024 * 1024) size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        else if (bytes >= 1024) size = `${(bytes / 1024).toFixed(1)} KB`;

        const loc = getTopicLocation(topicSlug);
        const relPath = loc ? `${loc.partSlug}/${loc.chapterSlug}/${topicSlug}` : topicSlug;

        return {
          name: filename,
          size,
          extension: ext || 'file',
          href: `/resources/${topicSlug}/${encodeURIComponent(filename)}`,
          githubUrl: `https://github.com/ML204/resources/tree/main/${relPath}/${encodeURIComponent(filename)}`,
          updatedAt: stat.mtime.toLocaleDateString(),
        };
      });
  } catch (err) {
    console.error(`Error reading topic files for ${topicSlug}:`, err);
    return [];
  }
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
