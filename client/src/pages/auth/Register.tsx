import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import LocationSelect from '../../components/LocationSelect';
import { useAuth } from '../../context/AuthContext';
import { getMe, register as apiRegister, verifyOTP as apiVerifyOTP } from '../../api/auth';

const Register = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { login } = useAuth();
 const [mode, setMode] = useState<'register' | 'otp'>('register');
 const [loading, setLoading] = useState(false);

 const [formData, setFormData] = useState({
  name: '',
  nationalId: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  governorate: '',
  city: '',
  otp: ''
 });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleLocationChange = (loc: {governorate: string, city: string}) => {
  setFormData({ ...formData, governorate: loc.governorate, city: loc.city });
 };

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match ❌');
    return;
  }
  setLoading(true);
  try {
    const data = await apiRegister({
      name: formData.name,
      nationalId: formData.nationalId,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      governorate: formData.governorate,
      city: formData.city,
    });
    if (data?.success !== true) {
      toast.error(String(data?.message || 'Registration failed ❌'));
      return;
    }
    toast.success(String(data?.message || 'Registration successful ✅'));
    setMode('otp');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed ❌';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
 };

 const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const data = await apiVerifyOTP({
      email: formData.email,
      otp: formData.otp
    });
    if (data?.success !== true || !data?.token) {
      toast.error(String(data?.message || 'OTP verification failed ❌'));
      return;
    }
    const userRes = await getMe(data.token);
    const verifiedUser = userRes?.data?.user;
    login(data.token, {
      id: verifiedUser?._id,
      name: verifiedUser?.name || formData.name,
      email: verifiedUser?.email || formData.email,
      phone: verifiedUser?.phone || formData.phone,
      role: 'client',
      nationalId: verifiedUser?.nationalId || formData.nationalId,
      governorate: verifiedUser?.governorate || formData.governorate,
      city: verifiedUser?.city || formData.city,
    });
    toast.success('Account verified successfully ✅');
    navigate('/');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'OTP verification failed ❌';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
 };

 return (
 <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center transition-colors duration-300">
 <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-xl border border-gray-100 ">
 <h2 className="text-3xl font-black text-[var(--color-primary)] mb-6 text-center">
  {mode === 'register' ? t('auth.register') : t('auth.verify_otp', 'Verify OTP')}
 </h2>
 
 {mode === 'register' ? (
   <form onSubmit={handleRegister} className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
        <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.nationalId')}</label>
        <input type="text" name="nationalId" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
      <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone', 'WhatsApp Number')}</label>
      <input type="tel" name="phone" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
        <input type="password" name="confirmPassword" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
      </div>
    </div>
    
    <LocationSelect onLocationChange={handleLocationChange} />

    <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
      {loading ? 'Processing...' : t('auth.register')}
    </Button>

    <p className="text-center text-sm text-gray-600 mt-6">
      {t('auth.have_account')} <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">{t('auth.login')}</Link>
    </p>
   </form>
 ) : (
   <form onSubmit={handleVerify} className="space-y-5">
     <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
       <input type="text" name="otp" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
     </div>
     <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
       {loading ? 'Verifying...' : 'Verify OTP & Login'}
     </Button>
   </form>
 )}
 </div>
 </div>
 );
};

export default Register;
