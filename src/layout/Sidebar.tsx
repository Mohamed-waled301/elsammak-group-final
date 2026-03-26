import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
 Globe, Menu, X, LogOut, Search, Settings, Shield,
 Home, Info, Briefcase, BarChart2, BookOpen, Phone, ChevronRight, ChevronLeft, Building2
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
 const [searchQuery, setSearchQuery] = useState('');
 const location = useLocation();
 const isRTL = i18n.language === 'ar';

 const navLinks = [
 { name: t('nav.home', 'Home'), path: '/', icon: <Home className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.about', 'About'), path: '/about', icon: <Info className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.services', 'Services'), path: '/services', icon: <Briefcase className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.data_analysis', 'Data Analysis'), path: '/data-analysis', icon: <BarChart2 className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.training', 'Training'), path: '/training', icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.organization_structure', 'Organizational Structure'), path: '/organization-structure', icon: <Building2 className="w-5 h-5 flex-shrink-0" /> },
 { name: t('nav.contact', 'Contact'), path: '/contact', icon: <Phone className="w-5 h-5 flex-shrink-0" /> },
 ];

 const adminLinks = user?.role === 'admin'
  ? [{ name: isRTL ? 'ملف المدير' : 'Admin Profile', path: '/admin/profile', icon: <Shield className="w-5 h-5 flex-shrink-0" /> }]
  : [];

 const handleLangToggle = () => {
 changeLanguage(language === 'en' ? 'ar' : 'en');
 };

 const handleSearch = (e: React.FormEvent) => {
   e.preventDefault();
   if (searchQuery.trim()) {
     setIsMobileOpen(false);
     if (!isMobileOpen) {
       setIsCollapsed(true);
     }
     // In a real app we would navigate to a search page or filter data here
     console.log("Searching for:", searchQuery);
     setSearchQuery('');
   }
 };

 // Close mobile sidebar on route change
 useEffect(() => {
  setIsMobileOpen(false);
 }, [location.pathname]);

 const sidebarContent = (
 <div className="flex flex-col h-full overflow-hidden">
 <div className={`flex items-center p-6 h-24 border-b border-gray-100 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
 <Link to="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
 <img
   src="/company-logo.png"
   alt="elsamak Group"
   className={`${isCollapsed ? 'w-9 h-9' : 'w-12 h-12'} object-contain shrink-0`}
 />
 {!isCollapsed && (
 <span className="font-bold text-xl text-[#003B5C] logo-text whitespace-nowrap overflow-hidden transition-all leading-tight">
 {isRTL ? 'مجموعة السماك' : 'elsamak Group'}
 </span>
 )}
 </Link>
 
 {/* Mobile Close */}
 <button className="md:hidden p-2 rounded-full hover:bg-gray-100" onClick={() => setIsMobileOpen(false)}>
 <X className="w-5 h-5 text-gray-500" />
 </button>
 </div>

 {/* Desktop Toggle Button (Only visible on desktop) */}
 <button 
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="hidden md:flex absolute top-8 z-50 bg-white border border-gray-200 text-gray-500 hover:text-[#003B5C] shadow-sm rounded-full p-1"
  style={{ [isRTL ? 'left' : 'right']: '-14px' }}
 >
  {isRTL ? (isCollapsed ? <ChevronLeft className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>) : (isCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>)}
 </button>

 {/* Search Bar */}
 <div className="p-4">
   <form onSubmit={handleSearch} className="relative">
     <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
       <Search className="w-4 h-4 text-gray-400" />
     </div>
     {!isCollapsed && (
       <input 
         type="text"
         className={`w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#003B5C] focus:border-[#003B5C] block pt-2 pb-2 ${isRTL ? 'pr-9' : 'pl-9'}`}
         placeholder={isRTL ? 'بحث...' : 'Search...'}
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
       />
     )}
     {isCollapsed && (
       <button onClick={() => setIsCollapsed(false)} className="w-full flex justify-center py-2 text-gray-400 hover:text-[#003B5C] bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
         <Search className="w-5 h-5 mx-auto" />
       </button>
     )}
   </form>
 </div>

 <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4 hide-scrollbar">
 {navLinks.map((link) => (
 <NavLink
 key={link.path}
 to={link.path}
 className={({ isActive }) => clsx(
 'flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium',
 isActive
 ? 'bg-gradient-to-r from-[#003B5C] to-[#002b44] text-white shadow-md shadow-[#003B5C]/20'
 : 'text-gray-600 hover:bg-gray-50 hover:text-[#c5a059]'
 )}
 title={isCollapsed ? link.name : ''}
 >
 {link.icon}
 {!isCollapsed && <span className="whitespace-nowrap truncate">{link.name}</span>}
 </NavLink>
 ))}

 {adminLinks.length ? (
  <div className="pt-2 mt-2 border-t border-gray-100">
   {adminLinks.map((link) => (
    <NavLink
      key={link.path}
      to={link.path}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium',
        isActive
          ? 'bg-gradient-to-r from-[#003B5C] to-[#002b44] text-white shadow-md shadow-[#003B5C]/20'
          : 'text-gray-600 hover:bg-gray-50 hover:text-[#c5a059]'
      )}
      title={isCollapsed ? link.name : ''}
    >
      {link.icon}
      {!isCollapsed && <span className="whitespace-nowrap truncate">{link.name}</span>}
    </NavLink>
   ))}
  </div>
 ) : null}

 {/* Settings Profile Link */}
 <NavLink
 to="/profile"
 className={({ isActive }) => clsx(
 'flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium border-t border-gray-100 mt-4 pt-4',
 isActive
 ? 'bg-gray-100 text-[#003B5C]'
 : 'text-gray-600 hover:bg-gray-50 hover:text-[#c5a059]'
 )}
 title={isCollapsed ? (isRTL ? 'إعدادات الحساب' : 'My Profile / Settings') : ''}
 >
 <Settings className="w-5 h-5 flex-shrink-0" />
 {!isCollapsed && <span className="whitespace-nowrap truncate">{isRTL ? 'إعدادات الحساب' : 'My Profile / Settings'}</span>}
 </NavLink>
 </nav>

 <div className="p-4 border-t border-gray-100 bg-white z-10">
 <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-start px-2'}`}>
 <button
 onClick={handleLangToggle}
 className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#003B5C] flex items-center gap-2"
 title="Toggle Language"
 >
 <Globe className="w-5 h-5 flex-shrink-0" />
 {!isCollapsed && <span className="text-sm font-bold uppercase">{language}</span>}
 </button>
 </div>

 <div className={`bg-gray-50 rounded-xl transition-all border border-gray-100 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4'}`}>
 <div className="flex items-center gap-3 overflow-hidden">
 {isCollapsed ? (
  <div className="w-8 h-8 rounded-full bg-[#003B5C]/10 flex items-center justify-center text-[#003B5C] font-bold">
    {user?.name?.charAt(0) || 'U'}
  </div>
 ) : (
  <div className="flex items-center gap-3 truncate w-full">
    <div className="w-8 h-8 rounded-full bg-[#003B5C]/10 flex-shrink-0 flex items-center justify-center text-[#003B5C] font-bold">
      {user?.name?.charAt(0) || 'U'}
    </div>
    <div className="flex flex-col truncate w-full">
      <span className="text-sm font-bold text-gray-900 truncate">
        {user?.name || 'User'}
      </span>
      <span className="text-xs text-gray-500 font-medium">{user?.role === 'admin' ? 'Admin' : 'Client'}</span>
    </div>
  </div>
 )}
 </div>
 
 <button
 onClick={logout}
 className={`flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? 'justify-center p-2 mt-0' : 'w-full mt-3 p-2'}`}
 title={isCollapsed ? (isRTL ? 'تسجيل خروج' : 'Logout') : ''}
 >
 <LogOut className="w-4 h-4 flex-shrink-0" />
 {!isCollapsed && <span>{isRTL ? 'تسجيل خروج' : 'Logout'}</span>}
 </button>
 </div>
 </div>
 </div>
 );

 return (
 <>
 {/* Mobile Top Bar */}
 <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
 <Link to="/" className="flex items-center gap-2">
 <img src="/company-logo.png" alt="elsamak Group" className="w-8 h-8 object-contain" />
 <span className="font-bold text-lg text-[#003B5C] ">
 {isRTL ? 'مجموعة السماك' : 'elsamak Group'}
 </span>
 </Link>
 <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 ">
 <Menu className="w-6 h-6" />
 </button>
 </div>

 {/* Mobile Backdrop */}
 {isMobileOpen && (
 <div 
 className="md:hidden fixed inset-0 bg-[#003B5C]/20 backdrop-blur-sm z-40 pointer-events-auto transition-opacity"
 onClick={() => setIsMobileOpen(false)}
 />
 )}

 {/* Sidebar Core */}
 <aside
 className={clsx(
 "fixed top-0 bottom-0 z-50 bg-white border-gray-200 transition-all duration-300 ease-in-out shadow-lg md:shadow-none",
 isRTL ? "right-0 border-l" : "left-0 border-r",
 isMobileOpen 
 ? "translate-x-0 w-72" 
 : isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0",
 isCollapsed ? "md:w-20" : "md:w-72"
 )}
 >
 {sidebarContent}
 </aside>
 </>
 );
};

export default Sidebar;
