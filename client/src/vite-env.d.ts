/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional; when unset, client uses `DEFAULT_API_BASE_URL` in `src/config/api.ts` */
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
