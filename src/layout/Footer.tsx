import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
 const { t } = useTranslation();

 return (
 <footer className="bg-white border-t border-gray-200 transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
 {/* Company Info */}
 <div className="col-span-1 md:col-span-1">
 <Link to="/" className="text-xl font-bold tracking-tighter text-[var(--color-primary)] flex items-center gap-2 mb-4">
 <img src="/favicon.svg" alt="elsamak Group" className="w-7 h-7 shrink-0" />
 elsamak Group
 </Link>
 <p className="text-sm text-gray-500 mb-6">
 {t('footer.tagline')}
 </p>
 <div className="flex space-x-4 rtl:space-x-reverse font-medium text-sm">
 <a href="#" className="text-gray-400 hover:text-[var(--color-gold)] transition-colors">FB</a>
 <a href="#" className="text-gray-400 hover:text-[var(--color-gold)] transition-colors">TW</a>
 <a href="#" className="text-gray-400 hover:text-[var(--color-gold)] transition-colors">IN</a>
 <a href="#" className="text-gray-400 hover:text-[var(--color-gold)] transition-colors">IG</a>
 </div>
 </div>

 {/* Quick Links */}
 <div>
 <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
 {t('footer.quick_links')}
 </h3>
 <ul className="space-y-3">
 <li><Link to="/about" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('nav.about')}</Link></li>
 <li><Link to="/services" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('nav.services')}</Link></li>
 <li><Link to="/contact" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('nav.contact')}</Link></li>
 </ul>
 </div>

 {/* Services */}
 <div>
 <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
 {t('footer.services')}
 </h3>
 <ul className="space-y-3">
 <li><Link to="/services" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('servicesItems.legal_consulting')}</Link></li>
 <li><Link to="/services" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('servicesItems.accounting_tax')}</Link></li>
 <li><Link to="/data-analysis" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('nav.data_analysis')}</Link></li>
 <li><Link to="/training" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">{t('nav.training')}</Link></li>
 </ul>
 </div>

 {/* Contact Information */}
 <div>
 <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
 {t('footer.contact')}
 </h3>
 <ul className="space-y-3">
 <li className="flex items-start text-sm text-gray-500 ">
 <MapPin className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-400 shrink-0" />
 <span>{t('contact.office_addr')}</span>
 </li>
 <li className="flex items-center text-sm text-gray-500 ">
 <Phone className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-400 shrink-0" />
 <span>{t('footer.phone_value')}</span>
 </li>
 <li className="flex items-center text-sm text-gray-500 ">
 <Mail className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-400 shrink-0" />
 <span>{t('footer.email_value')}</span>
 </li>
 </ul>
 </div>
 </div>
 <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 ">
 <p>&copy; {new Date().getFullYear()} elsamak Group. {t('footer.rights')}</p>
 <div className="flex space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
 <a href="#" className="hover:text-gray-900 transition-colors">{t('footer.privacy')}</a>
 <a href="#" className="hover:text-gray-900 transition-colors">{t('footer.terms')}</a>
 </div>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
