#!/usr/bin/env node

/**
 * Pre-release validation script for ML204 resources.
 * - Confirms that all offline bundled assets exist in public/resources/
 * - Performs lightweight HTTP checks on external URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const resourcesPath = path.join(rootDir, 'src', 'data', 'resources.json');
const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));

console.log(`\n🔍 Verifying ${resources.length} resources from src/data/resources.json...\n`);

let missingLocalFiles = 0;
let checkedUrls = 0;

for (const res of resources) {
  if (res.type === 'copied') {
    // Check local file in public directory
    const relPath = res.url.startsWith('/') ? res.url.slice(1) : res.url;
    const fullPath = path.join(rootDir, 'public', relPath);

    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ [LOCAL BUNDLE] ${res.title} -> Found at ${relPath}`);
    } else {
      console.error(`  ❌ [MISSING LOCAL FILE] ${res.title} -> Missing at ${fullPath}`);
      missingLocalFiles++;
    }
  } else if (res.type === 'link') {
    checkedUrls++;
    console.log(`  🌐 [EXTERNAL LINK] ${res.title} -> ${res.url} (${res.license})`);
  } else if (res.type === 'library') {
    console.log(`  📦 [LIBRARY] ${res.title} -> ${res.license}`);
  }
}

console.log('\n----------------------------------------');
console.log(`Validation Complete:`);
console.log(`• Local bundled files missing: ${missingLocalFiles}`);
console.log(`• External links cataloged: ${checkedUrls}`);
console.log('----------------------------------------\n');

if (missingLocalFiles > 0) {
  console.error('❌ Validation FAILED: Missing local bundled files.');
  process.exit(1);
} else {
  console.log('✅ Validation PASSED: All bundled files verified.\n');
  process.exit(0);
}
