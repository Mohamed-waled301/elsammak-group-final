export const coursesData = [
 { id: 1, title: 'Advanced Digital Accounting', category: 'Finance', duration: '4 Weeks', date: 'Next month', location: 'Online/On-site' },
 { id: 2, title: 'Corporate Contract Drafting', category: 'Legal', duration: '2 Weeks', date: 'Rolling basis', location: 'On-site' },
 { id: 3, title: 'Data Analysis Bootcamp', category: 'Technology', duration: '8 Weeks', date: 'Q3 2026', location: 'Online' },
 { id: 4, title: 'Digital Transformation Compliance', category: 'Management', duration: '3 Days', date: 'Upcoming', location: 'Seminar' },
];

export const mockSubmitContact = async (data: unknown) => {
 return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: "Message sent", data }), 1000));
};

export const fetchCourses = async () => {
 return new Promise((resolve) => setTimeout(() => resolve(coursesData), 1000));
};
