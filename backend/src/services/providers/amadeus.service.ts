import axios from 'axios';

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_ENV = process.env.AMADEUS_ENV || 'test'; // 'test' or 'prod'

const baseUrl = AMADEUS_ENV === 'prod' ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AMADEUS_CLIENT_ID || '',
    client_secret: AMADEUS_CLIENT_SECRET || '',
  });
  const { data } = await axios.post(`${baseUrl}/v1/security/oauth2/token`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

export async function amadeusSearchFlights(params: Record<string, any>) {
  const token = await getToken();
  const { data } = await axios.get(`${baseUrl}/v2/shopping/flight-offers`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function amadeusCreateOrder(payload: any) {
  const token = await getToken();
  const { data } = await axios.post(`${baseUrl}/v1/booking/flight-orders`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function amadeusGetBoardingPass(orderId: string) {
  // Placeholder: Amadeus provides boarding pass via separate endpoints or using BCBP from order/PNR info.
  // Implement actual call and mapping to BoardingPass format.
  return { orderId, message: 'Boarding pass retrieval not implemented yet' };
}
