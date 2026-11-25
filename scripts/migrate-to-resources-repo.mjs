import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toc } from '../src/lib/toc.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceBase = path.join(rootDir, 'public', 'resources');
const targetRepo = path.resolve(rootDir, '..', 'resources');

if (!fs.existsSync(targetRepo)) {
  console.error(`Target resources repository not found at: ${targetRepo}`);
  process.exit(1);
}

console.log('🚀 Migrating resources from public/resources to mltheta/resources (part/chapter/sub)...');

let copiedFiles = 0;
let topicCount = 0;
const indexList = [];

for (const part of toc) {
  indexList.push(`\n### ${part.icon || '📚'} Part ${part.number}: ${part.title}\n`);

  for (const chapter of part.chapters) {
    indexList.push(`\n#### ${chapter.title}\n`);
    indexList.push('| Topic | Folder Link | Available Files |');
    indexList.push('| :--- | :--- | :--- |');

    for (const sub of chapter.subchapters) {
      topicCount++;
      const srcDir = path.join(sourceBase, sub.slug);
      const destDir = path.join(targetRepo, part.slug, chapter.slug, sub.slug);

      fs.mkdirSync(destDir, { recursive: true });

      const filesInTopic = [];

      if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          if (file.startsWith('.')) continue;
          const srcFile = path.join(srcDir, file);
          const destFile = path.join(destDir, file);

          if (fs.statSync(srcFile).isFile()) {
            fs.copyFileSync(srcFile, destFile);
            copiedFiles++;
            filesInTopic.push(`\`${file}\``);
          }
        }
      }

      const folderRel = `${part.slug}/${chapter.slug}/${sub.slug}`;
      const fileBadge = filesInTopic.length > 0 ? filesInTopic.join(', ') : '_Template_';
      indexList.push(`| **${sub.title}** | [\`${folderRel}\`](./${folderRel}) | ${fileBadge} |`);
    }
  }
}

// 2. Generate .gitignore in resources repo
const gitignoreContent = `# LaTeX Auxiliary files
*.aux
*.bbl
*.bcf
*.blg
*.fdb_latexmk
*.fls
*.lof
*.log
*.lot
*.out
*.run.xml
*.synctex.gz
*.toc

# OS & Editor
.DS_Store
Thumbs.db
.vscode/
.idea/
`;

fs.writeFileSync(path.join(targetRepo, '.gitignore'), gitignoreContent, 'utf8');

// 3. Generate README.md
const readmeContent = `# ML204 Academic & Study Resources 📚

Welcome to the official study notes and resources repository for **ML204** — an interactive, mathematically rigorous machine learning curriculum.

This repository holds LaTeX derivations, compiled PDFs, lecture summaries, problem sets, and notebooks organized systematically by **Part / Chapter / Subchapter**.

🌐 **Interactive Web App**: [mlens-theta.vercel.app](https://mlens-theta.vercel.app)  
📱 **Android Offline Suite**: [Latest Release v1.0.2](https://github.com/mltheta/mltheta/releases)  
🏛️ **GitHub Organization**: [github.com/ML204](https://github.com/ML204)  

---

## 📂 Repository Structure

All resources follow the 3-tier hierarchy mirroring the core curriculum:
\`\`\`text
<part-slug>/
  └── <chapter-slug>/
        └── <topic-slug>/
              ├── <Topic_Notes>.tex
              ├── <Topic_Notes>.pdf
              ├── <Topic_Summary>.md
              └── README.md
\`\`\`

---

## 📑 Curriculum & Resource Index
${indexList.join('\n')}

---

## ✍️ How to Contribute Notes

We welcome contributions of mathematical derivations, concise summary sheets, Python code walk-throughs, and LaTeX notes.

1. **LaTeX Guidelines**:
   - Use standard AMS-LaTeX packages (\`amsmath\`, \`amsfonts\`, \`amssymb\`, \`mathtools\`).
   - Keep vector notation consistent: bold lowercase for vectors ($\\\\mathbf{w}$), bold uppercase for matrices ($\\\\mathbf{X}$).
   - Keep the corresponding compiled \`.pdf\` alongside the \`.tex\` source.
2. **Pull Requests**:
   - Locate the target \`<part>/<chapter>/<topic>/\` folder.
   - Add or update the notes.
   - Submit a Pull Request.

---

## 📜 License
Content in this repository is licensed under [Creative Commons Attribution 4.0 International (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/) and accompanying code under the [MIT License](https://opensource.org/licenses/MIT).
`;

fs.writeFileSync(path.join(targetRepo, 'README.md'), readmeContent, 'utf8');

console.log(`\n✅ Migration Complete!`);
console.log(`• Total subchapters mapped: ${topicCount}`);
console.log(`• Files copied: ${copiedFiles}`);
console.log(`• Created .gitignore and comprehensive README.md in ${targetRepo}\n`);
