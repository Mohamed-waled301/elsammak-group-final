import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, FileSpreadsheet, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import {
  downloadAllClientsCsv,
  downloadClientsListPdf,
  fetchClientDetails,
  downloadClientJsonPayload,
} from '../../api/admin';
import { fetchUsers, type AdminUserRow } from '../../api/users';

const AdminDashboard = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'trainings_only' | 'consultations_only'>('all');
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [rowJsonId, setRowJsonId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetchUsers();
    return res?.data || [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const all = await loadUsers();
        if (!cancelled) setUsers(all);
      } catch (e) {
        if (!cancelled) setUsers([]);
        console.error('Failed to load clients summary', e);
        toast.error(
          isRTL ? 'تعذر تحميل العملاء (تحقق من صلاحيات المسؤول)' : 'Failed to load clients (admin session required)'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUsers, isRTL]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const all = await loadUsers();
        setUsers(all);
      } catch {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(id);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = q
      ? users.filter(
          (u) =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q)
        )
      : users;
    if (filter === 'trainings_only') return base.filter((u) => (u.trainingsCount || 0) > 0);
    if (filter === 'consultations_only') return base.filter((u) => (u.consultationsCount || 0) > 0);
    return base;
  }, [users, searchTerm, filter]);

  const filteredLabel = useMemo(() => {
    if (filter === 'trainings_only') return isRTL ? 'التدريبات فقط' : 'Trainings only';
    if (filter === 'consultations_only') return isRTL ? 'الاستشارات فقط' : 'Consultations only';
    return isRTL ? 'الكل' : 'All';
  }, [filter, isRTL]);

  const downloadCsv = async () => {
    setDownloadingCsv(true);
    try {
      await downloadAllClientsCsv();
      toast.success(isRTL ? 'تم تنزيل CSV' : 'CSV downloaded');
    } catch (e) {
      console.error('Failed to download CSV', e);
      toast.error(isRTL ? 'تعذر تحميل CSV' : 'Failed to download CSV');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const downloadPdfList = async () => {
    setDownloadingPdf(true);
    try {
      const blob = downloadClientsListPdf(
        filteredUsers.map((u) => ({
          name: u.name,
          email: u.email,
          phone: u.phone,
          createdAt: u.createdAt,
          trainingsCount: u.trainingsCount,
          consultationsCount: u.consultationsCount,
        })),
        isRTL ? `عملاء (${filteredUsers.length})` : `Clients (${filteredUsers.length})`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_list_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(isRTL ? 'تم تنزيل PDF' : 'PDF downloaded');
    } catch (e) {
      console.error('Failed to download PDF', e);
      toast.error(isRTL ? 'تعذر تحميل ملف PDF' : 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadRowJson = async (id: string) => {
    setRowJsonId(id);
    try {
      const res = await fetchClientDetails(id);
      if (!res.data) {
        toast.error(isRTL ? 'لا توجد بيانات' : 'No data');
        return;
      }
      downloadClientJsonPayload(res.data, id);
      toast.success(isRTL ? 'تم تنزيل JSON' : 'JSON downloaded');
    } catch (e) {
      console.error(e);
      toast.error(isRTL ? 'تعذر التنزيل' : 'Download failed');
    } finally {
      setRowJsonId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-[var(--color-primary)]" />
              {isRTL ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isRTL ? 'إدارة العملاء والحجوزات' : 'Manage clients and bookings'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-wrap">
            <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-80">
              <Search className="w-5 h-5 text-gray-400 mx-2 shrink-0" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث بالاسم أو الإيميل أو الهاتف' : 'Search by name, email, or phone'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none outline-none text-sm bg-transparent"
              />
            </div>

            <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'trainings_only' | 'consultations_only')}
                className="text-sm bg-transparent outline-none"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                <option value="trainings_only">{isRTL ? 'التدريبات فقط' : 'Trainings only'}</option>
                <option value="consultations_only">{isRTL ? 'الاستشارات فقط' : 'Consultations only'}</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={downloadCsv}
              disabled={downloadingCsv}
              className="bg-[#003B5C] text-white hover:bg-[#002b44] disabled:opacity-60 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                {isRTL ? 'تنزيل CSV (الكل)' : 'Download CSV (all)'}
              </span>
            </Button>

            <Button
              type="button"
              onClick={downloadPdfList}
              disabled={downloadingPdf || filteredUsers.length === 0}
              variant="outline"
              className="border-[#003B5C] text-[#003B5C] hover:bg-[#003B5C]/5 disabled:opacity-60 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isRTL ? 'PDF (القائمة الحالية)' : 'PDF (current list)'}
              </span>
            </Button>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-600">
          {isRTL ? `الفئة: ${filteredLabel}` : `Filter: ${filteredLabel}`}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#003B5C] text-white">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right"
                  >
                    {isRTL ? 'الاسم' : 'Name'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right"
                  >
                    {isRTL ? 'الهاتف' : 'Phone'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right"
                  >
                    {isRTL ? 'تاريخ التسجيل' : 'Registered'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? 'التدريبات' : 'Trainings'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? 'الاستشارات' : 'Consultations'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003B5C]"></div>
                        {isRTL ? 'جاري التحميل...' : 'Loading clients...'}
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {isRTL ? 'لا توجد نتائج' : 'No results'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#f0f4f8] text-[#003B5C] rounded-full flex items-center justify-center font-bold text-lg">
                            {(u.name?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[10rem] sm:max-w-xs">
                              {u.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono truncate max-w-[10rem] sm:max-w-xs">
                              {u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {u.trainingsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {u.consultationsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-stretch sm:items-center">
                          <Link to={`/admin/users/${u.id}`}>
                            <Button type="button" variant="outline" className="py-2 w-full sm:w-auto">
                              {isRTL ? 'عرض' : 'View'}
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="outline"
                            className="py-2 w-full sm:w-auto border-[#c5a059] text-[#8b6914]"
                            disabled={rowJsonId === u.id}
                            onClick={() => downloadRowJson(u.id)}
                          >
                            {rowJsonId === u.id
                              ? isRTL
                                ? '…'
                                : '…'
                              : isRTL
                                ? 'JSON'
                                : 'JSON'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
