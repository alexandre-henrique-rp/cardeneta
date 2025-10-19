/**
 * Service Worker Integrado: PWA + Push Notifications
 *
 * Este arquivo será processado pelo VitePWA (Workbox) e também
 * gerencia push notifications
 */

// Precaching do VitePWA (OBRIGATÓRIO)
// Esta marcação será substituída pelo VitePWA durante o build
const precacheManifest = self.__WB_MANIFEST || [];
console.log('[SW] Precache configurado:', precacheManifest.length, 'arquivos');

// Variável para armazenar a URL da API
const API_URL = self.location.origin.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://api.kingdevtec.com';

/**
 * =====================================================
 * PUSH NOTIFICATIONS HANDLERS
 * =====================================================
 */

/**
 * Evento disparado quando uma notificação push é recebida
 */
self.addEventListener('push', async (event) => {
  console.log('[SW] Push recebido:', event);

  if (!event.data) {
    console.log('[SW] Push sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Dados do push:', data);

    const { title, body, icon, badge, data: customData, notificationId } = data;

    // Opções da notificação
    const options = {
      body: body || 'Nova notificação',
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-192x192.png',
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
    console.error('[SW] Erro ao processar push:', error);
  }
});

/**
 * Marca uma notificação como entregue no backend
 */
async function markAsDelivered(notificationId) {
  try {
    console.log('[SW] Marcando notificação como entregue:', notificationId);

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
      console.log('[SW] Notificação marcada como entregue');
    } else {
      console.error('[SW] Erro ao marcar como entregue:', response.status);
    }
  } catch (error) {
    console.error('[SW] Erro ao marcar notificação como entregue:', error);
  }
}

/**
 * Evento disparado quando o usuário clica na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verifica se já existe uma janela aberta com a URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Verifica se existe alguma janela aberta do app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => client.navigate(urlToOpen));
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
  console.log('[SW] Notificação fechada:', event.notification.tag);
});

/**
 * =====================================================
 * PWA LIFECYCLE EVENTS
 * =====================================================
 */

/**
 * Evento de instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');

  // Precache dos assets estáticos
  const cachePromise = precacheManifest.length > 0
    ? caches.open('pwa-cache-v1').then((cache) => {
        console.log('[SW] Precaching', precacheManifest.length, 'arquivos');
        return cache.addAll(precacheManifest.map(entry => entry.url || entry));
      })
    : Promise.resolve();

  event.waitUntil(cachePromise.then(() => {
    // skipWaiting força a ativação imediata do novo SW
    return self.skipWaiting();
  }));
});

/**
 * Evento de ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  // Limpa caches antigos se houver
  event.waitUntil(
    Promise.all([
      // Toma controle de todos os clientes imediatamente
      clients.claim(),
      // Limpa caches antigos (se usar Workbox, ele gerencia isso)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Mantém apenas caches que começam com o prefixo esperado
              return cacheName.startsWith('workbox-') ||
                     cacheName.startsWith('pwa-') ||
                     cacheName.startsWith('caderneta-');
            })
            .map((cacheName) => {
              console.log('[SW] Mantendo cache:', cacheName);
            })
        );
      })
    ])
  );
});

console.log('[SW] Carregado - PWA + Push Notifications ativo');
