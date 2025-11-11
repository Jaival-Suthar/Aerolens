declare module "vite-plugin-obfuscator" {
  interface ObfuscatorOptions {
    compact?: boolean;
    controlFlowFlattening?: boolean;
    rotateStringArray?: boolean;
    [key: string]: any;
  }
  const obfuscator: (options?: ObfuscatorOptions) => any;
  export default obfuscator;
}
