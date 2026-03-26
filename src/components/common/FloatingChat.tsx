

import { useTranslation } from 'react-i18next';

const FloatingChat = () => {
 const { i18n } = useTranslation();
 const isRTL = i18n.language === 'ar';

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '201234567890';
  const whatsappText = isRTL ? 'مرحباً! كيف يمكنني مساعدتكم؟' : 'Hello! How can we help you?';
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  const messengerPage = import.meta.env.VITE_MESSENGER_PAGE || 'YOUR_PAGE_NAME';
  const messengerHref = `https://m.me/${messengerPage}`;

 return (
 <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-[60] flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-700`}>
 {/* WhatsApp */}
 <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
 className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 group"
 aria-label="Chat on WhatsApp"
 >
 <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:opacity-40"></div>
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
 <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.402-10.416c-4.417 0-8 3.582-8 8.001 0 1.487.391 2.85 1.07 4.02L1.8 22l4.825-1.267c1.139.637 2.441 1.002 3.829 1.002 4.418 0 8.001-3.582 8.001-8.001s-3.583-8-8.001-8z" />
 </svg>
 </a>

    {/* Messenger */}
    <a
      href={messengerHref}
      target="_blank"
      rel="noopener noreferrer"
      className="relative w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 group"
      aria-label="Chat on Messenger"
    >
      <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 group-hover:opacity-30"></div>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 relative z-10">
        <path d="M12 2C6.477 2 2 6.14 2 11.25c0 2.915 1.5 5.511 3.834 7.182v3.136l3.475-1.921c.854.237 1.761.353 2.691.353 5.523 0 10-4.14 10-9.25S17.523 2 12 2zm1.096 12.388l-2.793-2.981-5.462 2.981 6.004-6.388 2.85 2.981 5.405-2.981-6.004 6.388z" />
      </svg>
    </a>
 </div>
 );
};

export default FloatingChat;
