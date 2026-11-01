import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const libVersion = (JSON.parse(readFileSync('../react/package.json', 'utf8')) as { version: string })
  .version;

// One self-contained index.html: singlefile inlines JS + CSS, the raised inline
// limit turns the four woff2 files into data: URIs so nothing is fetched.
export default defineConfig({
  define: { __LIB_VERSION__: JSON.stringify(libVersion) },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  // @hoobi/design is a workspace symlink to ../react, which has its own react
  // devDependency. Without dedupe the page loads two Reacts and every hook is null.
  resolve: { dedupe: ['react', 'react-dom'] },
  // @hoobi/design resolves to ../react, so its fonts/ sits outside the dev server's root and
  // Vite does not serve it - Noto Sans and Dank Mono both silently fall back to a system
  // face. The build inlines the woff2 as data: URIs, so this only ever affects the dev server.
  server: { fs: { allow: ['..'] } },
  build: {
    assetsInlineLimit: 1024 * 1024,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 4096,
  },
});
