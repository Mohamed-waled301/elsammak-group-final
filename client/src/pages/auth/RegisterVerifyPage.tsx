import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLanguageToggle from '../../components/AuthLanguageToggle';
import { getMe, verifyOTP as verifyRegisterOtpApi } from '../../api/auth';

type LocationState = { email?: string };

const RegisterVerifyPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stateEmail = (location.state as LocationState | null)?.email?.trim().toLowerCase() || '';
  const [emailInput, setEmailInput] = useState(stateEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});

  const email = stateEmail || emailInput.trim().toLowerCase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { email?: string; otp?: string } = {};
    if (!email) next.email = isRTL ? 'البريد مطلوب' : 'Email is required';
    const code = otp.replace(/\s/g, '');
    if (!/^\d{6}$/.test(code)) next.otp = isRTL ? 'أدخل رمزاً من 6 أرقام' : 'Enter the 6-digit code';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const vr = await verifyRegisterOtpApi({ email, otp: code });
      if (!vr.success) {
        throw new Error(vr.message);
      }
      const token = vr.token;
      if (!token) {
        throw new Error(t('auth.login_failed', 'Login failed'));
      }
      const me = await getMe(token);
      const user = me?.data?.user;
      login(token, {
        id: user?._id,
        name: user?.name || email,
        email: user?.email || email,
        picture: user?.picture,
        phone: user?.phone,
        role: 'client',
        nationalId: user?.nationalId,
        governorate: user?.governorate,
        city: user?.city,
      });
      toast.success(t('auth.login_success', 'Logged in successfully'));
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t('auth.unexpected_error', 'Something went wrong');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white/95 p-8 shadow-xl shadow-[#003B5C]/5 backdrop-blur-sm">
      <div className={`mb-6 flex items-center gap-3 ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <AuthLanguageToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-center text-2xl font-bold text-[#003B5C]">
          {isRTL ? 'تفعيل الحساب' : 'Activate your account'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isRTL ? 'أدخل الرمز المرسل إلى بريدك الإلكتروني.' : 'Enter the code we sent to your email.'}
        </p>

        <form onSubmit={submit} className="mt-8" noValidate>
          {!stateEmail ? (
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 px-4 text-sm shadow-inner outline-none focus:border-[#003B5C] focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25"
                placeholder="name@example.com"
              />
              {errors.email ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p> : null}
            </div>
          ) : (
            <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {isRTL ? 'الرمز أُرسل إلى:' : 'Code sent to:'}{' '}
              <span className="font-semibold text-[#003B5C]">{stateEmail}</span>
            </p>
          )}

          <div className="relative mb-6">
            <Lock className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setErrors((p) => ({ ...p, otp: undefined }));
              }}
              placeholder={isRTL ? 'رمز من 6 أرقام' : '6-digit code'}
              className={`block w-full rounded-xl border bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${errors.otp ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 focus:border-[#003B5C]'}`}
            />
            {errors.otp ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.otp}</p> : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003B5C] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002b44] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                {t('auth.verify_and_continue', 'Verify and continue')}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <Link
            to="/auth/register"
            className="inline-flex items-center justify-center gap-2 font-semibold text-gray-600 hover:text-[#003B5C]"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'العودة للتسجيل' : 'Back to registration'}
          </Link>
          <Link to="/auth" className="font-semibold text-[#003B5C] underline-offset-2 hover:underline">
            {isRTL ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterVerifyPage;
