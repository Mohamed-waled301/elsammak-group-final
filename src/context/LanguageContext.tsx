/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
 language: string;
 changeLanguage: (lang: string) => void;
 isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
 const { i18n } = useTranslation();
 const language = i18n.language;
 const isRTL = language === 'ar';

 useEffect(() => {
 const root = window.document.documentElement;
 root.dir = isRTL ? 'rtl' : 'ltr';
 root.lang = language;
 }, [language, isRTL]);

 const changeLanguage = (lang: string) => {
 i18n.changeLanguage(lang);
 localStorage.setItem('language', lang);
 };

 return (
 <LanguageContext.Provider value={{ language, changeLanguage, isRTL }}>
 {children}
 </LanguageContext.Provider>
 );
};

export const useLanguage = () => {
 const context = useContext(LanguageContext);
 if (context === undefined) {
 throw new Error('useLanguage must be used within a LanguageProvider');
 }
 return context;
};
