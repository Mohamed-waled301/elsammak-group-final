import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, Search, Users } from 'lucide-react';
import Button from '../../components/Button';
import { downloadAllClientsPDF } from '../../api/admin';
import { fetchUsers } from '../../api/users';

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trainings: any[];
  consultations: any[];
  trainingsCount: number;
  consultationsCount: number;
};

const AdminDashboard = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'trainings_only' | 'consultations_only'>('all');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchUsers();
        const all = res?.data || [];
        if (!cancelled) setUsers(all);
      } catch (e) {
        if (!cancelled) setUsers([]);
        console.error('Failed to load clients summary', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filter]);

  // Auto-sync new users immediately (poll)
  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      try {
        const res = await fetchUsers();
        if (!cancelled) setUsers(res?.data || []);
      } catch {
        // ignore
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = q
      ? users.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').includes(q))
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

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await downloadAllClientsPDF({ search: searchTerm });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_clients_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download PDF', e);
      alert(isRTL ? 'تعذر تحميل ملف PDF' : 'Failed to download PDF');
    } finally {
      setDownloading(false);
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

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-80">
              <Search className="w-5 h-5 text-gray-400 mx-2" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث بالاسم أو الإيميل' : 'Search by name or email'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none outline-none text-sm bg-transparent"
              />
            </div>

            <div className="flex items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm bg-transparent outline-none"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                <option value="trainings_only">{isRTL ? 'التدريبات فقط' : 'Trainings only'}</option>
                <option value="consultations_only">{isRTL ? 'الاستشارات فقط' : 'Consultations only'}</option>
              </select>
            </div>

            <Button
              type="button"
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-[#003B5C] text-white hover:bg-[#002b44] disabled:opacity-60 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isRTL ? 'تحميل PDF' : 'Download PDF'}
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
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right">
                    {isRTL ? 'الاسم' : 'Name'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right">
                    {isRTL ? 'Email' : 'Email'}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rtl:text-right">
                    {isRTL ? 'الهاتف' : 'Phone'}
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003B5C]"></div>
                        {isRTL ? 'جاري التحميل...' : 'Loading clients...'}
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{u.trainingsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{u.consultationsCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link to={`/admin/users/${u.id}`}>
                          <Button type="button" variant="outline" className="py-2">
                            {isRTL ? 'عرض' : 'View'}
                          </Button>
                        </Link>
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
