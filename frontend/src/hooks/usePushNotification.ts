import { useEffect, useState } from "react";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../services/push";

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
    setIsLoading(true);
    setError(null);

    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Erro ao registrar subscrição:", err);
      setError(err.response?.data?.message || "Erro ao registrar subscrição");
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Remove a subscrição de push notification
   */
  const unsubscribe = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await unsubscribeFromPushNotifications();
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
