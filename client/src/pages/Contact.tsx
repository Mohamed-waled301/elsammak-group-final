import { useRef, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { getApiBaseUrl } from '../config/api';

function contactApiUrl() {
  const base = getApiBaseUrl();
  return base ? `${base.replace(/\/$/, '')}/api/contact` : '/api/contact';
}

const Contact = () => {
 const { t, i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSending, setIsSending] = useState(false);

  const mapsEmbedUrl = (import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL as string | undefined)?.trim();
  const mapsLink =
    (import.meta.env.VITE_GOOGLE_MAPS_LINK as string | undefined)?.trim() ||
    'https://maps.app.goo.gl/dMHPmAzdeXFaqiou8';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('FORM SUBMITTED');

    if (!formRef.current) {
      console.error('[contact] form ref missing');
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData(formRef.current);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();

      const body = { name, email, message };
      const url = contactApiUrl();
      console.log('[contact] fetch →', url, body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        mode: 'cors',
      });

      const rawText = await response.text();
      console.log('[contact] response status', response.status, 'ok=', response.ok, 'raw=', rawText);

      let data: {
        success?: boolean;
        message?: string;
        emailSent?: boolean;
        emailWarning?: string;
      } = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        console.error('[contact] JSON parse error', parseErr);
      }

      console.log('[contact] response JSON', data);

      if (response.ok && data.success) {
        if (data.emailSent === false && data.emailWarning) {
          toast.success(isRTL ? 'تم حفظ الرسالة بنجاح' : 'Message sent successfully', { duration: 5000 });
          toast(isRTL ? `البريد: ${data.emailWarning}` : `Email: ${data.emailWarning}`, { icon: '✉️' });
        } else {
          toast.success(isRTL ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
        }
        formRef.current.reset();
      } else {
        const errText =
          typeof data.message === 'string' && data.message
            ? data.message
            : isRTL
              ? `فشل الإرسال (${response.status})`
              : `Request failed (${response.status})`;
        console.error('[contact] error response', errText);
        toast.error(errText);
      }
    } catch (err) {
      console.error('[contact] fetch threw', err);
      const msg = isRTL ? 'تعذر الاتصال بالخادم. تأكد أن الخادم يعمل.' : 'Could not reach the server. Is the API running?';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

 return (
 <div className="bg-white min-h-screen transition-colors duration-300">
 <div className="bg-[var(--color-primary)] text-white py-20 px-4 text-center transition-colors duration-300">
 <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">{t('contact.title')}</h1>
 <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-sm">{t('contact.subtitle')}</p>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
 {/* Form */}
 <div className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm transition-colors">
 <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-8 transition-colors">{t('contact.send_msg')}</h2>
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 transition-colors">{t('contact.full_name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300 "
                placeholder="John Doe"
                required
              />
 </div>
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-colors">{t('contact.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300 "
                placeholder="john@company.com"
                required
              />
 </div>
 </div>
 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2 transition-colors">{t('contact.subject')}</label>
 <select id="subject" name="subject" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
 <option value="legal">{t('contact.subjects.s1')}</option>
 <option value="accounting">{t('contact.subjects.s2')}</option>
 <option value="data">{t('contact.subjects.s3')}</option>
 <option value="training">{t('contact.subjects.s4')}</option>
 <option value="general">{t('contact.subjects.s5')}</option>
 </select>
 </div>
 <div>
 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 transition-colors">{t('contact.message')}</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all resize-none shadow-sm hover:border-gray-300 "
              placeholder="..."
              required
            ></textarea>
 </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-4 text-lg shadow-lg hover:-translate-y-1 mt-4"
            disabled={isSending}
          >
            {isSending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : t('contact.send_btn')}
          </Button>
 </form>
 </div>

 {/* Info & Map */}
 <div className="flex flex-col justify-between">
 <div>
 <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-8 transition-colors">{t('contact.info_title')}</h2>
 <ul className="space-y-8 mb-12">
 <li className="flex items-start group">
 <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center mr-6 rtl:ml-6 rtl:mr-0 flex-shrink-0 mt-1 transition-colors group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-primary)]">
 <MapPin className="w-6 h-6" />
 </div>
 <div>
 <h4 className="text-lg font-bold text-gray-900 mb-1 transition-colors">{t('contact.office')}</h4>
 <p className="text-gray-600 whitespace-pre-line transition-colors leading-relaxed">{t('contact.office_addr')}</p>
 </div>
 </li>
 <li className="flex items-start group">
 <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center mr-6 rtl:ml-6 rtl:mr-0 flex-shrink-0 mt-1 transition-colors group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-primary)]">
 <Phone className="w-6 h-6" />
 </div>
 <div>
 <h4 className="text-lg font-bold text-gray-900 mb-1 transition-colors">{t('contact.phone')}</h4>
<a href={`tel:${t('contact.phone_value', '01276691302')}`} className="text-gray-600 transition-colors hover:text-[var(--color-primary)]">
  {t('contact.phone_value', '01276691302')}
</a>
 </div>
 </li>
 <li className="flex items-start group">
 <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center mr-6 rtl:ml-6 rtl:mr-0 flex-shrink-0 mt-1 transition-colors group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-primary)]">
 <Mail className="w-6 h-6" />
 </div>
 <div>
 <h4 className="text-lg font-bold text-gray-900 mb-1 transition-colors">{t('contact.email_label')}</h4>
<a href={`mailto:${t('contact.email_value', 'elsamakgroup0@gmail.com')}`} className="text-gray-600 transition-colors hover:text-[var(--color-primary)]">
  {t('contact.email_value', 'elsamakgroup0@gmail.com')}
</a>
 </div>
 </li>
 </ul>
 </div>

  <div className="mt-8 space-y-4">
    <h3 className="text-lg font-bold text-[var(--color-primary)]">{t('contact.map_section_title')}</h3>
    {mapsEmbedUrl ? (
      <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-md bg-gray-100 aspect-[16/10] min-h-[240px]">
        <iframe
          title={t('contact.map_placeholder')}
          src={mapsEmbedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    ) : null}
    <a
      href={mapsLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[var(--color-primary-light)] hover:shadow-lg"
    >
      <MapPin className="h-5 w-5 shrink-0 text-[var(--color-gold)]" aria-hidden />
      <span>{t('contact.open_maps')}</span>
    </a>
    <p className="text-sm text-gray-600 leading-relaxed">{t('contact.office_addr')}</p>
  </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default Contact;
