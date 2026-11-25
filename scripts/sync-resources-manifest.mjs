#!/usr/bin/env node

/**
 * Scans the local mltheta/resources repository (or clones it if needed)
 * and updates src/data/resourcesManifest.json automatically.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const resourcesRepo = path.resolve(rootDir, '..', 'resources');
const manifestPath = path.join(rootDir, 'src', 'data', 'resourcesManifest.json');

if (!fs.existsSync(resourcesRepo)) {
  console.error(`❌ Resources repository not found at ${resourcesRepo}`);
  process.exit(1);
}

const manifest = {};

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDir(fullPath);
    }
  }

  const rel = path.relative(resourcesRepo, dir);
  const parts = rel.split(path.sep);

  if (parts.length === 3) {
    const [part, chapter, sub] = parts;
    const files = fs.readdirSync(dir).filter(
      (f) => !f.startsWith('.') && f.toLowerCase() !== 'readme.md'
    );

    if (files.length > 0) {
      const fileEntries = files.sort().map((fname) => {
        const stat = fs.statSync(path.join(dir, fname));
        const fsize = stat.size;
        let sizeStr = `${fsize} B`;
        if (fsize >= 1024 * 1024) sizeStr = `${(fsize / (1024 * 1024)).toFixed(1)} MB`;
        else if (fsize >= 1024) sizeStr = `${(fsize / 1024).toFixed(1)} KB`;

        const ext = path.extname(fname).toLowerCase().replace('.', '') || 'file';
        return {
          name: fname,
          size: sizeStr,
          extension: ext,
        };
      });

      manifest[sub] = {
        part,
        chapter,
        sub,
        files: fileEntries,
      };
    }
  }
}

scanDir(resourcesRepo);

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`✅ Synced resources manifest: ${Object.keys(manifest).length} topics cataloged.`);
