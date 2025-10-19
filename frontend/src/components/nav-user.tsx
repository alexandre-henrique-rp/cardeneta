import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/auth'
import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut, Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { usePushNotification } from '@/hooks/usePushNotification'
import { togglePushNotifications } from '@/services/message'
import { useState } from 'react'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { User, Logout, loading } = useAuth()
  const navigate = useNavigate()
  const { isSupported, isSubscribed, permission } = usePushNotification()
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false)

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

  const handleToggleNotifications = async (checked: boolean) => {
    if (isTogglingNotifications) return

    setIsTogglingNotifications(true)
    try {
      await togglePushNotifications(checked)
      // A função togglePushNotifications já mostra o toast de sucesso/erro
    } finally {
      setIsTogglingNotifications(false)
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

            {/* Notificações Push */}
            {isSupported && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {isSubscribed ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                      <span>Notificações</span>
                    </div>
                    <Switch
                      checked={isSubscribed && permission === 'granted'}
                      onCheckedChange={handleToggleNotifications}
                      disabled={isTogglingNotifications}
                    />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Ver Notificações */}
            <DropdownMenuItem onClick={() => navigate({ to: '/notifications' })}>
              <Bell />
              Ver Notificações
            </DropdownMenuItem>
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
