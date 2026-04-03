import { BarChart3, PieChart, LineChart, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';

const DataAnalysis = () => {
 const { t } = useTranslation();

 return (
 <div className="bg-white min-h-screen transition-colors duration-300">
 <div className="bg-gradient-to-br from-[#0B1E36] to-[#1e3a8a] text-white py-24 px-4 text-center transition-colors duration-300">
 <h1 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">{t('data_analysis.title')}</h1>
 <p className="text-xl text-blue-100 max-w-3xl mx-auto font-light drop-shadow-sm">{t('data_analysis.subtitle')}</p>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center">
 <div>
 <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6 transition-colors">{t('data_analysis.harness_title')}</h2>
 <p className="text-gray-600 mb-6 leading-relaxed transition-colors">
 {t('data_analysis.harness_desc1')}
 </p>
 <p className="text-gray-600 leading-relaxed mb-8 transition-colors">
 {t('data_analysis.harness_desc2')}
 </p>
 <div className="flex flex-wrap gap-4 mb-8">
 <span className="px-4 py-2 bg-[#F2C811]/10 text-[#dba210] font-bold rounded-full border border-[#F2C811]/20 hover:bg-[#F2C811]/20 transition-colors cursor-default">Power BI</span>
 <span className="px-4 py-2 bg-[#3776AB]/10 text-[#3776AB] font-bold rounded-full border border-[#3776AB]/20 hover:bg-[#3776AB]/20 transition-colors cursor-default">Python</span>
 <span className="px-4 py-2 bg-[#217346]/10 text-[#217346] font-bold rounded-full border border-[#217346]/20 hover:bg-[#217346]/20 transition-colors cursor-default">Advanced Excel</span>
 </div>
 <Button to="/booking" variant="outline" className="hover:-translate-y-1 shadow-sm">
 {t('data_analysis.consult_btn')}
 </Button>
 </div>
 <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-100 group h-[500px]">
 <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" alt="Corporate Analytics" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
 {[
 { title: t('data_analysis.features.f1_title'), desc: t('data_analysis.features.f1_desc'), icon: <PieChart /> },
 { title: t('data_analysis.features.f2_title'), desc: t('data_analysis.features.f2_desc'), icon: <LineChart /> },
 { title: t('data_analysis.features.f3_title'), desc: t('data_analysis.features.f3_desc'), icon: <BarChart3 /> },
 { title: t('data_analysis.features.f4_title'), desc: t('data_analysis.features.f4_desc'), icon: <Cpu /> }
 ].map((feature, i) => (
 <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:-translate-y-2 hover:shadow-xl hover:border-[var(--color-gold)]/50 transition-all duration-300 group">
 <div className="w-16 h-16 mx-auto bg-white text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-gold)] transition-colors">
 {feature.icon}
 </div>
 <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4 group-hover:text-[var(--color-gold)] transition-colors">{feature.title}</h3>
 <p className="text-gray-500 text-sm leading-relaxed transition-colors">{feature.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default DataAnalysis;
