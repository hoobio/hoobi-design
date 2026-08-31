import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const libVersion = (JSON.parse(readFileSync('../package.json', 'utf8')) as { version: string })
  .version;

// One self-contained index.html: singlefile inlines JS + CSS, the raised inline
// limit turns the four woff2 files into data: URIs so nothing is fetched.
export default defineConfig({
  define: { __LIB_VERSION__: JSON.stringify(libVersion) },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  // @hoobi/design is a file: symlink to the repo root, which has its own react
  // devDependency. Without dedupe the page loads two Reacts and every hook is null.
  resolve: { dedupe: ['react', 'react-dom'] },
  build: {
    assetsInlineLimit: 1024 * 1024,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 4096,
  },
});
