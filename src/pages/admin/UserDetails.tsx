import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchUserById } from '../../api/users';
import type { UserData } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, User, MapPin, Mail, Phone, CreditCard, Shield, Briefcase } from 'lucide-react';
import Button from '../../components/Button';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        const data = await fetchUserById(id);
        setUser(data);
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !user) return;
    setDownloading(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`User_Profile_${user.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003B5C]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{isRTL ? 'المستخدم غير موجود' : 'User not found'}</h2>
        <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
          {isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
        </Button>
      </div>
    );
  }

  // Mock cases for the demonstration
  const mockCases = [
    { id: 'CASE-2026-01', title: isRTL ? 'استشارة ضريبية' : 'Tax Consultation', status: 'Active', date: '2026-03-10' },
    { id: 'CASE-2025-89', title: isRTL ? 'صياغة عقود' : 'Contract Drafting', status: 'Completed', date: '2025-11-22' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-[#003B5C] transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {isRTL ? 'عودة للوحة القيادة' : 'Back to Dashboard'}
          </button>

          <Button onClick={handleDownloadPDF} disabled={downloading} className="shadow-md">
            {downloading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isRTL ? 'جاري التحميل...' : 'Generating...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isRTL ? 'تحميل كملف PDF' : 'Download PDF'}
              </span>
            )}
          </Button>
        </div>

        {/* PDF Content Area */}
        <div ref={pdfRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden print-area p-8">
          
          {/* Profile Header Block */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-8 mb-8 gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-[#f0f4f8] text-[#003B5C] rounded-full flex items-center justify-center font-black text-4xl shadow-sm border border-gray-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <div className="flex items-center gap-2 text-sm text-[var(--color-gold)] font-semibold bg-[var(--color-gold)]/10 px-3 py-1 rounded-full w-fit">
                  <Shield className="w-4 h-4" />
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center">
              <QRCodeSVG 
                value={`https://elsammak.com/verify/user/${user.id}`} 
                size={96} 
                level="Q"
                includeMargin={false}
                className="mb-2"
              />
              <span className="text-xs font-mono text-gray-500">{user.id}</span>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-lg font-bold text-[#003B5C] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="w-5 h-5" /> 
                {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
              </h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('auth.fullName')}</span>
                  <span className="text-gray-900 font-medium">{user.name}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('auth.nationalId')}</span>
                  <span className="text-gray-900 font-mono flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {user.nationalId || t('common.not_provided', 'Not Provided')}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#003B5C] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Phone className="w-5 h-5" /> 
                {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
              </h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('contact.email')}</span>
                  <span className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{isRTL ? 'رقم الهاتف' : 'Phone'}</span>
                  <span className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                    {user.phone || t('common.not_provided', 'Not Provided')}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{isRTL ? 'محل الإقامة' : 'Location'}</span>
                  <span className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {user.governorate ? `${user.city}, ${user.governorate}` : t('common.not_provided', 'Not Provided')}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Client Cases Table */}
          <div>
            <h3 className="text-lg font-bold text-[#003B5C] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Briefcase className="w-5 h-5" /> 
              {isRTL ? 'الملفات والقضايا النشطة' : 'Active Cases & Files'}
            </h3>
            
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase rtl:text-right">{isRTL ? 'رقم الملف' : 'Case ID'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase rtl:text-right">{isRTL ? 'الوصف' : 'Description'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase rtl:text-right">{isRTL ? 'التاريخ' : 'Date'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase rtl:text-right">{isRTL ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {mockCases.map(c => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#003B5C] font-semibold">{c.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetails;
