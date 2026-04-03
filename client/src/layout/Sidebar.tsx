import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Globe, Menu, X, LogOut, Settings, Shield,
  Home, Info, Briefcase, BarChart2, BookOpen, Phone,
  ChevronRight, ChevronLeft, Building2, User
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/', icon: <Home className="w-5 h-5 shrink-0" /> },
    { name: t('nav.about', 'About'), path: '/about', icon: <Info className="w-5 h-5 shrink-0" /> },
    { name: t('nav.services', 'Services'), path: '/services', icon: <Briefcase className="w-5 h-5 shrink-0" /> },
    { name: t('nav.data_analysis', 'Data Analysis'), path: '/data-analysis', icon: <BarChart2 className="w-5 h-5 shrink-0" /> },
    { name: t('nav.training', 'Training'), path: '/training', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { name: t('nav.organization_structure', 'Org Structure'), path: '/organization-structure', icon: <Building2 className="w-5 h-5 shrink-0" /> },
    { name: t('nav.contact', 'Contact'), path: '/contact', icon: <Phone className="w-5 h-5 shrink-0" /> },
  ];

  const adminLinks = user?.role === 'admin'
    ? [{ name: isRTL ? 'ملف المدير' : 'Admin Profile', path: '/admin/profile', icon: <Shield className="w-5 h-5 shrink-0" /> }]
    : [];

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-[72px] border-b border-gray-100 px-4 shrink-0',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img
            src="/company-logo.png"
            alt="Elsamak Group"
            className={clsx('object-contain shrink-0 transition-all', isCollapsed ? 'w-9 h-9' : 'w-10 h-10')}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/favicon.svg';
            }}
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-bold text-[15px] text-[var(--color-primary)] leading-tight truncate">
                {isRTL ? 'مجموعة السماك' : 'Elsamak Group'}
              </div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wide uppercase truncate">
                {isRTL ? 'قانوني • محاسبي • تحليلي' : 'Legal • Accounting • Analytics'}
              </div>
            </div>
          )}
        </Link>
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute top-[26px] z-50 bg-white border border-gray-200 text-gray-400 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 shadow-sm rounded-full p-1 transition-all"
        style={{ [isRTL ? 'left' : 'right']: '-13px' }}
        aria-label="Toggle sidebar"
      >
        {isRTL
          ? (isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)
          : (isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />)
        }
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto hide-scrollbar">
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
            {isRTL ? 'التنقل' : 'Navigation'}
          </p>
        )}
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            title={isCollapsed ? link.name : undefined}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
              isActive
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={clsx('shrink-0 transition-colors', isActive ? 'text-white' : 'text-gray-400 group-hover:text-[var(--color-primary)]')}>
                  {link.icon}
                </span>
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </>
            )}
          </NavLink>
        ))}

        {adminLinks.length > 0 && (
          <>
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-4 pb-2">
                {isRTL ? 'الإدارة' : 'Admin'}
              </p>
            )}
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.name : undefined}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                  isActive
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                )}
              >
                {link.icon}
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div className={clsx('pt-3 mt-3 border-t border-gray-100', isCollapsed && 'flex justify-center')}>
          <NavLink
            to="/profile"
            title={isCollapsed ? (isRTL ? 'الملف الشخصي' : 'Profile') : undefined}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
              isActive
                ? 'bg-gray-100 text-[var(--color-primary)]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]'
            )}
          >
            {({ isActive }) => (
              <>
                <Settings className={clsx('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-[var(--color-primary)]')} />
                {!isCollapsed && <span className="truncate">{isRTL ? 'الملف الشخصي' : 'My Profile'}</span>}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 p-3 space-y-2">
        {/* Language toggle */}
        <button
          onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
          title="Toggle Language"
          className={clsx(
            'flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-colors',
            isCollapsed && 'justify-center'
          )}
        >
          <Globe className="w-4 h-4 shrink-0 text-gray-400" />
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'en' ? 'العربية' : 'English'}
            </span>
          )}
        </button>

        {/* User card */}
        <div className={clsx('bg-gray-50 rounded-xl p-3', isCollapsed && 'flex flex-col items-center gap-2')}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'client'}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={isCollapsed ? (isRTL ? 'تسجيل خروج' : 'Logout') : undefined}
            className={clsx(
              'flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors',
              isCollapsed ? 'justify-center w-full' : 'w-full'
            )}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>{isRTL ? 'تسجيل خروج' : 'Sign Out'}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4 shadow-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/company-logo.png" alt="Elsamak Group" className="w-8 h-8 object-contain" />
          <span className="font-bold text-[15px] text-[var(--color-primary)]">
            {isRTL ? 'مجموعة السماك' : 'Elsamak Group'}
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 z-50 transition-all duration-300 ease-in-out shadow-xl md:shadow-none',
          isRTL ? 'right-0 border-l border-gray-100' : 'left-0 border-r border-gray-100',
          isMobileOpen
            ? 'translate-x-0 w-72'
            : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[72px]' : 'md:w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
