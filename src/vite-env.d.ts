/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  /** Optional. If WhatsApp routes are not under the same origin as VITE_BASE_URL, set this to that API origin (no trailing slash). */
  readonly VITE_WHATSAPP_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
