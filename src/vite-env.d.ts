/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_PREPROD_URL: string;
  readonly VITE_PREPROD_URL: string;
  // add other env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
