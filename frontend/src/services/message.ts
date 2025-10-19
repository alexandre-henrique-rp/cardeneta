import { toast } from "sonner";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "./push";

/**
 * Ativa ou desativa notificações push
 * @param checked - true para ativar, false para desativar
 */
export const togglePushNotifications = async (checked: boolean): Promise<void> => {
  if (checked) {
    try {
      // Verifica se o navegador suporta notificações
      if (!("Notification" in window)) {
        toast.error("Este navegador não suporta notificações");
        return;
      }

      // Verifica se está em HTTPS (exceto localhost)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        toast.error("Push Notifications requerem HTTPS");
        console.error("Push Notifications só funcionam em HTTPS");
        return;
      }

      // Solicita permissão ao usuário
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Registra a subscrição no backend
        await subscribeToPushNotifications();

        toast.success("Notificações ativadas com sucesso!");
        console.log("Push Notifications ativadas");
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
    try {
      // Desativa as notificações
      await unsubscribeFromPushNotifications();
      toast.success("Notificações desativadas");
    } catch (error) {
      console.error("Erro ao desativar notificações:", error);
      toast.error("Erro ao desativar notificações");
    }
  }
};