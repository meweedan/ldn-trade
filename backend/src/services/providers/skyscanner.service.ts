import axios from 'axios';

const SKYSCANNER_API_KEY = process.env.SKYSCANNER_API_KEY;
const baseUrl = 'https://partners.api.skyscanner.net/apiservices';

export async function skyscannerSearchFlights(params: Record<string, any>) {
  const { data } = await axios.get(`${baseUrl}/v3/flights/live/search/create`, {
    params,
    headers: { 'x-api-key': SKYSCANNER_API_KEY || '' },
  });
  return data;
}
