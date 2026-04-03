/** Static demo data — no network calls. */

export const coursesData = [
  { id: 1, title: 'Advanced Digital Accounting', category: 'Finance', duration: '4 Weeks', date: 'Next month', location: 'Online/On-site' },
  { id: 2, title: 'Corporate Contract Drafting', category: 'Legal', duration: '2 Weeks', date: 'Rolling basis', location: 'On-site' },
  { id: 3, title: 'Data Analysis Bootcamp', category: 'Technology', duration: '8 Weeks', date: 'Q3 2026', location: 'Online' },
  { id: 4, title: 'Digital Transformation Compliance', category: 'Management', duration: '3 Days', date: 'Upcoming', location: 'Seminar' },
];

export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const demoTrainings = [
  { _id: 't1', course: 'Corporate Contract Drafting', startDate: '2026-04-01', schedule: 'Weekends' },
];

const demoConsultations = [
  { _id: 'c1', serviceType: 'Legal', notes: 'Demo consultation', createdAt: '2026-03-01T10:00:00.000Z' },
];

export type MockAdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  trainings: typeof demoTrainings;
  consultations: typeof demoConsultations;
  trainingsCount: number;
  consultationsCount: number;
};

const MOCK_ADMIN_USERS: MockAdminUserRow[] = [
  {
    id: 'demo-client-1',
    name: 'Sara El-Sammak',
    email: 'sara.demo@elsammak.local',
    phone: '+20 100 000 0001',
    trainings: demoTrainings,
    consultations: demoConsultations,
    trainingsCount: 1,
    consultationsCount: 1,
  },
  {
    id: 'demo-client-2',
    name: 'Omar Hassan',
    email: 'omar.demo@elsammak.local',
    phone: '+20 100 000 0002',
    trainings: [],
    consultations: demoConsultations,
    trainingsCount: 0,
    consultationsCount: 1,
  },
];

export function getMockAdminUsers(): MockAdminUserRow[] {
  return MOCK_ADMIN_USERS;
}

export function getMockClientDetail(id: string) {
  const row = MOCK_ADMIN_USERS.find((u) => u.id === id);
  if (!row) return null;
  return {
    user: {
      _id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
    },
    trainings: row.trainings,
    consultations: row.consultations,
    qrCode: null as string | null,
    qrValue: `CLIENT-${row.id}`,
  };
}

export { demoTrainings, demoConsultations };
