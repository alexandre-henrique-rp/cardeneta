/**
 * Service Worker para Push Notifications
 * Gerencia notificações push usando web-push padrão
 */

// Variável para armazenar a URL da API
const API_URL = self.location.origin.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://api.kingdevtec.com';

/**
 * Evento disparado quando uma notificação push é recebida
 */
self.addEventListener('push', async (event) => {
  console.log('[Service Worker] Push recebido:', event);

  if (!event.data) {
    console.log('[Service Worker] Push sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[Service Worker] Dados do push:', data);

    const { title, body, icon, badge, data: customData, notificationId } = data;

    // Opções da notificação
    const options = {
      body: body || 'Nova notificação',
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      data: {
        ...customData,
        notificationId,
        url: customData?.url || '/',
      },
      vibrate: [200, 100, 200],
      tag: notificationId || `notification-${Date.now()}`,
      requireInteraction: false,
      actions: customData?.actions || []
    };

    // Exibe a notificação
    event.waitUntil(
      self.registration.showNotification(title || 'Notificação', options).then(() => {
        // Marca a notificação como entregue no backend
        if (notificationId) {
          return markAsDelivered(notificationId);
        }
      })
    );
  } catch (error) {
    console.error('[Service Worker] Erro ao processar push:', error);
  }
});

/**
 * Marca uma notificação como entregue no backend
 */
async function markAsDelivered(notificationId) {
  try {
    console.log('[Service Worker] Marcando notificação como entregue:', notificationId);

    const response = await fetch(
      `${API_URL}/push-notifications/notifications/${notificationId}/delivered`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      console.log('[Service Worker] Notificação marcada como entregue');
    } else {
      console.error('[Service Worker] Erro ao marcar como entregue:', response.status);
    }
  } catch (error) {
    console.error('[Service Worker] Erro ao marcar notificação como entregue:', error);
  }
}

/**
 * Evento disparado quando o usuário clica na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verifica se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não existe, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Evento disparado quando a notificação é fechada
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificação fechada:', event.notification.tag);
});

/**
 * Evento de instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  self.skipWaiting();
});

/**
 * Evento de ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(clients.claim());
});

console.log('[Service Worker] Carregado e pronto para receber push notifications');
