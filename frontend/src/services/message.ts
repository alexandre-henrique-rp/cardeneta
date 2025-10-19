import { getToken } from "firebase/messaging";
import { toast } from "sonner";
import { messaging } from "@/lib/messaging";

export const togglePushNotifications = async (checked: boolean) => {
  if (checked) {
    try {
      if (!("Notification" in window)) {
        toast.error("Este navegador não suporta notificações");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          toast.error(
            "Chave VAPID do Firebase não configurada. Verifique as variáveis de ambiente."
          );
          console.error(
            "VITE_VAPID_PUBLIC_KEY não encontrada. Obtenha no Firebase Console > Cloud Messaging"
          );
          return;
        }

        const token = await getToken(messaging, {
          vapidKey,
        });

        if (token) {
          localStorage.setItem("firebase_token", token);
          toast.success("Notificações ativadas com sucesso!");
          console.log("Token FCM:", token);
        } else {
          toast.error("Não foi possível obter o token de notificação");
        }
      } else if (permission === "denied") {
        toast.error(
          "Permissão de notificação negada. Habilite nas configurações do navegador."
        );
      } else {
        toast.warning("Permissão de notificação não concedida");
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
      toast.error(
        "Erro ao ativar notificações. Verifique o console para mais detalhes."
      );
    }
  } else {
    localStorage.removeItem("firebase_token");
    toast.success("Notificações desativadas");
  }
};