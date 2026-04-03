import { useTranslation } from 'react-i18next';
import { ArrowRight, Scale, Calculator, ShieldCheck, BarChart3, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Button from '../components/Button';
import OrganizationalTree from '../components/OrganizationalTree';

const fadeUp: Variants = {
 hidden: { opacity: 0, y: 40 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer: Variants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.2 }
 }
};

const Home = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 const services = [
 { icon: <Scale className="w-8 h-8" />, title: t('servicesItems.legal_consulting'), desc: t('servicesItems.legal_consulting_desc'), link: '/services' },
 { icon: <Calculator className="w-8 h-8" />, title: t('servicesItems.accounting_tax'), desc: t('servicesItems.accounting_tax_desc'), link: '/services' },
 { icon: <ShieldCheck className="w-8 h-8" />, title: t('servicesItems.risk_compliance'), desc: t('servicesItems.risk_compliance_desc'), link: '/services' },
 { icon: <BarChart3 className="w-8 h-8" />, title: t('servicesItems.data_analysis'), desc: t('servicesItems.data_analysis_desc'), link: '/data-analysis' },
 { icon: <GraduationCap className="w-8 h-8" />, title: t('servicesItems.training'), desc: t('servicesItems.training_desc'), link: '/training' },
 ];

 return (
 <div className="flex flex-col min-h-screen bg-gray-50 transition-colors duration-300">
 {/* Hero Section */}
 <section className="relative bg-[var(--color-primary)] text-white overflow-hidden py-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
 <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80')] bg-cover bg-center" />
 <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-transparent z-0" />
 
 <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-start rtl:items-start 2xl:items-center">
 <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl rtl:text-right">
 <motion.div variants={fadeUp} className="mb-4">
   <span className="inline-flex items-center gap-3 rounded-full bg-white/10 border border-white/15 px-5 py-2 text-sm font-semibold tracking-wide">
     <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] shadow-[0_0_12px_rgba(197,160,89,0.65)]"></span>
     <span className="text-gray-100">{t('home.tagline', 'Legal • Accounting • Analytics')}</span>
   </span>
 </motion.div>
 <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black mb-4 leading-tight drop-shadow-lg brand-glow text-[var(--color-gold)]">
   {t('home.brand_name')}
 </motion.h1>
 <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-extrabold mb-6 leading-tight text-white/95">
   {t('hero.title')}
 </motion.h2>
 <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light drop-shadow-md">
 {t('hero.subtitle')}
 </motion.p>
 <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
 <Button to="/booking" size="lg" variant="secondary" className="shadow-lg shadow-[var(--color-gold)]/20 hover:-translate-y-1">
 {t('hero.cta')}
 </Button>
 <Button
 to="/about"
 size="lg"
 variant="outline"
 className="border-2 border-white/90 text-white bg-white/10 backdrop-blur-sm hover:bg-[#002a42] hover:text-white hover:border-white/80 hover:shadow-lg hover:-translate-y-1 focus:ring-white/50"
 >
 {t('common.learn_more')}
 </Button>
 </motion.div>
 </motion.div>
 </div>
 </section>

{/* Organization Structure (under Hero) */}
<OrganizationalTree />

 {/* About Preview */}
 <section className="py-24 bg-white transition-colors duration-300 overflow-hidden">
 <motion.div 
 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left rtl:text-right"
 >
 <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{t('home.about_title')}</h2>
 <p className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-8 max-w-4xl leading-relaxed">
 {t('home.about_desc')}
 </p>
 <div className="w-24 h-1 bg-[var(--color-gold)] mb-8 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] rtl:ml-auto"></div>
 </motion.div>
 </section>

 {/* Services Overview */}
 <section className="py-24 bg-gray-50 transition-colors duration-300">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-left rtl:text-right mb-16">
 <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{t('home.capabilities_title')}</h2>
 <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] ">{t('home.capabilities_subtitle')}</h3>
 </motion.div>
 <motion.div 
 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
 >
 {services.map((service, idx) => (
 <motion.div 
 variants={fadeUp}
 key={idx} 
 onClick={() => navigate(service.link)}
 className="bg-white p-8 flex flex-col items-start border border-gray-100 hover:border-[var(--color-gold)] rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer text-left rtl:text-right"
 >
 <div className="bg-[var(--bg-color)] p-4 rounded-lg text-[var(--color-primary)] mb-6 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-gold)] transition-colors ">
 {service.icon}
 </div>
 <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[var(--color-gold)] transition-colors">{service.title}</h4>
 <p className="text-gray-600 mb-6 flex-grow leading-relaxed">{service.desc}</p>
 <div className="mt-auto text-[var(--color-gold)] font-medium flex items-center group-hover:text-[var(--color-primary)] transition-colors">
 {t('common.read_more')} <ArrowRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
 </div>
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* Why Choose Us */}
 <section className="py-24 bg-[var(--color-primary)] text-white transition-colors duration-300 overflow-hidden">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-left rtl:text-right">
 <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{t('home.why_choose_us')}</h2>
 <h3 className="text-3xl md:text-4xl font-bold mb-6">{t('home.commitment_title')}</h3>
 <p className="text-gray-300 mb-8 leading-relaxed">
 {t('home.commitment_desc')}
 </p>
 <ul className="space-y-4">
 {[t('home.values.v1'), t('home.values.v2'), t('home.values.v3'), t('home.values.v4')].map((item) => (
 <li key={item} className="flex items-center text-lg hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform">
 <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] mr-3 rtl:ml-3 rtl:mr-0 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
 {item}
 </li>
 ))}
 </ul>
 </motion.div>
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } } }} className="relative group mx-auto w-full max-w-md md:max-w-full">
 <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
 <img src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&q=80" alt="Legal Consultation" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 <div className="absolute inset-0 bg-[var(--color-primary)]/10 group-hover:opacity-0 transition-opacity duration-300"></div>
 </div>
 <div className="absolute -bottom-8 -right-8 rtl:-left-8 rtl:right-auto bg-[var(--color-gold)] text-[var(--color-primary)] p-8 rounded-2xl shadow-xl max-w-[280px] hidden sm:flex items-center justify-center transform group-hover:-translate-y-2 transition-transform duration-500 text-center">
 <p className="font-bold text-lg leading-snug">{t('home.distinguished')}</p>
 </div>
 </motion.div>
 </div>
 </div>
 </section>

 {/* CTA Section */}
 <section className="py-24 bg-white text-left rtl:text-right border-b border-gray-100 transition-colors duration-300">
 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="max-w-3xl">
 <h2 className="text-3xl md:text-5xl font-black text-[var(--color-primary)] mb-6 drop-shadow-sm">{t('home.cta_title')}</h2>
 <p className="text-xl text-gray-500 mb-10">{t('home.cta_desc')}</p>
 <Button to="/booking" size="lg" variant="primary" className="shadow-lg hover:-translate-y-1">
 {t('common.book_consultation')}
 </Button>
 </div>
 </motion.div>
 </section>
 </div>
 );
};

export default Home;
