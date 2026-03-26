import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Menu, X, UserCircle } from 'lucide-react';
import clsx from 'clsx';

const Navbar = () => {
 const { t } = useTranslation();
 const { language, changeLanguage } = useLanguage();
 const [isOpen, setIsOpen] = useState(false);

 const navLinks = [
 { name: t('nav.home'), path: '/' },
 { name: t('nav.about'), path: '/about' },
 { name: t('nav.services'), path: '/services' },
 { name: t('nav.data_analysis'), path: '/data-analysis' },
 { name: t('nav.training'), path: '/training' },
 { name: t('nav.contact'), path: '/contact' },
 ];

 const handleLangToggle = () => {
 changeLanguage(language === 'en' ? 'ar' : 'en');
 };

 return (
 <nav className="sticky top-0 z-50 w-full bg-[var(--bg-color)] border-b border-gray-200 transition-colors duration-300 shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between h-16">
 {/* Logo */}
 <div className="flex-shrink-0 flex items-center">
 <Link to="/" className="text-2xl font-bold tracking-tighter text-[var(--color-primary)] flex items-center gap-2">
 <img src="/favicon.svg" alt="elsamak Group" className="w-9 h-9 shrink-0" />
 <span className="hidden sm:block">elsamak Group</span>
 </Link>
 </div>

 {/* Desktop Menu */}
 <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6 rtl:space-x-reverse mr-auto rtl:ml-auto rtl:mr-0 pl-10 rtl:pl-0 rtl:pr-10">
 {navLinks.map((link) => (
 <NavLink
 key={link.path}
 to={link.path}
 className={({ isActive }) => clsx(
 'text-sm font-medium transition-colors hover:text-[var(--color-gold)] relative py-2',
 isActive
 ? 'text-[var(--color-gold)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-gold)]'
 : 'text-gray-700 '
 )}
 >
 {link.name}
 </NavLink>
 ))}
 </div>

 {/* Actions */}
 <div className="flex items-center space-x-2 rtl:space-x-reverse">
  <button
 onClick={handleLangToggle}
 className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
 aria-label="Toggle Language"
 >
 <Globe className="w-5 h-5 text-gray-600 " />
 </button>

 {/* Auth Link */}
 <Link
 to="/auth"
 className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md transition-colors shadow-sm ml-4 rtl:ml-0 rtl:mr-4"
 aria-label="Login"
 >
 <UserCircle className="w-5 h-5" />
 <span>{t('auth.login', 'Login')}</span>
 </Link>

 {/* Mobile menu button */}
 <div className="flex items-center md:hidden ms-2">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
 >
 {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Mobile Menu */}
 {isOpen && (
 <div className="md:hidden bg-[var(--bg-color)] border-t border-gray-200 ">
 <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
 {navLinks.map((link) => (
 <NavLink
 key={link.path}
 to={link.path}
 onClick={() => setIsOpen(false)}
 className={({ isActive }) => clsx(
 'block px-3 py-2 rounded-md text-base font-medium transition-colors',
 isActive
 ? 'bg-gray-100 text-[var(--color-gold)]'
 : 'text-gray-700 hover:bg-gray-50 '
 )}
 >
 {link.name}
 </NavLink>
 ))}
 <Link
 to="/auth"
 onClick={() => setIsOpen(false)}
 className="block px-3 py-2 mt-2 rounded-md text-base font-medium text-[var(--color-primary)] bg-gray-50 hover:text-[var(--color-gold)] transition-colors"
 >
 {t('auth.login', 'Login')}
 </Link>
 </div>
 </div>
 )}
 </nav>
 );
};

export default Navbar;
