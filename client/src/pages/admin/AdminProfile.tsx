import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { updateAdminProfile } from '../../api/admin';

const AdminProfile = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // best-effort: decode from token payload not implemented; admin can just edit directly
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const payload: any = { name: form.name, email: form.email };
      if (form.password.trim()) payload.password = form.password;
      await updateAdminProfile(payload);
      setSaved(true);
      setForm((p) => ({ ...p, password: '' }));
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Request failed';
      setError(typeof msg === 'string' ? msg : 'Request failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-black text-[#003B5C]">{isRTL ? 'ملف المدير' : 'Admin Profile'}</h1>
              <p className="text-sm text-gray-600">{isRTL ? 'تحديث بيانات المدير' : 'Update admin account details'}</p>
            </div>
          </div>

          {saved ? (
            <div className="mb-4 bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg text-sm">
              {isRTL ? 'تم تحديث بيانات المدير بنجاح' : 'Admin profile updated successfully'}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'الاسم' : 'Name'}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRTL ? 'كلمة المرور (اختياري)' : 'Password (optional)'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white"
                placeholder={isRTL ? 'اتركها فارغة إذا لا تريد التغيير' : 'Leave blank to keep current password'}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

