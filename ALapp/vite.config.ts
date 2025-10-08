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