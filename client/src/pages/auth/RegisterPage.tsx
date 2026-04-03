import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, CreditCard, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import egyptLocations from '@project-data/egyptLocations.json';
import AuthLanguageToggle from '../../components/AuthLanguageToggle';
import { SearchableSelect } from '../../components/auth/SearchableSelect';
import { register as registerClientApi } from '../../api/auth';

type LocationMap = Record<string, string[]>;

const locations = egyptLocations as LocationMap;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStrongPassword(password: string) {
  if (password.length < 8) return false;
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function digitsOnlyMax14(value: string) {
  return value.replace(/\D/g, '').slice(0, 14);
}

const MSG_NATIONAL_ID_EXACT = 'National ID must be exactly 14 digits.';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [district, setDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const governorates = useMemo(() => Object.keys(locations).sort((a, b) => a.localeCompare(b)), []);
  const districts = useMemo(
    () => (governorate && locations[governorate] ? [...locations[governorate]].sort((a, b) => a.localeCompare(b)) : []),
    [governorate]
  );

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const runValidation = () => {
    const err: Record<string, string> = {};
    const tr = (en: string, ar: string) => (isRTL ? ar : en);

    if (!name.trim()) err.name = tr('Full name is required.', 'الاسم الكامل مطلوب.');
    else if (name.trim().length > 200) err.name = tr('Name is too long.', 'الاسم طويل جداً.');

    if (!email.trim()) err.email = tr('Email is required.', 'البريد الإلكتروني مطلوب.');
    else if (!validateEmail(email.trim())) err.email = tr('Enter a valid email.', 'أدخل بريداً إلكترونياً صالحاً.');

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) err.phone = tr('Phone number is required.', 'رقم الهاتف مطلوب.');
    else if (phoneDigits.length < 7) err.phone = tr('Enter at least 7 digits.', 'أدخل 7 أرقام على الأقل.');
    else if (phone.length > 40) err.phone = tr('Phone number is too long.', 'رقم الهاتف طويل جداً.');

    if (!nationalId) err.nationalId = tr('National ID is required.', 'الرقم القومي مطلوب.');
    else if (!/^\d{14}$/.test(nationalId))
      err.nationalId = tr(MSG_NATIONAL_ID_EXACT, 'يجب أن يكون الرقم القومي 14 رقماً بالضبط.');

    if (!password) err.password = tr('Password is required.', 'كلمة المرور مطلوبة.');
    else if (!validateStrongPassword(password))
      err.password = tr(
        'Use 8+ characters with upper, lower, number, and special character.',
        '8 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز.'
      );

    if (!confirmPassword) err.confirmPassword = tr('Confirm your password.', 'أكد كلمة المرور.');
    else if (password !== confirmPassword)
      err.confirmPassword = tr('Passwords do not match.', 'كلمتا المرور غير متطابقتين.');

    if (!governorate) err.governorate = tr('Select a governorate.', 'اختر المحافظة.');
    if (!district) err.district = tr('Select a district.', 'اختر المنطقة / الحي.');
    else if (governorate && !districts.includes(district))
      err.district = tr('District does not match governorate.', 'المنطقة لا تتطابق مع المحافظة.');

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runValidation()) return;

    setLoading(true);
    try {
      const res = await registerClientApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        phone: phone.trim(),
        nationalId,
        governorate,
        city: district,
      });
      if (!res.success) {
        throw new Error(res.message);
      }
      setSuccess(true);
      toast.success(
        t('auth.register_otp_sent', 'Check your email for a 6-digit code to activate your account.')
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.unexpected_error', 'Something went wrong');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const goToVerify = () => {
    navigate('/auth/register/verify', {
      state: { email: email.trim().toLowerCase() },
      replace: false,
    });
  };

  const inputRing = (key: string) =>
    fieldErrors[key] ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 focus:border-[#003B5C]';

  const nationalIdLiveHint = useMemo(() => {
    if (nationalId.length === 0) return '';
    if (nationalId.length === 14) return '';
    return isRTL ? 'يجب أن يكون الرقم القومي 14 رقماً بالضبط.' : MSG_NATIONAL_ID_EXACT;
  }, [nationalId, isRTL]);

  const nationalIdShowError = Boolean(fieldErrors.nationalId || nationalIdLiveHint);

  return (
    <div className="w-full max-w-lg rounded-2xl border border-gray-200/80 bg-white/95 p-8 shadow-xl shadow-[#003B5C]/5 backdrop-blur-sm">
      <div className={`mb-6 flex items-center gap-3 ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <AuthLanguageToggle />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#003B5C] md:text-3xl">
          {isRTL ? 'إنشاء حساب عميل' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isRTL ? 'أكمل البيانات للتسجيل. سنرسل رمز تحقق إلى بريدك.' : 'Fill in your details. We will email you a verification code.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-100 bg-emerald-50/90 p-6 text-center"
          >
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
            <h2 className="text-lg font-bold text-emerald-900">
              {isRTL ? 'تم إرسال رمز التحقق' : 'Verification code sent'}
            </h2>
            <p className="mt-2 text-sm text-emerald-800/90">
              {isRTL
                ? `تحقق من صندوق الوارد للبريد ${email.trim()} وأدخل الرمز في الخطوة التالية.`
                : `Check the inbox for ${email.trim()} and enter the code on the next step.`}
            </p>
            <button
              type="button"
              onClick={goToVerify}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003B5C] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002b44]"
            >
              {isRTL ? 'متابعة التحقق' : 'Continue to verification'}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <Link
              to="/auth"
              className="mt-4 inline-block text-sm font-semibold text-[#003B5C] underline-offset-2 hover:underline"
            >
              {isRTL ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {isRTL ? 'الاسم الكامل' : 'Full name'}
              </label>
              <div className="relative">
                <User className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError('name');
                  }}
                  autoComplete="name"
                  className={`block w-full rounded-xl bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${inputRing('name')}`}
                  placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                />
              </div>
              {fieldErrors.name ? <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.name}</p> : null}
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
              <div className="relative">
                <Mail className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  autoComplete="email"
                  className={`block w-full rounded-xl bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${inputRing('email')}`}
                  placeholder="name@example.com"
                />
              </div>
              {fieldErrors.email ? <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.email}</p> : null}
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {isRTL ? 'رقم الهاتف' : 'Phone number'}
              </label>
              <div className="relative">
                <Phone className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                  }}
                  autoComplete="tel"
                  className={`block w-full rounded-xl bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${inputRing('phone')}`}
                  placeholder={isRTL ? 'مثال: 01012345678' : 'e.g. 01012345678'}
                />
              </div>
              {fieldErrors.phone ? <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.phone}</p> : null}
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {isRTL ? 'الرقم القومي' : 'National ID'}
              </label>
              <div className="relative">
                <CreditCard className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  name="nationalId"
                  value={nationalId}
                  onChange={(e) => {
                    setNationalId(digitsOnlyMax14(e.target.value));
                    clearFieldError('nationalId');
                  }}
                  maxLength={14}
                  aria-invalid={nationalIdShowError}
                  className={`block w-full rounded-xl border bg-gray-50/80 py-3 font-mono tracking-wider ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${
                    nationalIdShowError ? 'border-red-400 ring-1 ring-red-100' : 'border-gray-200 focus:border-[#003B5C]'
                  }`}
                  placeholder={isRTL ? 'أدخل الرقم القومي المكوّن من 14 رقماً' : 'Enter your 14-digit National ID'}
                />
              </div>
              {fieldErrors.nationalId ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.nationalId}</p>
              ) : nationalIdLiveHint ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{nationalIdLiveHint}</p>
              ) : nationalId.length === 14 ? (
                <p className="mt-1.5 text-xs font-medium text-emerald-700">
                  {isRTL ? 'صيغة صالحة' : 'Valid length'}
                </p>
              ) : null}
            </div>

            <SearchableSelect
              id="governorate"
              label={isRTL ? 'المحافظة' : 'Governorate'}
              options={governorates}
              value={governorate}
              onChange={(v) => {
                setGovernorate(v);
                setDistrict('');
                clearFieldError('governorate');
                clearFieldError('district');
              }}
              placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'}
              searchPlaceholder={isRTL ? 'بحث…' : 'Search…'}
              error={fieldErrors.governorate}
              isRTL={isRTL}
            />

            <SearchableSelect
              key={governorate || 'district'}
              id="district"
              label={isRTL ? 'المنطقة / الحي' : 'District'}
              options={districts}
              value={district}
              onChange={(v) => {
                setDistrict(v);
                clearFieldError('district');
              }}
              placeholder={isRTL ? 'اختر المنطقة' : 'Select district'}
              disabled={!governorate}
              searchPlaceholder={isRTL ? 'بحث…' : 'Search…'}
              error={fieldErrors.district}
              isRTL={isRTL}
            />

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  autoComplete="new-password"
                  className={`block w-full rounded-xl bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${inputRing('password')}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  {t(
                    'auth.password_rules_blurb',
                    'Must contain 8 characters, numbers, symbols, uppercase and lowercase letters'
                  )}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm password'}
              </label>
              <div className="relative">
                <Lock className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  autoComplete="new-password"
                  className={`block w-full rounded-xl bg-gray-50/80 py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm shadow-inner outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#003B5C]/25 ${inputRing('confirmPassword')}`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>
              ) : null}
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
                  {isRTL ? 'إنشاء الحساب' : 'Create account'}
                  <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              <Link to="/auth" className="font-semibold text-[#003B5C] underline-offset-2 hover:underline">
                {isRTL ? 'لديك حساب؟ سجّل الدخول' : 'Already have an account? Sign in'}
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
