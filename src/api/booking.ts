import { apiClient } from './client';

export const submitBooking = async (bookingData: any) => {
  const payload = {
    name: bookingData?.name,
    email: bookingData?.email,
    phone: bookingData?.phone,
    serviceType: bookingData?.serviceType,
    bookingDate: bookingData?.bookingDate,
    notes: bookingData?.notes,
    governorate: bookingData?.governorate,
    city: bookingData?.city,
  };

  const res = await apiClient.post('/api/bookings/consultation', payload);
  return res.data;
};
