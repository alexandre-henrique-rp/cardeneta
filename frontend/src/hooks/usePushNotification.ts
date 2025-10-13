import axios from "axios";
import { useEffect, useState } from "react";

/**
 * Interface para os dados de subscrição
 */
interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

/**
 * Hook customizado para gerenciar notificações push
 * Fornece funcionalidades para solicitar permissão, registrar subscrição e verificar suporte
 */
export const usePushNotification = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  /**
   * Verifica se o navegador suporta notificações push
   */
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  /**
   * Verifica se o usuário já está inscrito para notificações
   */
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error("Erro ao verificar subscrição:", err);
      }
    };

    checkSubscription();
  }, [isSupported]);

  /**
   * Converte uma chave VAPID de base64 para Uint8Array
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  /**
   * Solicita permissão para enviar notificações
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Notificações push não são suportadas neste navegador");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (err) {
      console.error("Erro ao solicitar permissão:", err);
      setError("Erro ao solicitar permissão para notificações");
      return false;
    }
  };

  /**
   * Registra a subscrição de push notification no servidor
   */
  const subscribe = async (): Promise<boolean> => {
    console.log("🔔 [usePushNotification] Iniciando processo de subscrição...");

    if (!isSupported) {
      console.error("❌ [usePushNotification] Notificações não suportadas");
      setError("Notificações push não são suportadas neste navegador");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Solicitar permissão se ainda não foi concedida
      if (permission !== "granted") {
        console.log("🔐 [usePushNotification] Solicitando permissão...");
        const granted = await requestPermission();
        if (!granted) {
          console.error("❌ [usePushNotification] Permissão negada");
          setError("Permissão para notificações negada");
          setIsLoading(false);
          return false;
        }
        console.log("✅ [usePushNotification] Permissão concedida!");
      }

      // Obter chave pública VAPID do servidor
      console.log("🔑 [usePushNotification] Obtendo chave VAPID do servidor...");
      const token = localStorage.getItem("token");
      const vapidResponse = await axios.get(
        `${API_URL}/push-notification/vapid-public-key`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const vapidPublicKey = vapidResponse.data.publicKey;
      console.log("✅ [usePushNotification] Chave VAPID recebida:", vapidPublicKey);

      // Registrar service worker
      console.log("⚙️ [usePushNotification] Aguardando service worker...");
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ [usePushNotification] Service worker ativo:", registration);

      // Criar subscrição
      console.log("📝 [usePushNotification] Criando subscrição push...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });
      console.log("✅ [usePushNotification] Subscrição criada:", subscription);

      // Extrair dados da subscrição
      const subscriptionJson = subscription.toJSON();
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || "",
        auth: subscriptionJson.keys?.auth || "",
        userAgent: navigator.userAgent,
      };
      console.log("📦 [usePushNotification] Dados da subscrição:", subscriptionData);

      // Enviar subscrição para o servidor
      console.log("📤 [usePushNotification] Enviando subscrição para o servidor...");
      await axios.post(
        `${API_URL}/push-notification/subscribe`,
        subscriptionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ [usePushNotification] Subscrição registrada no servidor!");

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("❌ [usePushNotification] Erro ao registrar subscrição:", err);
      console.error("❌ [usePushNotification] Detalhes do erro:", err.response?.data);
      setError(err.response?.data?.message || "Erro ao registrar subscrição");
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Remove a subscrição de push notification
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Notificações push não são suportadas neste navegador");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        setIsLoading(false);
        return true;
      }

      // Remover subscrição do servidor
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/push-notification/unsubscribe/${encodeURIComponent(subscription.endpoint)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remover subscrição do navegador
      await subscription.unsubscribe();

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Erro ao remover subscrição:", err);
      setError(err.response?.data?.message || "Erro ao remover subscrição");
      setIsLoading(false);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
};
