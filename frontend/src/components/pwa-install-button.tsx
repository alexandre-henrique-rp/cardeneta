import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import { useState } from 'react'
import { toast } from 'sonner'

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall()
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    setIsInstalling(true)
    const success = await installPWA()
    
    if (success) {
      toast.success('App instalado com sucesso!')
    } else {
      toast.error('Falha na instalação do app')
    }
    
    setIsInstalling(false)
  }

  // Não mostrar se já estiver instalado ou não for instalável
  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      className="gap-2"
      variant="outline"
      size="sm"
    >
      {isInstalling ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Instalando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Instalar App
        </>
      )}
    </Button>
  )
}

// Componente para mostrar status de instalação (opcional)
export function PWAInstallStatus() {
  const { isInstalled } = usePWAInstall()

  if (!isInstalled) return null

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      <Check className="h-4 w-4" />
      App instalado
    </div>
  )
}