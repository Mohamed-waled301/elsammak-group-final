import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMe } from '../api/auth';
import { updateMe } from '../api/user';
import { Mail, Phone, GraduationCap, Scale } from 'lucide-react';

const Profile = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) {
          setMe(null);
          return;
        }
        const res = await getMe(token);
        const data = res?.data || null;
        setMe(data);
        setForm({
          name: data?.user?.name || '',
          email: data?.user?.email || '',
          phone: data?.user?.phone || '',
        });
      } catch (e) {
        console.error('Failed to load profile', e);
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B5C]"></div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'لم يتم تحميل بيانات الحساب' : 'Failed to load account data'}
          </h2>
        </div>
      </div>
    );
  }

  const trainings = me.trainings || [];
  const consultations = me.consultations || [];
  const qrCode = me.qrCode || null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await updateMe({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (token) {
        const fresh = await getMe(token);
        setMe(fresh?.data || null);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Request failed';
      setError(typeof msg === 'string' ? msg : 'Request failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={onSave}>
          <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {isRTL ? 'الملف الشخصي' : 'Profile'}
              </h1>

              {saved ? (
                <div className="mt-3 text-sm bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg">
                  {isRTL ? 'تم حفظ البيانات بنجاح' : 'Saved successfully'}
                </div>
              ) : null}
              {error ? (
                <div className="mt-3 text-sm bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 space-y-3 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> {isRTL ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] shadow-sm px-5 py-2.5 text-base bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)] disabled:opacity-60"
                >
                  {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                </button>
              </div>
            </div>

            <div className="md:w-80">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm font-bold text-[#003B5C] mb-3">
                  {isRTL ? 'الرمز الخاص بك (QR)' : 'Your QR code'}
                </div>
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Client QR"
                    className="w-full h-auto rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <div className="text-sm text-gray-600">{isRTL ? 'غير متوفر' : 'Unavailable'}</div>
                )}
              </div>
            </div>
          </div>
          </form>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-gray-100">
              <div className="text-sm font-bold text-[#003B5C] mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {isRTL ? 'التدريبات' : 'Trainings'}
                <span className="text-gray-600 font-normal">({trainings.length})</span>
              </div>
              {trainings.length === 0 ? (
                <div className="text-sm text-gray-600">{isRTL ? 'لا توجد تدريبات' : 'No trainings'}</div>
              ) : (
                <ul className="space-y-2 text-sm text-gray-800">
                  {trainings.map((t: any) => (
                    <li key={t._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="font-semibold">{t.course}</div>
                      <div className="text-gray-600">
                        {isRTL ? 'تاريخ البدء' : 'Start date'}: {t.startDate || '-'}
                      </div>
                      <div className="text-gray-600">{t.schedule || ''}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 rounded-xl border border-gray-100">
              <div className="text-sm font-bold text-[#003B5C] mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                {isRTL ? 'الاستشارات' : 'Consultations'}
                <span className="text-gray-600 font-normal">({consultations.length})</span>
              </div>
              {consultations.length === 0 ? (
                <div className="text-sm text-gray-600">{isRTL ? 'لا توجد استشارات' : 'No consultations'}</div>
              ) : (
                <ul className="space-y-2 text-sm text-gray-800">
                  {consultations.map((c: any) => (
                    <li key={c._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="font-semibold">{c.serviceType}</div>
                      <div className="text-gray-600">
                        {c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '-'}
                      </div>
                      <div className="text-gray-700">{c.notes || '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
