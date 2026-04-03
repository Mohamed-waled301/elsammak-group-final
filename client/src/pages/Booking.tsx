import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import LocationSelect from '../components/LocationSelect';
import { submitBooking } from '../api/booking';
import { Loader2 } from 'lucide-react';
import { getAvailability } from '../api/availability';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const Booking = () => {
 const { t, i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';
 const [submitted, setSubmitted] = useState(false);
 const [error, setError] = useState('');

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 serviceType: '',
 bookingDate: '',
 notes: '',
 governorate: '',
 city: ''
 });
 const [loading, setLoading] = useState(false);
 const [month, setMonth] = useState(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 });
 const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
 const [dateError, setDateError] = useState('');

 useEffect(() => {
  const run = async () => {
    if (!formData.serviceType) return;
    try {
      const res = await getAvailability({ serviceType: formData.serviceType, month });
      setUnavailable(new Set(res?.unavailableDates || []));
    } catch {
      setUnavailable(new Set());
    }
  };
  run();
 }, [formData.serviceType, month]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };



 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 setDateError('');
 if (formData.bookingDate && unavailable.has(formData.bookingDate)) {
  setDateError(t('common.day_unavailable', 'هذا اليوم غير متاح'));
  setLoading(false);
  return;
 }
 try {
 await submitBooking(formData);
 setSubmitted(true);
 setFormData({ name: '', email: '', phone: '', serviceType: '', bookingDate: '', notes: '', governorate: '', city: '' });
 } catch (error) {
 console.error(error);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const msg = (error as any)?.response?.data?.message || (error as any)?.message || 'Request failed';
 setError(typeof msg === 'string' ? msg : 'Request failed');
 } finally {
 setLoading(false);
 }
 };

 if (submitted) {
 return (
 <div className="min-h-screen bg-gray-50 py-32 px-4 transition-colors duration-300 flex items-center justify-center">
 <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-gray-100 text-center flex flex-col items-center">
 <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-black">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('common.booking_confirmed', 'تم حجز الاستشارة')}</h2>
          <p className="text-gray-600 mb-8">{t('common.booking_pending_schedule', 'تم حجز الاستشارة وسيتم التواصل معكم لتحديد الموعد')}</p>
 <Button to="/" className="w-full">{t('common.return_home', isRTL ? 'العودة للرئيسية' : 'Return Home')}</Button>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 py-24 transition-colors duration-300">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="bg-white pt-10 pb-12 px-8 sm:px-12 rounded-xl shadow-2xl border border-gray-100 ">
 <div className="text-center mb-10">
 <h1 className="text-3xl md:text-4xl font-black text-[var(--color-primary)] mb-4 drop-shadow-sm">
 {t('common.book_consultation')}
 </h1>
 <p className="text-gray-600 ">
 {t('booking.help_text', isRTL ? 'يرجى إدخال بياناتك لحجز استشارة.' : 'Please fill in your details to schedule a professional consultation.')}
 </p>
 </div>

 {error ? (
   <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg mb-6 text-sm">
     {error}
   </div>
 ) : null}

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName', 'Full Name')}</label>
 <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email', 'Email Address')}</label>
 <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone', isRTL ? 'رقم الهاتف' : 'Phone Number')}</label>
 <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.service_type', isRTL ? 'نوع الخدمة' : 'Service Type')}</label>
 <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 ">
 <option value="" disabled>{t('booking.select_service', isRTL ? 'اختر الخدمة...' : 'Select a service...')}</option>
 <option value="legal">{t('servicesItems.legal_consulting')}</option>
 <option value="accounting">{t('servicesItems.accounting_tax')}</option>
 </select>
 </div>
 </div>

 <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.booking_date', isRTL ? 'تاريخ الحجز' : 'Booking Date')}</label>
  <AvailabilityCalendar
    value={formData.bookingDate}
    onChange={(isoDate) => setFormData((p) => ({ ...p, bookingDate: isoDate }))}
    month={month}
    setMonth={setMonth}
    unavailableDates={unavailable}
    isRTL={isRTL}
    unavailableMessage={t('common.day_unavailable', 'هذا اليوم غير متاح')}
  />
  {dateError ? <div className="mt-2 text-sm text-red-600">{dateError}</div> : null}
 </div>

 <div className="mb-2">
 <a href="https://maps.app.goo.gl/yjGz5J2FZSbUPcq27" target="_blank" rel="noreferrer" className="text-sm font-medium text-[#c5a059] hover:underline flex items-center gap-1 mb-4">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 {t('booking.open_maps', isRTL ? 'افتح موقعنا على خرائط Google' : 'View our main office on Google Maps')}
 </a>
 <LocationSelect 
 initialGov={formData.governorate}
 initialCity={formData.city}
 onLocationChange={({governorate, city}) => setFormData(prev => ({ ...prev, governorate, city }))}
 />
 </div>

      {/* No preferred date/time: consultation scheduling will be handled by the company */}

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.notes', isRTL ? 'ملاحظات إضافية' : 'Additional Notes')}</label>
 <textarea name="notes" rows={4} value={formData.notes} onChange={handleChange} placeholder={t('booking.notes_placeholder', isRTL ? 'اشرح احتياجك باختصار...' : 'Briefly describe your requirements...')} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 resize-none"></textarea>
 </div>

 <Button type="submit" size="lg" disabled={loading} className="w-full shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
 {loading ? (
 <span className="flex items-center justify-center gap-2">
 <Loader2 className="w-5 h-5 animate-spin" /> {t('common.processing', isRTL ? 'جاري المعالجة...' : 'Processing...')}
 </span>
 ) : (
 t('common.confirm_booking', isRTL ? 'تأكيد الحجز' : 'Confirm Booking')
 )}
 </Button>
 </form>
 </div>
 </div>
 </div>
 );
};

export default Booking;
