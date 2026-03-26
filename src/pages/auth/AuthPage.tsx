import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Phone, CreditCard, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LocationSelect from '../../components/LocationSelect';

type AuthMode = 'login' | 'register' | 'otp' | 'forgot-password';

const AuthPage = () => {
 const { login } = useAuth();
 const navigate = useNavigate();
 const { i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';

 const [mode, setMode] = useState<AuthMode>('login');
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 // Form State
 const [formData, setFormData] = useState({
 name: '',
 nationalId: '',
 email: '',
 password: '',
 confirmPassword: '',
 phone: '',
 governorate: '',
 city: '',
 otp: '',
 role: 'client' as 'client' | 'admin'
 });

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 setError('');
 };

 const validatePassword = (password: string) => {
 const minLength = password.length >= 8;
 const hasUpper = /[A-Z]/.test(password);
 const hasLower = /[a-z]/.test(password);
 const hasNumber = /[0-9]/.test(password);
 const hasSpecial = /[^A-Za-z0-9]/.test(password);
 return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
 };

 const validateNationalId = (id: string) => {
 return /^\d{14}$/.test(id);
 };

  const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 try {
      if (mode === 'login') {
        const email = formData.email.trim();
        const password = formData.password;

        if (!email || !password) {
          setError(isRTL ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
          return;
        }

        // Frontend-only mock login (no backend calls).
        const token = `mock_token_${Date.now()}`;
        const role = formData.role;

        localStorage.setItem('user', JSON.stringify({ email }));
        login(token, { name: role === 'admin' ? 'Admin' : email, email, role });

        setError('');
        navigate(role === 'admin' ? '/admin/dashboard' : '/');
        return;
      }

      if (mode === 'register') {
        if (!validateNationalId(formData.nationalId)) {
          throw new Error(isRTL ? 'الرقم القومي يجب أن يكون 14 رقماً بالضبط' : 'National ID must be exactly 14 digits');
        }
        if (!validatePassword(formData.password)) {
          throw new Error(
            isRTL
              ? 'كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، رقم ورمز خاص'
              : 'Password must be 8+ chars and contain upper, lower, number, and special char'
          );
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error(isRTL ? 'كلمات المرور لا تتطابق' : 'Passwords do not match');
        }
        if (!formData.governorate || !formData.city) {
          throw new Error(isRTL ? 'يرجى اختيار المحافظة والمدينة' : 'Please select Governorate and City');
        }

        // Simulate registration success and move to OTP step.
        setMode('otp');
        setError('');
        return;
      }

      if (mode === 'otp') {
        const otpValue = formData.otp.replace(/\s+/g, '').trim();
        if (!/^\d{6}$/.test(otpValue)) {
          throw new Error(isRTL ? 'رمز التفعيل غير صالح' : 'Invalid OTP code');
        }

        // Simulate OTP verification success.
        const token = `mock_token_${Date.now()}`;
        const role = formData.role;
        login(token, { name: role === 'admin' ? 'Admin' : formData.email, email: formData.email, role });

        setError('');
        navigate(role === 'admin' ? '/admin/dashboard' : '/');
        return;
      }

      if (mode === 'forgot-password') {
        if (formData.email) {
          setMode('login');
          setError(isRTL ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني' : 'Reset link sent to your email');
        }
        return;
      }
    } catch (err: any) {
      setError(err?.message || (isRTL ? 'حدث خطأ غير متوقع' : 'Unexpected error'));
 } finally {
 setLoading(false);
 }
 };

 const renderInput = (name: string, type: string, placeholder: string, icon: React.ReactNode, value: string) => (
 <div className="relative mb-4">
 <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
 {icon}
 </div>
 <input
 type={name === 'password' || name === 'confirmPassword' ? (showPassword ? 'text' : 'password') : type}
 name={name}
 value={value}
 onChange={handleChange}
 placeholder={placeholder}
 className={`w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#003B5C] focus:border-[#003B5C] block py-3 ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
 required
 />
 {(name === 'password' || name === 'confirmPassword') && (
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-500 hover:text-gray-700 `}
 >
 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 )}
 </div>
 );

 return (
 <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all">
 <div className="text-center mb-8">
 <div className="flex items-center justify-center gap-3 mb-4">
   <img src="/favicon.svg" alt="elsamak Group" className="w-12 h-12" />
   <div className="text-left rtl:text-right">
     <div className="text-xl font-black text-[#003B5C] leading-tight">elsamak Group</div>
     <div className="text-xs text-gray-500">{isRTL ? 'بوابة العملاء والإدارة' : 'Client & Admin Portal'}</div>
   </div>
 </div>
 <h2 className="text-3xl font-bold text-[#003B5C] mb-2">
 {mode === 'login' && (isRTL ? 'تسجيل الدخول' : 'Sign In')}
 {mode === 'register' && (isRTL ? 'إنشاء حساب جديد' : 'Create Account')}
 {mode === 'otp' && (isRTL ? 'تفعيل الحساب' : 'Account Activation')}
 {mode === 'forgot-password' && (isRTL ? 'استعادة كلمة المرور' : 'Reset Password')}
 </h2>
 <p className="text-gray-600 ">
 {mode === 'login' && (isRTL ? 'مرحباً بك مجدداً في مجموعة السمّاك' : 'Welcome back to El-Sammak Group')}
 {mode === 'register' && (isRTL ? 'يرجى استكمال البيانات التالية' : 'Please complete the following details')}
 {mode === 'otp' && (isRTL ? 'تم إرسال كود التفعيل إلى بريدك الإلكتروني' : 'OTP has been sent to your email')}
 </p>
 </div>

 {error && (
 <div className={`p-4 mb-6 text-sm rounded-lg ${error.includes('sent') || error.includes('إرسال') ? 'bg-green-100 text-green-800 ' : 'bg-red-100 text-red-800 '}`}>
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit}>
 {/* ROLE SELECTION FOR LOGIN */}
 {mode === 'login' && (
 <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, role: 'client' })}
 className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'client' ? 'bg-white text-[#003B5C] shadow-sm' : 'text-gray-500'}`}
 >
 {isRTL ? 'عميل' : 'Client'}
 </button>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, role: 'admin' })}
 className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.role === 'admin' ? 'bg-[#003B5C] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
 >
 {isRTL ? 'مدير' : 'Admin'}
 </button>
 </div>
 )}

 {/* LOGIN / FORGOT PASSWORD / REGISTER SHARED FIELDS */}
 {mode !== 'otp' && renderInput('email', 'email', isRTL ? 'البريد الإلكتروني' : 'Email Address', <Mail className="w-5 h-5 text-gray-400" />, formData.email)}
 
 {(mode === 'login' || mode === 'register') && 
 renderInput('password', 'password', isRTL ? 'كلمة المرور' : 'Password', <Lock className="w-5 h-5 text-gray-400" />, formData.password)}

 {/* REGISTER ONLY FIELDS */}
 {mode === 'register' && (
 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {renderInput('confirmPassword', 'password', isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password', <Lock className="w-5 h-5 text-gray-400" />, formData.confirmPassword)}
 <p className="text-xs text-gray-500 -mt-2 mb-4 px-2">
 {isRTL ? 'يجب أن تحتوي على 8 أحرف وأرقام ورموز وحروف كبيرة وصغيرة' : 'Must contain 8 chars, numbers, symbols, uppercase & lowercase'}
 </p>
 {renderInput('name', 'text', isRTL ? 'الاسم بالكامل' : 'Full Name', <User className="w-5 h-5 text-gray-400" />, formData.name)}
 {renderInput('nationalId', 'text', isRTL ? 'الرقم القومي (14 رقم)' : 'National ID (14 digits)', <CreditCard className="w-5 h-5 text-gray-400" />, formData.nationalId)}
 {renderInput('phone', 'tel', isRTL ? 'رقم الواتساب' : 'WhatsApp Number', <Phone className="w-5 h-5 text-gray-400" />, formData.phone)}
 
 <div className="mb-4">
 <LocationSelect 
 initialGov={formData.governorate}
 initialCity={formData.city}
 onLocationChange={({governorate, city}) => setFormData(prev => ({ ...prev, governorate, city }))}
 />
 </div>
 </div>
 )}

 {/* OTP ONLY FIELD */}
 {mode === 'otp' && (
 <div className="animate-in fade-in duration-500">
 {renderInput('otp', 'text', isRTL ? 'كود التفعيل' : 'OTP Code', <Lock className="w-5 h-5 text-gray-400" />, formData.otp)}
 </div>
 )}

 {/* FORGOT PASSWORD LINK IN LOGIN */}
 {mode === 'login' && (
 <div className="flex justify-end mb-6">
 <button
 type="button"
 onClick={() => { setMode('forgot-password'); setError(''); }}
 className="text-sm font-medium text-[#c5a059] hover:text-[#a38042]"
 >
 {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
 </button>
 </div>
 )}

 {/* SUBMIT BUTTON */}
 <button
 type="submit"
 disabled={loading}
 className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-[#003B5C] hover:bg-[#002b44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003B5C] disabled:opacity-50 transition-colors"
 >
 {loading && (
 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 )}
 {mode === 'login' && (isRTL ? 'تسجيل دخول' : 'Sign In')}
 {mode === 'register' && (isRTL ? 'تأكيد الحساب' : 'Confirm Registration')}
 {mode === 'otp' && (isRTL ? 'تفعيل الدخول' : 'Activate & Login')}
 {mode === 'forgot-password' && (isRTL ? 'إرسال الرابط' : 'Send Reset Link')}
 {!loading && <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />}
 </button>

 {/* TOGGLE MODES */}
 <div className="mt-6 text-center text-sm text-gray-600 ">
 {mode === 'login' && (
 <p>
 {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
 <button type="button" onClick={() => { setMode('register'); setError(''); }} className="font-medium text-[#c5a059] hover:text-[#a38042]">
 {isRTL ? 'إنشاء حساب جديد' : 'Create one'}
 </button>
 </p>
 )}
 {(mode === 'register' || mode === 'forgot-password') && (
 <p>
 {isRTL ? 'العودة إلى' : 'Back to'}{' '}
 <button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-medium text-[#c5a059] hover:text-[#a38042]">
 {isRTL ? 'تسجيل الدخول' : 'Sign In'}
 </button>
 </p>
 )}
 </div>
 </form>
 </div>
 );
};

export default AuthPage;
