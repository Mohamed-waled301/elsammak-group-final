import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getMe, resetPasswordAfterOtp, sendPasswordResetOtp, verifyPasswordResetOtp } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

type Step = 'send' | 'verify' | 'reset';

/**
 * Password reset via API: POST /api/auth/send-otp → verify-otp → reset-password.
 */
export default function PasswordResetOtpFlow() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('send');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    setLoading(true);
    try {
      const res = await sendPasswordResetOtp(email.trim().toLowerCase());
      if (res?.success !== true) {
        throw new Error(String(res?.message || t('auth.reset_flow_failed')));
      }
      toast.success(String(res?.message || t('auth.otp_sent')));
      setStep('verify');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.unexpected_error');
      setStepError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    setLoading(true);
    try {
      const res = await verifyPasswordResetOtp(email.trim().toLowerCase(), otp.trim());
      if (res?.success !== true) {
        throw new Error(String(res?.message || t('auth.activation_failed')));
      }
      toast.success(String(res?.message || t('auth.code_verified')));
      setStep('reset');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.unexpected_error');
      setStepError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    if (newPassword !== confirm) {
      const msg = t('auth.passwords_mismatch');
      setStepError(msg);
      toast.error(msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = t('auth.password_min_length_six');
      setStepError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordAfterOtp(email.trim().toLowerCase(), newPassword);
      if (res?.success !== true) {
        throw new Error(String(res?.message || t('auth.reset_flow_failed')));
      }
      toast.success(String(res?.message || t('auth.login_success')));
      if (res?.token) {
        const me = await getMe(res.token);
        const u = me.data.user;
        login(res.token, {
          id: u._id,
          name: u.name || email,
          email: u.email || email,
          phone: u.phone,
          role: u.role === 'admin' ? 'admin' : 'client',
          nationalId: u.nationalId,
          governorate: u.governorate,
          city: u.city,
        });
      }
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.unexpected_error');
      setStepError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#003B5C]">{t('auth.password_help_title')}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('auth.password_help_blurb')}</p>
      </div>

      {stepError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {stepError}
        </div>
      ) : null}

      {step === 'send' && (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('auth.email_placeholder')}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#003B5C] focus:outline-none focus:ring-1 focus:ring-[#003B5C] disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#003B5C] py-2.5 font-medium text-white hover:bg-[#002b44] disabled:opacity-60"
          >
            {loading ? t('auth.sending') : t('auth.send_code')}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('auth.otp_sent_blurb')}{' '}
            <span className="font-medium text-gray-900">{email}</span>.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('auth.otp_placeholder')}</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 tracking-widest shadow-sm focus:border-[#003B5C] focus:outline-none focus:ring-1 focus:ring-[#003B5C] disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-lg bg-[#003B5C] py-2.5 font-medium text-white hover:bg-[#002b44] disabled:opacity-60"
          >
            {loading ? t('auth.verifying') : t('auth.verify_code')}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep('send');
              setStepError('');
            }}
            className="w-full text-sm text-[#c5a059] hover:underline disabled:opacity-50"
          >
            {t('auth.use_different_email')}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('auth.new_password')}</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#003B5C] focus:outline-none focus:ring-1 focus:ring-[#003B5C] disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('auth.confirm_new_password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#003B5C] focus:outline-none focus:ring-1 focus:ring-[#003B5C] disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#003B5C] py-2.5 font-medium text-white hover:bg-[#002b44] disabled:opacity-60"
          >
            {loading ? t('auth.saving') : t('auth.update_password')}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500">
        <Link to="/auth" className="font-medium text-[#c5a059] hover:text-[#a38042]">
          {t('auth.back_to_sign_in')}
        </Link>
      </p>
    </div>
  );
}
