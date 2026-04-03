import { useEffect, useMemo, useState } from 'react';
import { Target, Compass, Award, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '../config/api';

/** Build URL for files in Vite `public/` (required when `base` is `./` in vite.config). */
function publicAssetUrl(pathFromPublic: string): string {
  const trimmed = pathFromPublic.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  if (!base || base === '/') return `/${trimmed}`;
  return base.endsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function normalizeMediaSrc(raw: string): string {
  const u = raw.trim();
  if (!u) return u;
  if (isHttpUrl(u)) return u;
  return publicAssetUrl(u.replace(/^\/+/, ''));
}

function mimeForPath(p: string): string {
  const lower = p.toLowerCase();
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
}

function mediaErrorName(code: number | undefined): string {
  switch (code) {
    case 1:
      return 'MEDIA_ERR_ABORTED';
    case 2:
      return 'MEDIA_ERR_NETWORK';
    case 3:
      return 'MEDIA_ERR_DECODE';
    case 4:
      return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
    default:
      return 'UNKNOWN';
  }
}

function AboutPageVideo() {
  const { t } = useTranslation();
  const [apiPath, setApiPath] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_ABOUT_VIDEO_URL?.trim()) return;
    let cancelled = false;
    (async () => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/api/media/first-video`);
        const data = (await res.json()) as { url?: string | null };
        const u = typeof data.url === 'string' && data.url.trim() ? data.url.trim() : null;
        if (!cancelled && u) setApiPath(u);
      } catch {
        /* server optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sources = useMemo(() => {
    const out: { src: string; type: string }[] = [];
    const add = (raw: string) => {
      if (!raw?.trim()) return;
      const src = normalizeMediaSrc(raw);
      if (out.some((x) => x.src === src)) return;
      out.push({ src, type: mimeForPath(raw) });
    };

    const env = import.meta.env.VITE_ABOUT_VIDEO_URL?.trim();
    if (env) add(env);

    if (apiPath) add(apiPath);

    add(publicAssetUrl('assets/videos/company-promo.mp4'));
    add(publicAssetUrl('videos/company-promo.mp4'));

    return out;
  }, [apiPath]);

  useEffect(() => {
    setLoadError(false);
  }, [sources]);

  const autoplayOn = import.meta.env.VITE_ABOUT_VIDEO_AUTOPLAY === '1';

  const sourceKey = sources.map((s) => s.src).join('|');

  return (
    <div className="w-full lg:sticky lg:top-24">
      <p className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">
        {t('about.video_kicker')}
      </p>
      <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-5">
        {t('about.video_section_title')}
      </h3>
      <div className="rounded-2xl overflow-hidden shadow-[0_24px_48px_-12px_rgba(15,44,74,0.2)] border border-gray-200/90 bg-black ring-1 ring-black/[0.06]">
        {loadError ? (
          <div className="aspect-video w-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-primary)]/90 to-[#0a4d6e] px-6 py-10 text-center">
            <p className="text-sm font-medium text-white/95 max-w-md">{t('about.video_fallback')}</p>
            <p className="text-xs text-white/70 max-w-lg break-all">{t('about.video_placeholder')}</p>
          </div>
        ) : (
          <video
            key={sourceKey}
            className="w-full aspect-video max-h-[min(70vh,720px)] object-contain bg-black"
            controls
            playsInline
            preload="metadata"
            muted={autoplayOn}
            autoPlay={autoplayOn}
            aria-label={t('about.video_section_title')}
            onError={(e) => {
              const v = e.currentTarget;
              const err = v.error;
              console.error('[About video] Failed to load or decode', {
                currentSrc: v.currentSrc,
                networkState: v.networkState,
                readyState: v.readyState,
                errorCode: err?.code,
                errorName: mediaErrorName(err?.code),
                sources: sources.map((s) => s.src),
              });
              setLoadError(true);
            }}
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
            {t('about.video_unsupported')}
          </video>
        )}
      </div>
    </div>
  );
}

const About = () => {
  const { t } = useTranslation();

  const values = [
    { title: t('about.val_1_title'), desc: t('about.val_1_desc'), icon: <Target className="w-6 h-6" /> },
    { title: t('about.val_2_title'), desc: t('about.val_2_desc'), icon: <Award className="w-6 h-6" /> },
    { title: t('about.val_3_title'), desc: t('about.val_3_desc'), icon: <Compass className="w-6 h-6" /> },
    { title: t('about.val_4_title'), desc: t('about.val_4_desc'), icon: <Shield className="w-6 h-6" /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen transition-colors duration-300">
      <div className="bg-[var(--color-primary)] text-white py-20 px-4 text-center transition-colors duration-300">
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">{t('about.title')}</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-sm">{t('about.subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="group">
            <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2 transform transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              {t('about.profile_label')}
            </h2>
            <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-6 transition-colors">
              {t('about.who_we_are')}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed transition-colors">{t('about.desc_1')}</p>
            <p className="text-gray-600 leading-relaxed max-w-lg mb-8 transition-colors">{t('about.desc_2')}</p>

            <div className="space-y-8 mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-colors">
              <div className="flex group/item hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center transition-colors">
                    <Compass className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <h4 className="text-xl font-bold text-[var(--color-primary)] mb-2 transition-colors">
                    {t('about.vision_title')}
                  </h4>
                  <p className="text-gray-600 transition-colors">{t('about.vision_desc')}</p>
                </div>
              </div>
              <div className="flex group/item hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center transition-colors">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4">
                  <h4 className="text-xl font-bold text-[var(--color-primary)] mb-2 transition-colors">
                    {t('about.mission_title')}
                  </h4>
                  <p className="text-gray-600 transition-colors">{t('about.mission_desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <AboutPageVideo />
        </div>

        <div className="mt-24 lg:mt-32">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">
              {t('about.philosophy_label')}
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] transition-colors">
              {t('about.core_values')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-[var(--color-gold)] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-default"
              >
                <div className="w-12 h-12 bg-gray-50 text-[var(--color-primary)] rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-gold)] transition-colors">
                  {val.icon}
                </div>
                <h4 className="text-lg font-bold text-[var(--color-primary)] mb-3 group-hover:text-[var(--color-gold)] transition-colors">
                  {val.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed transition-colors">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
