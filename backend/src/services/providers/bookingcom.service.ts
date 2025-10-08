import axios from 'axios';

const BOOKING_COM_API_KEY = process.env.BOOKING_COM_API_KEY;
const baseUrl = 'https://distribution-xml.booking.com'; // Placeholder; depends on partner program

export async function bookingComSearchHotels(params: Record<string, any>) {
  // Note: Booking.com partner APIs vary; implement correct endpoint/headers per program.
  const { data } = await axios.get(`${baseUrl}/hotels`, {
    params,
    headers: { 'X-API-Key': BOOKING_COM_API_KEY || '' },
  });
  return data;
}
