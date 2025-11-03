import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Auto-discover all HTML files for multi-page build
function getHtmlEntries() {
  const entries = {};
  const excludeDirs = ['node_modules', 'dist', '.git', 'shared'];
  
  function scanDir(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      // Skip excluded directories
      if (excludeDirs.includes(file)) return;
      
      const path = `${dir}/${file}`;
      const key = prefix ? `${prefix}/${file}` : file;
      
      if (fs.statSync(path).isDirectory()) {
        scanDir(path, key);
      } else if (file === 'index.html') {
        const entryName = prefix || 'main';
        entries[entryName] = resolve(__dirname, path);
      }
    });
  }
  
  scanDir('.');
  console.log('Found entries:', entries);
  return entries;
}

export default defineConfig({
  base: '/',  // Root of the repository
  build: {
    rollupOptions: {
      input: getHtmlEntries()
    },
    outDir: 'dist'
  },
  server: {
    open: true,
    port: 3000
  }
});