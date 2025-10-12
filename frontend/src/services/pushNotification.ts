/**
 * Serviço de Push Notification
 * Gerencia o registro e cancelamento de subscrições de notificações push
 */

/**
 * Converte uma chave VAPID de base64 para Uint8Array
 * @param base64String - Chave VAPID em formato base64
 * @returns Uint8Array da chave
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Verifica se o navegador suporta notificações push
 * @returns true se suporta, false caso contrário
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Solicita permissão para enviar notificações
 * @returns Promise com o resultado da permissão
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações')
    return 'denied'
  }

  return await Notification.requestPermission()
}

/**
 * Registra uma subscrição de push notification
 * @param vapidPublicKey - Chave pública VAPID do servidor
 * @returns Objeto com os dados da subscrição ou null se falhar
 */
export async function registerPushSubscription(
  vapidPublicKey: string
): Promise<{
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string
} | null> {
  try {
    // Verificar se o navegador suporta
    if (!isPushNotificationSupported()) {
      console.warn('Push notifications não são suportadas neste navegador')
      return null
    }

    // Solicitar permissão
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.warn('Permissão para notificações negada')
      return null
    }

    // Registrar Service Worker se ainda não estiver registrado
    const registration = await navigator.serviceWorker.ready

    // Verificar se já existe uma subscrição
    let subscription = await registration.pushManager.getSubscription()

    // Se não existir, criar uma nova
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })
    }

    // Extrair as chaves da subscrição
    const key = subscription.getKey('p256dh')
    const auth = subscription.getKey('auth')

    if (!key || !auth) {
      throw new Error('Não foi possível obter as chaves da subscrição')
    }

    // Converter para base64
    const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)))
    const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)))

    return {
      endpoint: subscription.endpoint,
      p256dh,
      auth: authKey,
      userAgent: navigator.userAgent,
    }
  } catch (error) {
    console.error('Erro ao registrar subscrição de push:', error)
    return null
  }
}

/**
 * Cancela a subscrição de push notification
 * @returns true se cancelou com sucesso, false caso contrário
 */
export async function unregisterPushSubscription(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Erro ao cancelar subscrição de push:', error)
    return false
  }
}

/**
 * Verifica se o usuário já tem uma subscrição ativa
 * @returns true se tem subscrição, false caso contrário
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    return subscription !== null
  } catch (error) {
    console.error('Erro ao verificar subscrição:', error)
    return false
  }
}
