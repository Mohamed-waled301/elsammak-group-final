import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import LocationSelect from '../../components/LocationSelect';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

const Login = () => {
 const { t } = useTranslation();
 const { login } = useAuth();

 const [formData, setFormData] = useState({
 email: '',
 password: '',
 nationalId: '',
 fullName: '',
 governorate: '',
 city: ''
 });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 const handleLocationChange = (loc: {governorate: string, city: string}) => {
 setFormData({ ...formData, governorate: loc.governorate, city: loc.city });
 };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      const data = res.data;
      
      console.log("Login Response:", data);
      
      // Fetch user data using token
      const userRes = await apiClient.get('/api/users/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const userData = userRes.data;
      
      const verifiedUser = userData.data.user;
      login(data.token, { ...verifiedUser, role: verifiedUser.role === 'user' ? 'client' : verifiedUser.role });
      
      window.location.href = '/';
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error?.response?.data?.message || error.message);
    }
  };

 return (
 <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center transition-colors duration-300">
 <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-xl border border-gray-100 ">
 <h2 className="text-3xl font-black text-[var(--color-primary)] mb-6 text-center">
 {t('auth.login')}
 </h2>
 <form onSubmit={handleLogin} className="space-y-5">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
 <input type="text" name="fullName" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.nationalId')}</label>
 <input type="text" name="nationalId" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
 <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
 <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] outline-none bg-white text-gray-900 " />
 </div>
 
 <LocationSelect onLocationChange={handleLocationChange} />

 <div className="flex justify-between items-center text-sm pt-2">
 <Link to="/forgot-password" className="text-[var(--color-gold)] hover:underline">
 {t('auth.forgot_pass')}
 </Link>
 </div>

 <Button type="submit" className="w-full mt-4" size="lg">
 {t('auth.login')}
 </Button>

 <p className="text-center text-sm text-gray-600 mt-6">
 {t('auth.dont_have_account')} <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">{t('auth.register')}</Link>
 </p>
 </form>
 </div>
 </div>
 );
};

export default Login;
