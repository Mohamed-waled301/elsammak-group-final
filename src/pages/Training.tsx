import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';

const Training = () => {
 const { t } = useTranslation();

 const courses = [
 { title: t('training.courses.c1_title'), category: t('training.courses.c1_cat'), duration: t('training.courses.c1_dur'), date: t('training.courses.c1_start'), location: t('training.courses.c1_fmt') },
 { title: t('training.courses.c2_title'), category: t('training.courses.c2_cat'), duration: t('training.courses.c2_dur'), date: t('training.courses.c2_start'), location: t('training.courses.c2_fmt') },
 { title: t('training.courses.c3_title'), category: t('training.courses.c3_cat'), duration: t('training.courses.c3_dur'), date: t('training.courses.c3_start'), location: t('training.courses.c3_fmt') },
 { title: t('training.courses.c4_title'), category: t('training.courses.c4_cat'), duration: t('training.courses.c4_dur'), date: t('training.courses.c4_start'), location: t('training.courses.c4_fmt') },
 { title: t('training.courses.c5_title'), category: t('training.courses.c5_cat'), duration: t('training.courses.c5_dur'), date: t('training.courses.c5_start'), location: t('training.courses.c5_fmt') },
 { title: t('training.courses.c6_title'), category: t('training.courses.c6_cat'), duration: t('training.courses.c6_dur'), date: t('training.courses.c6_start'), location: t('training.courses.c6_fmt') },
 ];

 return (
 <div className="bg-gray-50 min-h-screen transition-colors duration-300">
 <div className="bg-[var(--color-primary)] text-white py-20 px-4 text-center transition-colors duration-300">
 <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">{t('training.title')}</h1>
 <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-sm">{t('training.subtitle')}</p>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
 <div className="text-center mb-16">
 <h2 className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-widest mb-2">{t('training.programs_label')}</h2>
 <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] transition-colors">{t('training.upcoming_courses')}</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
 {courses.map((course, idx) => (
 <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[var(--color-gold)]/50 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-2">
 <div className="p-8 flex-grow">
 <span className="inline-block px-3 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-bold uppercase tracking-wider rounded-full mb-4 group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-primary)] transition-colors">
 {course.category}
 </span>
 <h4 className="text-xl font-bold text-[var(--color-primary)] mb-6 group-hover:text-[var(--color-gold)] transition-colors">{course.title}</h4>
 
 <div className="space-y-4 text-sm text-gray-500 ">
 <div className="flex items-center">
 <Clock className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
 <span>{t('training.duration')} {course.duration}</span>
 </div>
 <div className="flex items-center">
 <Calendar className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
 <span>{t('training.start')} {course.date}</span>
 </div>
 <div className="flex items-center">
 <MapPin className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
 <span>{t('training.format')} {course.location}</span>
 </div>
 </div>
 </div>
 <div className="p-6 border-t border-gray-100 bg-gray-50 transition-colors">
 <Button to="/training-booking" variant="primary" className="w-full shadow-md group-hover:shadow-[var(--color-primary)]/20 transition-all">
 {t('training.book_seat')}
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default Training;
