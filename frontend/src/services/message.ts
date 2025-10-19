import { ApiService } from '@/api/service'
import { toast } from 'sonner'

/**
 * Converte uma string Base64 URL-safe para Uint8Array
 * Necessário para a chave VAPID pública
 * 
 * @param base64String - String em formato Base64 URL-safe
 * @returns Uint8Array com os bytes da chave
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
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
 * Converte Uint8Array para Base64 string
 * Necessário para enviar as chaves p256dh e auth para o backend
 * 
 * @param buffer - ArrayBuffer ou Uint8Array com os dados
 * @returns String em formato Base64
 */
function uint8ArrayToBase64(buffer: ArrayBuffer | Uint8Array | null): string {
  if (!buffer) return ''
  
  const bytes = new Uint8Array(buffer)
  let binary = ''
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return window.btoa(binary)
}

/**
 * Solicita permissão para notificações e cria uma subscrição push
 * 
 * Fluxo:
 * 1. Solicita permissão do navegador
 * 2. Registra o service worker
 * 3. Obtém a chave VAPID pública do backend
 * 4. Cria a subscrição push
 * 5. Envia os dados da subscrição para o backend
 * 
 * @returns Promise<PushSubscription | null> - Subscrição criada ou null em caso de erro
 */
export async function requestNotificationPermission(): Promise<PushSubscription | null> {
  try {
    // 1. Verificar suporte do navegador
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações')
      return null
    }

    if (!('serviceWorker' in navigator)) {
      toast.error('Seu navegador não suporta Service Workers')
      return null
    }

    if (!('PushManager' in window)) {
      toast.error('Seu navegador não suporta Push Notifications')
      return null
    }

    // 2. Solicitar permissão
    const permission = await Notification.requestPermission()
    
    if (permission !== 'granted') {
      toast.error('Permissão para notificações negada')
      return null
    }

    // 3. Registrar service worker (se ainda não estiver registrado)
    const registration = await navigator.serviceWorker.ready
    console.log('[Push] Service Worker registrado:', registration)

    // 4. Verificar se já existe uma subscrição
    let subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      console.log('[Push] Subscrição já existe:', subscription.endpoint)
      
      // Verificar se a subscrição já está no backend
      try {
        const api = ApiService()
        const subscriptions = await api.getUserSubscriptions()
        const exists = subscriptions.some((sub: any) => sub.endpoint === subscription?.endpoint)
        
        if (exists) {
          toast.success('Notificações já estavam ativas')
          return subscription
        }
      } catch (error) {
        console.log('[Push] Erro ao verificar subscrições existentes:', error)
      }
    }

    // 5. Obter chave pública VAPID do backend
    const api = ApiService()
    const { publicKey } = await api.getVapidPublicKey()
    
    if (!publicKey) {
      toast.error('Erro ao obter chave VAPID do servidor')
      return null
    }

    console.log('[Push] Chave VAPID obtida:', publicKey.substring(0, 20) + '...')

    // 6. Criar nova subscrição se não existir
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(publicKey)
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      
      console.log('[Push] Nova subscrição criada:', subscription.endpoint)
    }

    // 7. Extrair chaves da subscrição
    const p256dh = subscription.getKey('p256dh')
    const auth = subscription.getKey('auth')

    if (!p256dh || !auth) {
      toast.error('Erro ao obter chaves da subscrição')
      return null
    }

    // 8. Enviar subscrição para o backend
    await api.createSubscription({
      endpoint: subscription.endpoint,
      p256dh: uint8ArrayToBase64(p256dh),
      auth: uint8ArrayToBase64(auth),
      userAgent: navigator.userAgent,
    })

    console.log('[Push] Subscrição enviada ao backend com sucesso')
    toast.success('Notificações ativadas com sucesso!')

    return subscription
  } catch (error: any) {
    console.error('[Push] Erro ao ativar notificações:', error)
    
    if (error.name === 'NotAllowedError') {
      toast.error('Permissão para notificações foi negada')
    } else if (error.name === 'AbortError') {
      toast.error('Subscrição de notificações foi cancelada')
    } else {
      toast.error('Erro ao ativar notificações. Tente novamente.')
    }
    
    return null
  }
}

/**
 * Remove a subscrição de notificações push
 * 
 * Fluxo:
 * 1. Obtém a subscrição atual
 * 2. Remove a subscrição do backend
 * 3. Desinscreve do PushManager
 * 
 * @returns Promise<boolean> - true se removido com sucesso, false caso contrário
 */
export async function unsubscribeFromNotifications(): Promise<boolean> {
  try {
    // 1. Verificar se há service worker registrado
    const registration = await navigator.serviceWorker.ready
    
    // 2. Obter subscrição atual
    const subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      console.log('[Push] Nenhuma subscrição ativa encontrada')
      toast.info('Notificações já estavam desativadas')
      return true
    }

    // 3. Buscar subscrições no backend e remover
    try {
      const api = ApiService()
      const subscriptions = await api.getUserSubscriptions()
      
      // Encontrar a subscrição correspondente
      const matchingSubscription = subscriptions.find(
        (sub: any) => sub.endpoint === subscription.endpoint
      )
      
      if (matchingSubscription) {
        await api.deleteSubscription(matchingSubscription.id)
        console.log('[Push] Subscrição removida do backend:', matchingSubscription.id)
      }
    } catch (error) {
      console.error('[Push] Erro ao remover subscrição do backend:', error)
      // Continua mesmo com erro no backend
    }

    // 4. Desinscrever do PushManager
    const unsubscribed = await subscription.unsubscribe()
    
    if (unsubscribed) {
      console.log('[Push] Desinscrição realizada com sucesso')
      toast.success('Notificações desativadas')
      return true
    }
    
    toast.error('Erro ao desativar notificações')
    return false
  } catch (error) {
    console.error('[Push] Erro ao desinscrever:', error)
    toast.error('Erro ao desativar notificações')
    return false
  }
}

/**
 * Alterna o estado das notificações push (ativar/desativar)
 * 
 * @param enable - true para ativar, false para desativar
 * @returns Promise<boolean> - true se a operação foi bem-sucedida
 */
export async function togglePushNotifications(enable: boolean): Promise<boolean> {
  if (enable) {
    const subscription = await requestNotificationPermission()
    return !!subscription
  } else {
    return await unsubscribeFromNotifications()
  }
}

/**
 * Envia uma notificação de teste
 * 
 * @returns Promise<boolean> - true se enviado com sucesso
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const api = ApiService()
    
    // Obter subscrições do usuário
    const subscriptions = await api.getUserSubscriptions()
    
    if (!subscriptions || subscriptions.length === 0) {
      toast.error('Você precisa ativar as notificações primeiro')
      return false
    }

    // Enviar notificação de teste para a primeira subscrição
    await api.sendNotification({
      subscriptionId: subscriptions[0].id,
      title: '🎉 Notificação de Teste',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      data: {
        url: '/notifications',
        type: 'test'
      }
    })

    toast.success('Notificação de teste enviada!')
    return true
  } catch (error) {
    console.error('[Push] Erro ao enviar notificação de teste:', error)
    toast.error('Erro ao enviar notificação de teste')
    return false
  }
}
