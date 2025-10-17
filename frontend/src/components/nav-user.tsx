import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/auth'
import { toast } from 'sonner'
import { Bell, ChevronsUpDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { messaging } from '@/lib/messaging'
import { getToken } from 'firebase/messaging'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { User, Logout, loading } = useAuth()
  const navigate = useNavigate()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isLoadingNotification, setIsLoadingNotification] = useState(false)

  // Verificar se as notificações já estão ativadas ao carregar o componente
  useEffect(() => {
    const token = localStorage.getItem('firebase_token')
    if (token) {
      setNotificationsEnabled(true)
    }
  }, [])

  /**
   * Função para solicitar permissão de notificação e obter token do Firebase
   */
  const handleToggleNotifications = async (checked: boolean) => {
    if (checked) {
      setIsLoadingNotification(true)
      try {
        // Verificar se o navegador suporta notificações
        if (!('Notification' in window)) {
          toast.error('Este navegador não suporta notificações')
          return
        }

        // Solicitar permissão
        const permission = await Notification.requestPermission()
        
        if (permission === 'granted') {
          // Verificar se a chave VAPID do Firebase está configurada
          // Esta chave vem do Firebase Console > Cloud Messaging > Web Push certificates
          const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
          if (!vapidKey) {
            toast.error('Chave VAPID do Firebase não configurada. Verifique as variáveis de ambiente.')
            console.error('VITE_VAPID_PUBLIC_KEY não encontrada. Obtenha no Firebase Console > Cloud Messaging')
            return
          }

          // Obter o token do FCM usando a chave VAPID do Firebase
          const token = await getToken(messaging, {
            vapidKey,
          })
          
          if (token) {
            // Salvar token no localStorage
            localStorage.setItem('firebase_token', token)
            setNotificationsEnabled(true)
            toast.success('Notificações ativadas com sucesso!')
            console.log('Token FCM:', token)
          } else {
            toast.error('Não foi possível obter o token de notificação')
          }
        } else if (permission === 'denied') {
          toast.error('Permissão de notificação negada. Habilite nas configurações do navegador.')
        } else {
          toast.warning('Permissão de notificação não concedida')
        }
      } catch (error) {
        console.error('Erro ao ativar notificações:', error)
        toast.error('Erro ao ativar notificações. Verifique o console para mais detalhes.')
      } finally {
        setIsLoadingNotification(false)
      }
    } else {
      // Desativar notificações
      localStorage.removeItem('firebase_token')
      setNotificationsEnabled(false)
      toast.success('Notificações desativadas')
    }
  }

  const handleLogout = () => {
    try {
      console.log('Logout')
      Logout() // O logout já redireciona para /login e mostra mensagem de sucesso
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error(
        'Ocorreu um erro ao tentar sair do sistema. Por favor, tente novamente.'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  const name = User?.name || 'Usuário'
  const Email = User?.email || ''
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={avatarUrl} alt={name} /> */}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{Email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={avatarUrl} alt={name} /> */}
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs">{Email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificações</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isLoadingNotification}
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
