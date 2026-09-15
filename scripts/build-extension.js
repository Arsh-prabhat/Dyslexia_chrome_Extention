import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

async function buildExtension() {
  console.log('[DyslexiaReader] Starting Vite extension build...');

  // Step 1: Build Sidepanel & Background Service Worker
  await build({
    root,
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          'sidepanel/index': resolve(root, 'src/sidepanel/index.html'),
          background: resolve(root, 'src/background/service-worker.ts')
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return 'background/service-worker.js';
            }
            if (chunkInfo.name === 'sidepanel/index') {
              return 'sidepanel/sidepanel.js';
            }
            return 'assets/[name].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'sidepanel/[name].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          }
        }
      }
    }
  });

  // Step 2: Build Content Script as a single self-contained IIFE file (No import statements!)
  console.log('[DyslexiaReader] Building Content Script as standalone IIFE...');
  await build({
    root,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(root, 'src/content/content-script.ts'),
        output: {
          format: 'iife',
          name: 'DyslexiaContentScript',
          entryFileNames: 'content/content-script.js',
          inlineDynamicImports: true
        }
      }
    }
  });

  console.log('[DyslexiaReader] Extension build completed successfully.');
}

buildExtension().catch((err) => {
  console.error('[DyslexiaReader] Build failed:', err);
  process.exit(1);
});
