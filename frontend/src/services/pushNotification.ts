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

    // Aguardar o Service Worker estar pronto e ativo
    console.log('⏳ Aguardando Service Worker estar pronto...')
    const registration = await navigator.serviceWorker.ready

    // Verificar se o SW está realmente ativo
    if (!registration.active) {
      console.error('❌ Service Worker não está ativo')
      throw new Error('Service Worker não está ativo. Recarregue a página.')
    }

    console.log('✅ Service Worker ativo:', registration.active.state)

    // Aguardar um pouco para garantir que o SW está completamente pronto
    if (registration.active.state === 'activating') {
      console.log('⏳ Service Worker está ativando... aguardando...')
      await new Promise(resolve => {
        registration.active?.addEventListener('statechange', function listener(e) {
          if ((e.target as ServiceWorker).state === 'activated') {
            registration.active?.removeEventListener('statechange', listener)
            resolve(null)
          }
        })
        // Timeout de segurança
        setTimeout(resolve, 2000)
      })
    }

    // Verificar se já existe uma subscrição
    let subscription = await registration.pushManager.getSubscription()

    // Se não existir, criar uma nova
    if (!subscription) {
      console.log('📝 Criando nova subscrição push...')
      console.log('🔑 Chave VAPID recebida:', vapidPublicKey)
      console.log('🔑 Tamanho da chave:', vapidPublicKey.length, 'caracteres')

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      console.log('🔑 Chave convertida:', convertedVapidKey)
      console.log('🔑 Tamanho convertido:', convertedVapidKey.length, 'bytes (esperado: 65)')

      if (convertedVapidKey.length !== 65) {
        console.error('❌ Chave VAPID tem tamanho incorreto! Esperado: 65 bytes, Recebido:', convertedVapidKey.length)
        throw new Error(`Chave VAPID inválida. Tamanho: ${convertedVapidKey.length} bytes (esperado: 65)`)
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      })
      console.log('✅ Subscrição criada com sucesso!')
    } else {
      console.log('ℹ️ Subscrição já existe')
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
