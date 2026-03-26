import { apiClient } from './client';

export const submitTrainingBooking = async (bookingData: any) => {
  const payload = {
    name: bookingData?.name,
    email: bookingData?.email,
    phone: bookingData?.phone,
    course: bookingData?.course,
    bookingDate: bookingData?.bookingDate,
    governorate: bookingData?.governorate,
    city: bookingData?.city,
  };

  const res = await apiClient.post('/api/bookings/training', payload);
  return res.data;
};
