import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Footer from './Footer';
import FloatingChat from '../components/common/FloatingChat';

interface MainLayoutProps {
 children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
 const { i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

 return (
 <div className="flex min-h-screen bg-gray-50 transition-colors duration-200">
 <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
 <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ${isSidebarCollapsed ? (isRTL ? 'md:pr-20' : 'md:pl-20') : (isRTL ? 'md:pr-72' : 'md:pl-72')} pt-16 md:pt-0`}>
 <main className="flex-grow flex flex-col">
 {children}
 </main>
 <Footer />
 </div>
 <FloatingChat />
 </div>
 );
};

export default MainLayout;
