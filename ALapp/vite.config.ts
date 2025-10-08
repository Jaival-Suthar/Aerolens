// vite.config.js
/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // (Remediation #5 - Optional for Analysis)

export default defineConfig({
  plugins: [
    react(),
    // Remediation #5: Uncomment to analyze the bundle *after* running 'npm run build'
    visualizer({
      filename: './dist/bundle-stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  
  // 🎯 ACTIONABLE REMEDIATION: MANUAL CHUNKING (Rollup/Vite level)
  build: {
    // Ensures small files are not inlined as base64, preserving them for chunking
    assetsInlineLimit: 0, 
    rollupOptions: {
      output: {
        // Implementation of Remediation #2: Custom chunk logic
        manualChunks(id) {
          // 1. Isolate PrimeReact and PrimeFlex into a single vendor chunk
          if (id.includes('primereact') || id.includes('primeflex') || id.includes('primeicons')) {
            return 'vendor-prime';
          }
          
          // 2. Isolate all other large node_modules dependencies
          if (id.includes('node_modules')) {
            // This groups libraries by their package name (e.g., react, react-dom, react-router-dom)
            // It breaks up the massive 'vendor' chunk into smaller, separate chunks.
            const parts = id.toString().split('node_modules/');
            if (parts.length > 1) {
                // Get the package name (e.g., 'react' from 'node_modules/react/index.js')
                return 'vendor_' + parts[1].split('/')[0].toString();
            }
          }
          
          // 3. (Optional) Custom chunking for YOUR large components/pages, if not using React.lazy (Remediation #1)
          // if (id.includes('/src/pages/ContactAddEdit/')) {
          //   return 'chunk-contact-edit';
          // }
        },
      },
    },
  },
  
  // ... (Your existing 'test' configuration)
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/index.{ts,tsx}",
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});