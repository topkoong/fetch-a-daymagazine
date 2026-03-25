/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional override for the a day magazine site origin (no trailing slash).
   * Defaults to https://adaymagazine.com
   */
  readonly VITE_ADAY_MAGAZINE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
