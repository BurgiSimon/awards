// Multi-page build: every recipe folder with an index.html becomes an entry.
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const input = {};
for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith('_') || dir.name === 'node_modules' || dir.name === 'dist') continue;
  const html = path.join(root, dir.name, 'index.html');
  if (fs.existsSync(html)) input[dir.name] = html;
}
input.index = path.join(root, 'index.html');

export default defineConfig({
  root,
  base: './',
  build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { input }, target: 'es2022' },
  server: { port: 5174, open: false },
});
