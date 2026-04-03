import { useTranslation } from 'react-i18next';

export default function AuthLanguageToggle() {
  const { i18n, t } = useTranslation();
  const lng = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const setLang = (next: 'en' | 'ar') => {
    void i18n.changeLanguage(next);
  };

  return (
    <div
      className="inline-flex rounded-full border border-gray-200/90 bg-white/90 p-1 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label={t('auth.language_toggle_aria', 'Language')}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
          lng === 'en'
            ? 'bg-[#003B5C] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#003B5C]'
        }`}
      >
        {t('auth.lang_en', 'EN')}
      </button>
      <button
        type="button"
        onClick={() => setLang('ar')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
          lng === 'ar'
            ? 'bg-[#003B5C] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#003B5C]'
        }`}
      >
        {t('auth.lang_ar', 'عربي')}
      </button>
    </div>
  );
}
