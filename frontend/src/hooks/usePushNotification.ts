import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar o estado das notificações push
 * 
 * Verifica se o navegador suporta notificações push,
 * gerencia o estado de permissão e subscrição do usuário
 * 
 * @returns {object} Estado das notificações push
 * - isSupported: boolean - Indica se o navegador suporta notificações
 * - permission: NotificationPermission - Estado da permissão ('default', 'granted', 'denied')
 * - isSubscribed: boolean - Indica se o usuário está inscrito para receber notificações
 * - subscription: PushSubscription | null - Objeto de subscrição ativa
 * - refreshSubscription: () => Promise<void> - Função para atualizar o estado da subscrição
 */
export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  /**
   * Verifica se o navegador suporta notificações push
   */
  const checkSupport = () => {
    const supported = 
      'Notification' in window && 
      'serviceWorker' in navigator && 
      'PushManager' in window

    setIsSupported(supported)
    return supported
  }

  /**
   * Atualiza o estado da subscrição atual
   */
  const refreshSubscription = async () => {
    try {
      if (!isSupported) {
        console.log('[usePushNotification] Notificações não suportadas')
        return
      }

      // Obter o service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Verificar se existe uma subscrição ativa
      const existingSubscription = await registration.pushManager.getSubscription()
      
      setSubscription(existingSubscription)
      setIsSubscribed(!!existingSubscription)
      
      console.log('[usePushNotification] Subscrição atualizada:', {
        isSubscribed: !!existingSubscription,
        endpoint: existingSubscription?.endpoint
      })
    } catch (error) {
      console.error('[usePushNotification] Erro ao verificar subscrição:', error)
      setIsSubscribed(false)
      setSubscription(null)
    }
  }

  /**
   * Atualiza o estado da permissão de notificações
   */
  const updatePermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }

  // Verificar suporte ao montar o componente
  useEffect(() => {
    const supported = checkSupport()
    
    if (supported) {
      updatePermission()
      refreshSubscription()
    }
  }, [])

  // Listener para mudanças na permissão
  useEffect(() => {
    if (!isSupported) return

    // Atualizar permissão quando a página voltar a ter foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updatePermission()
        refreshSubscription()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSupported])

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    refreshSubscription
  }
}
