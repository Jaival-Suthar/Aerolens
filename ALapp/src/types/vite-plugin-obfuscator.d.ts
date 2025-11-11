declare module "vite-plugin-obfuscator" {
  interface ObfuscatorOptions {
    compact?: boolean;
    controlFlowFlattening?: boolean;
    rotateStringArray?: boolean;
    [key: string]: any;
  }

  export default function obfuscator(options?: ObfuscatorOptions): any;
}
