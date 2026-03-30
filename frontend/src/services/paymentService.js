import api from "./api";

export async function initWebpay(orderId) {
  const { data } = await api.post("/webpay/init/", { order_id: orderId });
  return data;
}

export async function commitWebpay(tokenWs) {
  const { data } = await api.post("/webpay/commit/", { token_ws: tokenWs });
  return data;
}

