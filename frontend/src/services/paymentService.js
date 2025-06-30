import api, { API_URL } from './api';   
import axios from 'axios';

/**
 * Llama a tu endpoint Django /api/webpay/init/
 * @param {number|string} orderId
 * @returns {Promise<{ url: string, token: string }>}
 */

export async function initWebpay(orderId) {
  const { data } = await api.post('/webpay/init/', { order_id: orderId });
  return data;  // { url, token }
}
/**
 * Llama a tu endpoint Django /api/webpay/commit/
 * @param {string} tokenWs
 * @returns {Promise<any>}
 */

export async function commitWebpay(token_ws) {
  const accessToken = localStorage.getItem('access_token');
  const res = await axios.post(
    `${API_URL}/webpay/commit/`,   // 🚩 POST, no PUT
    { token_ws },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}
