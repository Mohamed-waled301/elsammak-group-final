/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional; when unset, Vite dev server proxies `/api` to port 5000 */
  readonly VITE_API_URL?: string;
  readonly VITE_ABOUT_VIDEO_URL?: string;
  readonly VITE_ABOUT_VIDEO_POSTER?: string;
  /** Set to "1" for muted autoplay on the About page video */
  readonly VITE_ABOUT_VIDEO_AUTOPLAY?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_MESSENGER_PAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
