import axios from 'axios';

const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;
const baseUrl = 'https://api.duffel.com/air';

export async function duffelSearchFlights(params: Record<string, any>) {
  const { data } = await axios.get(`${baseUrl}/offers`, {
    params,
    headers: { Authorization: `Bearer ${DUFFEL_API_KEY}` },
  });
  return data;
}
