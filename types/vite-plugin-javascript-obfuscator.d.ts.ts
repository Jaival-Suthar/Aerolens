// types/vite-plugin-javascript-obfuscator.d.ts
declare module "vite-plugin-javascript-obfuscator" {
  import type { Plugin } from "vite";

  export interface JavascriptObfuscatorOptions {
    // plugin-level include/exclude (globs)
    include?: string | string[];
    exclude?: string | string[];

    // wrapper for real obfuscator options
    options?: {
      compact?: boolean;
      controlFlowFlattening?: boolean;
      controlFlowFlatteningThreshold?: number;
      numbersToExpressions?: boolean;
      simplify?: boolean;
      stringArrayShuffle?: boolean;
      rotateStringArray?: boolean;
      stringArrayThreshold?: number;
      splitStrings?: boolean;
      splitStringsChunkLength?: number;
      renameGlobals?: boolean;
      // allow extra options without strict typing
      [key: string]: any;
    };
  }

  const javascriptObfuscator: (opts?: JavascriptObfuscatorOptions) => Plugin;
  export default javascriptObfuscator;
}
