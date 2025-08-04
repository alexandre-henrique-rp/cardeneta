import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Debug logs
    console.log('PWA Hook: Inicializando...')
    console.log('PWA Hook: User Agent:', navigator.userAgent)
    console.log('PWA Hook: Protocol:', window.location.protocol)
    console.log('PWA Hook: Host:', window.location.host)

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSInstalled = (window.navigator as any).standalone === true
    const isInstalled = isStandalone || isIOSInstalled
    
    console.log('PWA Hook: Display mode standalone:', isStandalone)
    console.log('PWA Hook: iOS standalone:', isIOSInstalled)
    console.log('PWA Hook: Is installed:', isInstalled)
    
    setIsInstalled(isInstalled)

    // Capturar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Hook: beforeinstallprompt event triggered!')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Detectar quando a app foi instalada
    const handleAppInstalled = () => {
      console.log('PWA Hook: App foi instalada!')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Timeout para verificar se o evento não foi disparado
    const timeout = setTimeout(() => {
      console.log('PWA Hook: Timeout - evento beforeinstallprompt não foi disparado em 5s')
      
      // Para Android/Chrome, pode ser que precise de interação do usuário primeiro
      if (/Android|Chrome/i.test(navigator.userAgent) && !isInstalled) {
        console.log('PWA Hook: Detectado Android/Chrome - aguardando interação do usuário')
      }
    }, 5000)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    installPWA
  }
}