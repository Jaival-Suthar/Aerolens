// vite.config.js
/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer'; // (Remediation #5 - Optional for Analysis)
import tsconfigPaths from 'vite-tsconfig-paths';
import javascriptObfuscator from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  build: {
  sourcemap: false,
  minify: "terser",
  manifest: true, // ✅ helps dynamic import mapping
  chunkSizeWarningLimit: 1500,
  rollupOptions: {
    output: {
      manualChunks: undefined, // ✅ avoid naming mismatch
      entryFileNames: "assets/[hash].js",
      chunkFileNames: "assets/[hash].js",
    },
  },
},
  plugins: [
    react(),
    tsconfigPaths(),
    javascriptObfuscator({
    apply: 'build',
    include: ["dist/assets/*.js"], // ✅ obfuscate built chunks only
    exclude: ["node_modules/**"],
    options: {
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.6,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    log: false,
    renameGlobals: false,
    splitStrings: true,
    stringArray: true,
    stringArrayThreshold: 0.75,
    stringArrayShuffle: true,
    rotateStringArray: true,
  },
}),

  ],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    strictPort: true, // ⬅️ FORCE 5173
    host: true,
  },
  // ... (Your existing 'test' configuration)
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    /* Avoid flaky v8 coverage shard merge (ENOENT on coverage-.tmp) on Windows CI. */
    maxWorkers: 1,
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
        "src/types/**",
        "**/types/**",
        /* Route shells + page-local UI: cover with integration/E2E; gate targets logic in services/hooks/shared. */
        "src/pages/**/page.tsx",
        "src/pages/**/components/**/*.tsx",
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