// getcode.js (ES module-safe)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules: create __filename and __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Hard-coded source directory (change as needed):
const srcDir = path.join(__dirname, 'src');

// 2. Output file:
const outFile = path.join(__dirname, 'all_codes.txt');

// Initialize/clear all_codes.txt
try {
  fs.writeFileSync(outFile, '', 'utf8');
} catch (err) {
  console.error('Failed to initialize output file:', err);
  process.exit(1);
}

/**
 * Recursively walk `dir`, find all .js files and
 * append their path + content + 20 blank lines to temp.txt
 */
function processDir(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      // Skip common build/static folders
      if (['node_modules', 'public', '.next'].includes(dirent.name)) continue;
      processDir(fullPath);
    } else if (dirent.isFile() && dirent.name.endsWith('.js')) {
      // compute a POSIX-style relative path for the header
      let rel = path.relative(__dirname, fullPath).replace(/\\/g, '/');
      if (!rel.startsWith('/')) rel = '/' + rel;

      // 2.a Write the location header
      fs.appendFileSync(outFile, `File: ${rel}\n\n`, 'utf8');

      // 2.b Write the file’s contents
      const code = fs.readFileSync(fullPath, 'utf8');
      fs.appendFileSync(outFile, code.trimEnd() + '\n\n', 'utf8');

      // 3. Add 20 blank lines
      fs.appendFileSync(outFile, '\n'.repeat(20), 'utf8');
    }
  }
}

// kick it off
try {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory not found: "${srcDir}"`);
    process.exit(1);
  }
  processDir(srcDir);
  console.log(`✅ All .js files under "${srcDir}" combined into ${outFile}`);
} catch (err) {
  console.error('Error while processing directory:', err);
  process.exit(1);
}
