import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import LocationSelect from '../components/LocationSelect';
import { BookOpen, Loader2 } from 'lucide-react';
import { submitTrainingBooking } from '../api/training';
import { getAvailability } from '../api/availability';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const TrainingBooking = () => {
 const { t, i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';
 const [submitted, setSubmitted] = useState(false);
 const [error, setError] = useState('');

 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 course: '',
 bookingDate: '',
 governorate: '',
 city: ''
 });
 const [month, setMonth] = useState(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 });
 const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
 const [dateError, setDateError] = useState('');

 useEffect(() => {
  const run = async () => {
    try {
      const res = await getAvailability({ serviceType: 'training', month });
      setUnavailable(new Set(res?.unavailableDates || []));
    } catch {
      setUnavailable(new Set());
    }
  };
  run();
 }, [month]);

 const [loading, setLoading] = useState(false);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 setDateError('');
 if (formData.bookingDate && unavailable.has(formData.bookingDate)) {
  setDateError(t('common.day_unavailable'));
  setLoading(false);
  return;
 }
 try {
 const result = await submitTrainingBooking(formData);
 toast.success(t('training.booking_confirmed_toast'));
 if (result?.emailSent === false && result?.emailWarning) {
   toast(result.emailWarning, { icon: '✉️', duration: 6000 });
 }
 setSubmitted(true);
 setFormData({ name: '', email: '', phone: '', course: '', bookingDate: '', governorate: '', city: '' });
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('training.success_title')}</h2>
          <p className="text-gray-600 mb-8">
            {t('training.success_msg')}
          </p>
 <Button to="/" className="w-full">{t('common.return_home')}</Button>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 py-24 transition-colors duration-300">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="bg-white pt-10 pb-12 px-8 sm:px-12 rounded-xl shadow-2xl border border-gray-100 ">
 <div className="text-center mb-10">
 <BookOpen className="w-12 h-12 text-[var(--color-gold)] mx-auto mb-4" />
 <h1 className="text-3xl md:text-4xl font-black text-[var(--color-primary)] mb-4 drop-shadow-sm">
 {t('training.book_seat')}
 </h1>
 <p className="text-gray-600 ">
{t('training.booking_help')}
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
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
 <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
 <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
 <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('training.program_label')}</label>
 <select name="course" required value={formData.course} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 ">
 <option value="" disabled>{t('training.select_program')}</option>
 <option value="data_analysis">{t('training.courses.c3_title')}</option>
 <option value="human_resources">{t('training.courses.c5_title')}</option>
 <option value="legal_training">{t('training.courses.c6_title')}</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.booking_date')}</label>
  <AvailabilityCalendar
    value={formData.bookingDate}
    onChange={(isoDate) => setFormData((p) => ({ ...p, bookingDate: isoDate }))}
    month={month}
    setMonth={setMonth}
    unavailableDates={unavailable}
    isRTL={isRTL}
    unavailableMessage={t('common.day_unavailable')}
  />
  {dateError ? <div className="mt-2 text-sm text-red-600">{dateError}</div> : null}
 </div>

 <LocationSelect 
 initialGov={formData.governorate}
 initialCity={formData.city}
 onLocationChange={({governorate, city}) => setFormData(prev => ({ ...prev, governorate, city }))}
 />

 {/* Start date is provided by backend course catalog */}

 <Button type="submit" size="lg" disabled={loading} className="w-full shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
 {loading ? (
 <span className="flex items-center justify-center gap-2">
 <Loader2 className="w-5 h-5 animate-spin" /> {t('common.processing')}
 </span>
 ) : (
 t('common.confirm_booking')
 )}
 </Button>
 </form>
 </div>
 </div>
 </div>
 );
};

export default TrainingBooking;
