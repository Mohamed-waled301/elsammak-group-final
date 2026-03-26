import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const savedToken = useMemo(() => {
    if (!email) return null;
    return localStorage.getItem('reset_' + email);
  }, [email]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (value: string) => value.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !token) {
      setError('بيانات غير صالحة');
      return;
    }

    if (!savedToken || savedToken !== token) {
      setError('الرابط غير صالح أو منتهي');
      return;
    }

    if (!validatePassword(password)) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمات المرور لا تتطابق');
      return;
    }

    // Save new password (frontend-only).
    localStorage.setItem('user_' + email, password);
    localStorage.removeItem('reset_' + email);

    setError('');
    setSuccess('تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
    setTimeout(() => {
      navigate('/auth');
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-black text-[var(--color-primary)] mb-6 text-center">إعادة تعيين كلمة المرور</h2>

      {error && (
        <div className="p-4 mb-6 text-sm rounded-lg bg-red-100 text-red-800 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 text-sm rounded-lg bg-green-100 text-green-800 text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900"
            required
          />
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" disabled={!token || !email}>
          حفظ كلمة المرور
        </Button>
      </form>
    </div>
  );
}

