import { useRef, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import emailjs from '@emailjs/browser';

const Contact = () => {
 const { t, i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSending, setIsSending] = useState(false);

  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  const isEmailJsConfigured =
    Boolean(SERVICE_ID) && Boolean(TEMPLATE_ID) && Boolean(PUBLIC_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    if (!isEmailJsConfigured) {
      alert('خدمة البريد غير مهيأة حالياً. يرجى المحاولة لاحقاً.');
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData(formRef.current);
      const name = String(formData.get('name') || 'User').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();
      const finalMessage = message || 'Test message';
      const user = { name, email };

      if (!email || !message) {
        alert('تعذر إرسال الرسالة حالياً. يرجى إدخال البيانات المطلوبة.');
        return;
      }

      // eslint-disable-next-line no-console
      console.log('Sending Email:', {
        service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        email,
        message: finalMessage,
      });

      await emailjs
        .send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            name: user.name || 'User',
            email: user.email,
            message: finalMessage,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        )
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('SUCCESS: Email sent');
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('ERROR sending email:', error);
          throw error;
        });
      alert('تم إرسال رسالتك بنجاح.');
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('تعذر إرسال الرسالة. يرجى المحاولة لاحقاً.');
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
 <select id="subject" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none transition-all shadow-sm hover:border-gray-300 cursor-pointer">
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
 
  {/* Google Maps static image (clickable) */}
  {(() => {
    const address = 'مسجد الحصري';
    const mapsLink = 'https://maps.app.goo.gl/dMHPmAzdeXFaqiou8';
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
    const staticSrc =
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${encodeURIComponent(address)}` +
      `&zoom=14&size=900x420&scale=2&maptype=roadmap` +
      `&markers=color:0xc5a059%7Clabel:E%7C${encodeURIComponent(address)}` +
      (apiKey ? `&key=${encodeURIComponent(apiKey)}` : '');

    return (
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="rounded-3xl overflow-hidden border border-gray-100 h-64 bg-gray-200 relative group block"
        aria-label="Open Google Maps"
      >
        <img
          src={staticSrc}
          alt="Google Map"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-end w-full h-full text-white font-bold p-6 gap-2">
          <div className="text-base">{t('contact.map_placeholder')}</div>
          <div className="text-sm font-semibold underline">
            {t('contact.open_maps', 'Open in Google Maps')}
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center justify-center rounded-lg bg-white/15 border border-white/20 px-4 py-2 text-sm font-bold">
              {t('contact.open_map_btn', 'افتح الموقع على الخريطة')}
            </span>
          </div>
        </div>
      </a>
    );
  })()}
 </div>
 </div>
 </div>
 </div>
 );
};

export default Contact;
