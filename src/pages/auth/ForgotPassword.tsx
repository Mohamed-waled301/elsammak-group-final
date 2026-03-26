import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { forgotPassword as apiForgotPassword } from '../../api/auth';

const ForgotPassword = () => {
 const { t } = useTranslation();
 const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiForgotPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      alert(error?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

 return (
 <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center transition-colors duration-300">
 <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl border border-gray-100 ">
 <h2 className="text-3xl font-black text-[var(--color-primary)] mb-6 text-center">
 {t('auth.forgot_pass')}
 </h2>
 {submitted ? (
 <div className="text-center">
 <p className="text-green-600 font-medium mb-6">
 If an account with that email exists, we have sent a reset link to it.
 </p>
 <Button to="/login" variant="outline" className="w-full">
 Back to Login
 </Button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-5">
 <p className="text-gray-600 text-sm mb-6 text-center">
 Enter your email address to receive a secure password reset link.
 </p>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
 <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>

 <Button type="submit" className="w-full mt-4" size="lg" disabled={loading}>
 {loading ? 'Sending...' : 'Send Reset Link'}
 </Button>

 <p className="text-center text-sm text-gray-600 mt-6">
 <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">
 Back to Login
 </Link>
 </p>
 </form>
 )}
 </div>
 </div>
 );
};

export default ForgotPassword;
