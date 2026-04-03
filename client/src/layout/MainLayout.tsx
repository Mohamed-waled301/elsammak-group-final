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
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div
        className={[
          'flex-1 flex flex-col w-full min-w-0 transition-all duration-300',
          isSidebarCollapsed
            ? (isRTL ? 'md:pr-[72px]' : 'md:pl-[72px]')
            : (isRTL ? 'md:pr-64' : 'md:pl-64'),
          'pt-14 md:pt-0',
        ].join(' ')}
      >
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
