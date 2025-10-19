import axios from "axios";

/**
 * Interface para os dados de subscrição
 */
interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Busca a chave pública VAPID do backend
 */
export const getVapidPublicKey = async (): Promise<string> => {
  const response = await axios.get(`${API_URL}/push-notifications/vapid-public-key`);
  return response.data.publicKey;
};

/**
 * Converte a chave VAPID base64 para Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Registra a subscrição de push notification no servidor
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription> => {
  // Busca a chave VAPID do backend
  const vapidPublicKey = await getVapidPublicKey();

  // Aguarda o service worker estar pronto
  const registration = await navigator.serviceWorker.ready;

  // Cria a subscrição no navegador
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Prepara os dados para enviar ao backend
  const subscriptionData: PushSubscriptionData = {
    endpoint: subscription.endpoint,
    p256dh: subscription.toJSON().keys?.p256dh || "",
    auth: subscription.toJSON().keys?.auth || "",
    userAgent: navigator.userAgent,
  };

  // Envia a subscrição para o backend
  const token = localStorage.getItem("token");
  await axios.post(`${API_URL}/push-notifications/subscriptions`, subscriptionData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return subscription;
};

/**
 * Remove a subscrição de push notification
 */
export const unsubscribeFromPushNotifications = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  // Busca o subscriptionId no localStorage (salvo durante o subscribe)
  const subscriptionId = localStorage.getItem("pushSubscriptionId");

  if (subscriptionId) {
    const token = localStorage.getItem("token");
    await axios.delete(
      `${API_URL}/push-notifications/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Remove a subscrição do navegador
  await subscription.unsubscribe();
  localStorage.removeItem("pushSubscriptionId");
};
