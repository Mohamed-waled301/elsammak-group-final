import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getMe, login as apiLogin, getAuthStatus, bootstrapAdminApi } from '../../api/auth';
import AuthLanguageToggle from '../../components/AuthLanguageToggle';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [statusLoading, setStatusLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'admin',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatusLoading(true);
      const s = await getAuthStatus();
      if (!cancelled) {
        setAdminExists(s.adminExists);
        setStatusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStrongPassword = (password: string) => {
    if (password.length < 8) return false;
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      const confirmPassword = formData.confirmPassword.trim();
      if (!email || !password) {
        setError(t('auth.enter_email_password', 'Please enter email and password'));
        return;
      }
      if (!validateStrongPassword(password)) {
        setError(
          t(
            'auth.password_weak',
            'Password must be 8+ chars and contain upper, lower, number, and special char'
          )
        );
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth.passwords_mismatch', 'Passwords do not match'));
        return;
      }
      const res = await bootstrapAdminApi(email, password, confirmPassword);
      if (!res.success) {
        throw new Error(res.message);
      }
      toast.success(t('auth.bootstrap_success', 'Administrator created. Sign in with the Admin tab.'));
      setAdminExists(true);
      setFormData((p) => ({
        ...p,
        password: '',
        confirmPassword: '',
        role: 'admin',
      }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t('auth.unexpected_error', 'An unexpected error occurred');
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      if (!email || !password) {
        setError(t('auth.enter_email_password', 'Please enter email and password'));
        return;
      }
      const role = formData.role;
      const authRes = await apiLogin(
        role === 'admin' ? { mode: 'admin', email, password } : { email, password }
      );
      if (authRes?.success !== true) {
        throw new Error(authRes?.message || t('auth.login_failed', 'Login failed'));
      }
      const token = authRes?.token;
      if (!token) {
        throw new Error(t('auth.login_failed', 'Login failed'));
      }
      const me = await getMe(token);
      const user = me?.data?.user;
      const accountRole = user?.role === 'admin' ? 'admin' : 'client';
      if (role === 'admin' && accountRole !== 'admin') {
        throw new Error(t('auth.not_admin_account', 'This account is not an admin account'));
      }
      login(token, {
        id: user?._id,
        name: user?.name || email,
        email: user?.email || email,
        picture: user?.picture,
        phone: user?.phone,
        role: accountRole,
        nationalId: user?.nationalId,
        governorate: user?.governorate,
        city: user?.city,
      });
      toast.success(t('auth.login_success', 'Logged in successfully'));
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : t('auth.unexpected_error', 'An unexpected error occurred');
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `block w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 text-gray-900 shadow-inner transition-colors duration-200 placeholder:text-gray-400 focus:border-[#003B5C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B5C]/25 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`;

  const renderPasswordField = (name: 'password' | 'confirmPassword', placeholder: string) => (
    <div className="relative mb-4">
      <div
        className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}
      >
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        className={`block w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 text-gray-900 shadow-inner transition-colors duration-200 placeholder:text-gray-400 focus:border-[#003B5C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B5C]/25 ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 transition-colors hover:text-gray-700`}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );

  if (statusLoading) {
    return (
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/95 p-12 shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#003B5C]/30 border-t-[#003B5C]" />
        <p className="mt-4 text-sm text-gray-600">{t('auth.loading_auth', 'Loading…')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white/95 p-8 shadow-xl shadow-[#003B5C]/5 backdrop-blur-sm transition-all duration-300">
      <div className={`mb-6 flex items-center gap-3 ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <AuthLanguageToggle />
      </div>

      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <img
            src="/company-logo.png"
            alt="Elsamak Group"
            className="h-12 w-12 shrink-0 object-contain drop-shadow-sm"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/favicon.svg';
            }}
          />
          <div className="min-w-0 text-left rtl:text-right">
            <div className="text-lg font-black leading-tight tracking-tight text-[#003B5C]">
              {isRTL ? 'مجموعة السماك' : 'Elsamak Group'}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              {isRTL ? 'قانوني • محاسبي • تحليلي' : 'Legal • Accounting • Analytics'}
            </div>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[#003B5C] md:text-3xl">
          {!adminExists
            ? t('auth.bootstrap_title', 'Create administrator')
            : t('auth.sign_in', 'Sign In')}
        </h2>
        <p className="text-sm text-gray-600 md:text-base">
          {!adminExists
            ? t('auth.bootstrap_subtitle', 'Set up the only admin account. This can be done once.')
            : t('auth.welcome_back', 'Welcome back to El-Sammak Group')}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {!adminExists ? (
        <form onSubmit={handleBootstrap}>
          <div className="relative mb-4">
            <div
              className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}
            >
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.email_placeholder', 'Email Address')}
              autoComplete="email"
              className={inputClass}
              required
            />
          </div>
          {renderPasswordField('password', t('auth.password_placeholder', 'Password'))}
          {renderPasswordField(
            'confirmPassword',
            t('auth.bootstrap_password_confirm', 'Confirm password')
          )}
          <p className="mb-4 px-1 text-xs text-gray-500">
            {t(
              'auth.password_rules_blurb',
              'Must contain 8 characters, numbers, symbols, uppercase and lowercase letters'
            )}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003B5C] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#002b44] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {loading && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {t('auth.bootstrap_submit', 'Create administrator')}
            {!loading && <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />}
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleLogin}>
            <div className="mb-4 flex rounded-xl bg-gray-100/90 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                  formData.role === 'client'
                    ? 'bg-white text-[#003B5C] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('auth.role_client', 'Client')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                  formData.role === 'admin'
                    ? 'bg-[#003B5C] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('auth.role_admin', 'Admin')}
              </button>
            </div>

            {formData.role === 'admin' && (
              <p className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {t(
                  'auth.admin_only_hint',
                  'Only the designated company administrator account may sign in here.'
                )}
              </p>
            )}

            <div className="relative mb-4">
              <div
                className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}
              >
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.email_placeholder', 'Email Address')}
                autoComplete="email"
                className={inputClass}
                required
              />
            </div>

            <div className="relative mb-4">
              <div
                className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}
              >
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.password_placeholder', 'Password')}
                autoComplete="current-password"
                className={`block w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 text-gray-900 shadow-inner transition-colors duration-200 placeholder:text-gray-400 focus:border-[#003B5C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B5C]/25 ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 transition-colors hover:text-gray-700`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className={`mb-6 ${isRTL ? 'text-left' : 'text-right'}`}>
              <Link
                to="/auth/reset-with-otp"
                className="text-sm font-semibold text-[#c5a059] underline-offset-2 transition-colors duration-200 hover:text-[#a38042] hover:underline"
              >
                {t('auth.continue_with_email_code', 'Forgot password')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003B5C] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#002b44] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003B5C] focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {loading && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {t('auth.sign_in_button', 'Sign In')}
              {!loading && <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />}
            </button>
          </form>

          {formData.role === 'client' && (
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link
                to="/auth/register"
                className="font-semibold text-[#003B5C] underline-offset-2 transition-colors hover:underline"
              >
                {isRTL ? 'ليس لديك حساب؟ أنشئ حساباً' : "Don't have an account? Create one"}
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AuthPage;
