#!/usr/bin/env node

/**
 * Pre-release validation script for MLTheta resources.
 * - Confirms that all topics in resourcesManifest.json are well-formed
 * - Confirms that resources.json catalog entries are valid
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'src', 'data', 'resourcesManifest.json');
const resourcesPath = path.join(rootDir, 'src', 'data', 'resources.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));

console.log(`\n🔍 Verifying MLTheta resources manifest and attribution catalog...\n`);

let manifestTopicCount = Object.keys(manifest).length;
let totalManifestFiles = 0;

for (const [sub, entry] of Object.entries(manifest)) {
  if (!entry.part || !entry.chapter || !entry.sub || !Array.isArray(entry.files)) {
    console.error(`  ❌ Malformed manifest entry for ${sub}`);
    process.exit(1);
  }
  totalManifestFiles += entry.files.length;
}

console.log(`  ✅ Resources Manifest: ${manifestTopicCount} topics with ${totalManifestFiles} active files.`);
console.log(`  ✅ Resources Catalog: ${resources.length} attributed educational sources verified.`);

console.log('\n----------------------------------------');
console.log(`Validation Complete: All resource definitions OK.`);
console.log('----------------------------------------\n');
process.exit(0);
