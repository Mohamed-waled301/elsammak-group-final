import { jsPDF } from 'jspdf';
import { adminApiFetch } from './adminFetch';

export type AdminClientDetailPayload = {
  user: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
    phone?: string;
    nationalId?: string;
    governorate?: string;
    city?: string;
    emailVerified?: boolean;
    role?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  trainings?: Array<Record<string, unknown>>;
  consultations?: Array<Record<string, unknown>>;
  qrCode?: string | null;
  qrValue?: string | null;
};

export async function fetchClientDetails(
  id: string
): Promise<{ success: boolean; data: AdminClientDetailPayload | null }> {
  const res = await adminApiFetch(`/clients/${encodeURIComponent(id)}`);
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: AdminClientDetailPayload;
    message?: string;
  };
  if (!res.ok || !json.data) {
    return { success: false, data: null };
  }
  return { success: true, data: json.data };
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadClientJsonPayload(data: AdminClientDetailPayload, id: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerBlobDownload(blob, `client_${id}.json`);
}

export function buildClientPdfBlob(data: AdminClientDetailPayload): Blob {
  const doc = new jsPDF();
  const u = data.user;
  let y = 16;
  doc.setFontSize(16);
  doc.text('Client record', 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines: string[] = [
    `Name: ${u.name || '-'}`,
    `Email: ${u.email || '-'}`,
    `Phone: ${u.phone || '-'}`,
    `National ID: ${u.nationalId || '-'}`,
    `Governorate: ${u.governorate || '-'}`,
    `City: ${u.city || '-'}`,
    `Email verified: ${u.emailVerified ? 'Yes' : 'No'}`,
    `Registered: ${u.createdAt ? new Date(u.createdAt).toISOString() : '-'}`,
    `Trainings: ${data.trainings?.length ?? 0}`,
    `Consultations: ${data.consultations?.length ?? 0}`,
  ];
  for (const line of lines) {
    doc.text(line, 14, y);
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 16;
    }
  }
  if (data.trainings?.length) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Training bookings', 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    for (const t of data.trainings.slice(0, 15)) {
      const course = String(t.course ?? '-');
      const when = String(t.bookingDate ?? '-');
      doc.text(`• ${course} — ${when}`, 14, y);
      y += 5;
      if (y > 270) {
        doc.addPage();
        y = 16;
      }
    }
  }
  return doc.output('blob');
}

export async function downloadClientPDF(id: string) {
  const res = await fetchClientDetails(id);
  if (!res.data) throw new Error('Client not found');
  return buildClientPdfBlob(res.data);
}

export async function downloadAllClientsCsv(): Promise<void> {
  const res = await adminApiFetch('/clients/export/csv');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Export failed (${res.status})`);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
  let filename = `clients_${new Date().toISOString().slice(0, 10)}.csv`;
  if (cd) {
    const m = /filename="?([^";]+)"?/i.exec(cd);
    if (m?.[1]) filename = m[1];
  }
  triggerBlobDownload(blob, filename);
}

type ListRow = {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string | null;
  trainingsCount: number;
  consultationsCount: number;
};

export function downloadClientsListPdf(rows: ListRow[], title: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(12);
  doc.text(title, 14, 14);
  doc.setFontSize(9);
  let y = 24;
  const headers = ['Name', 'Email', 'Phone', 'Registered', 'Trainings', 'Consultations'];
  doc.setFont('helvetica', 'bold');
  doc.text(headers.join('  |  '), 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  for (const r of rows) {
    const reg = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '-';
    const line = `${(r.name || '-').slice(0, 28)}  |  ${(r.email || '-').slice(0, 32)}  |  ${(r.phone || '-').slice(0, 14)}  |  ${reg}  |  ${r.trainingsCount}  |  ${r.consultationsCount}`;
    doc.text(line, 14, y);
    y += 5;
    if (y > 190) {
      doc.addPage();
      y = 14;
    }
  }
  return doc.output('blob');
}

export async function updateAdminProfile(_payload: { name?: string; email?: string; password?: string }) {
  return { success: true, message: 'Admin profile update is not implemented on the server yet.' };
}
