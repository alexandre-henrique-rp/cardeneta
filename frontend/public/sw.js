/**
 * Service Worker customizado para gerenciar notificações push e cache
 * Este arquivo gerencia cache e notificações push
 */

// Workbox precache - será injetado pelo Vite PWA
self.__WB_MANIFEST;

/**
 * Evento de push - recebe notificações do servidor
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recebido:', event);

  let notificationData = {
    title: 'Cardeneta App',
    body: 'Nova notificação',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: '/',
    },
  };

  // Tentar extrair dados da notificação
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
      };
    } catch (error) {
      console.error('[Service Worker] Erro ao parsear dados da notificação:', error);
      notificationData.body = event.data.text();
    }
  }

  // Mostrar notificação
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Abrir',
        },
        {
          action: 'close',
          title: 'Fechar',
        },
      ],
    }
  );

  event.waitUntil(promiseChain);
});

/**
 * Evento de clique na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada:', event);

  event.notification.close();

  // Se a ação for 'close', apenas fechar a notificação
  if (event.action === 'close') {
    return;
  }

  // Obter URL de redirecionamento dos dados da notificação
  const urlToOpen = event.notification.data?.url || '/';

  // Abrir ou focar na janela do app
  const promiseChain = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Verificar se já existe uma janela aberta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Se não houver janela aberta, abrir uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});

/**
 * Evento de fechamento da notificação
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificação fechada:', event);
});
