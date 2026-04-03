import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import {
  fetchClientDetails,
  buildClientPdfBlob,
  downloadClientJsonPayload,
  type AdminClientDetailPayload,
} from '../../api/admin';

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [data, setData] = useState<AdminClientDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetchClientDetails(id);
        setData(res?.data || null);
      } catch (e) {
        console.error('Failed to load client details', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownloadJSON = () => {
    if (!id || !data) return;
    downloadClientJsonPayload(data, id);
    toast.success(isRTL ? 'تم تنزيل JSON' : 'JSON downloaded');
  };

  const handleDownloadPDF = async () => {
    if (!id || !data) return;
    setDownloading(true);
    try {
      const blob = buildClientPdfBlob(data);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `client_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      toast.error(isRTL ? 'تعذر تحميل ملف PDF ❌' : 'Failed to download PDF ❌');
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{isRTL ? 'العميل غير موجود' : 'Client not found'}</h2>
        <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
          {isRTL ? 'عودة' : 'Back'}
        </Button>
      </div>
    );
  }

  const user = data.user;
  const qrCode = data.qrCode || null;
  const trainings = data.trainings || [];
  const consultations = data.consultations || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-[#003B5C] transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {isRTL ? 'عودة للوحة' : 'Back to dashboard'}
          </button>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              type="button"
              onClick={handleDownloadJSON}
              variant="outline"
              className="border-[#003B5C] text-[#003B5C]"
            >
              {isRTL ? 'تنزيل JSON' : 'Download JSON'}
            </Button>
            <Button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-[#003B5C] text-white hover:bg-[#002b44] disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isRTL ? 'تحميل PDF' : 'Download PDF'}
              </span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name || '-'}</h1>
              <p className="text-gray-600 mt-2">{user?.email || '-'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{user?.phone || '-'}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">{isRTL ? 'الرقم القومي' : 'National ID'}: </span>
                  {user?.nationalId || '-'}
                </div>
                <div>
                  <span className="text-gray-500">{isRTL ? 'المحافظة / المنطقة' : 'Governorate / District'}: </span>
                  {[user?.governorate, user?.city].filter(Boolean).join(', ') || '-'}
                </div>
                <div>
                  <span className="text-gray-500">{isRTL ? 'تاريخ التسجيل' : 'Registered'}: </span>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
                </div>
                <div>
                  <span className="text-gray-500">{isRTL ? 'البريد مُفعّل' : 'Email verified'}: </span>
                  {user?.emailVerified ? (isRTL ? 'نعم' : 'Yes') : isRTL ? 'لا' : 'No'}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-gray-100">
                  <div className="text-sm font-bold text-[#003B5C] mb-2">
                    {isRTL ? 'التدريبات' : 'Trainings'}
                  </div>
                  {trainings.length === 0 ? (
                    <div className="text-sm text-gray-600">{isRTL ? 'لا يوجد' : 'None'}</div>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                      {trainings.slice(0, 8).map((t, idx) => (
                        <li key={`${t._id || idx}`}>
                          • {String(t.course ?? '-')} — {String(t.bookingDate ?? '-')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 rounded-lg border border-gray-100">
                  <div className="text-sm font-bold text-[#003B5C] mb-2">
                    {isRTL ? 'الاستشارات' : 'Consultations'}
                  </div>
                  {consultations.length === 0 ? (
                    <div className="text-sm text-gray-600">{isRTL ? 'لا يوجد' : 'None'}</div>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                      {consultations.slice(0, 8).map((c, idx) => (
                        <li key={`${c._id || idx}`}>• {c.serviceType} - {c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '-'}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-64">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm font-bold text-[#003B5C] mb-3">
                  {isRTL ? 'QR' : 'QR'}
                </div>
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Client QR"
                    className="w-full h-auto rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <div className="text-sm text-gray-600">{isRTL ? 'غير متوفر' : 'Unavailable'}</div>
                )}
                <div className="mt-2 text-xs text-gray-500 break-all">{data.qrValue || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;

