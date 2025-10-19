import { useEffect, useState } from 'react'
import { ApiService } from '@/api/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Loader2, RefreshCw, Send } from 'lucide-react'
import { toast } from 'sonner'
import { usePushNotification } from '@/hooks/usePushNotification'
import { togglePushNotifications, sendTestNotification } from '@/services/message'
import { Switch } from '@/components/ui/switch'

/**
 * Interface para representar uma notificação
 */
interface Notification {
  id: string
  subscriptionId: string
  title: string
  body: string
  data?: any
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface para representar uma subscrição
 */
interface Subscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string
  createdAt: string
  updatedAt: string
}

/**
 * Componente da página de notificações
 * 
 * Exibe:
 * - Estado atual das notificações
 * - Lista de subscrições ativas
 * - Histórico de notificações recebidas
 * - Controles para ativar/desativar e testar notificações
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testingNotification, setTestingNotification] = useState(false)
  const [togglingNotifications, setTogglingNotifications] = useState(false)
  
  const { isSupported, permission, isSubscribed, refreshSubscription } = usePushNotification()

  /**
   * Carrega as notificações e subscrições do usuário
   */
  const loadData = async () => {
    setIsLoading(true)
    try {
      const api = ApiService()
      
      // Carregar notificações e subscrições em paralelo
      const [notificationsData, subscriptionsData] = await Promise.all([
        api.getNotifications().catch(() => []),
        api.getUserSubscriptions().catch(() => [])
      ])

      setNotifications(notificationsData)
      setSubscriptions(subscriptionsData)
    } catch (error) {
      console.error('[Notifications] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Ativa ou desativa as notificações
   */
  const handleToggleNotifications = async (checked: boolean) => {
    if (togglingNotifications) return

    setTogglingNotifications(true)
    try {
      await togglePushNotifications(checked)
      await refreshSubscription()
      await loadData()
    } finally {
      setTogglingNotifications(false)
    }
  }

  /**
   * Envia uma notificação de teste
   */
  const handleTestNotification = async () => {
    if (testingNotification) return

    setTestingNotification(true)
    try {
      await sendTestNotification()
      // Aguardar um pouco e recarregar as notificações
      setTimeout(loadData, 1000)
    } finally {
      setTestingNotification(false)
    }
  }

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date)
  }

  /**
   * Retorna a cor do badge baseado no status
   */
  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'default'
      case 'SENT':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      case 'FAILED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  /**
   * Retorna o texto do status em português
   */
  const getStatusText = (status: Notification['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'Entregue'
      case 'SENT':
        return 'Enviada'
      case 'PENDING':
        return 'Pendente'
      case 'FAILED':
        return 'Falhou'
      default:
        return status
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData()
  }, [])

  if (!isSupported) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellOff className="h-6 w-6" />
              Notificações Push Não Suportadas
            </CardTitle>
            <CardDescription>
              Seu navegador não suporta notificações push. 
              Tente usar um navegador moderno como Chrome, Firefox ou Edge.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notificações Push
              </CardTitle>
              <CardDescription>
                Gerencie suas notificações e veja o histórico
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={loadData} 
                variant="outline" 
                size="icon"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Status das Notificações</p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed && permission === 'granted' 
                  ? 'Notificações ativadas e funcionando' 
                  : permission === 'denied'
                  ? 'Permissão negada - altere nas configurações do navegador'
                  : 'Notificações desativadas'}
              </p>
            </div>
            <Switch
              checked={isSubscribed && permission === 'granted'}
              onCheckedChange={handleToggleNotifications}
              disabled={togglingNotifications || permission === 'denied'}
            />
          </div>

          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">Subscrições Ativas</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">Total de Notificações</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
            <div className="p-4 border rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">Permissão</p>
              <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                {permission === 'granted' ? 'Concedida' : permission === 'denied' ? 'Negada' : 'Padrão'}
              </Badge>
            </div>
          </div>

          {/* Botão de teste */}
          {isSubscribed && permission === 'granted' && (
            <Button 
              onClick={handleTestNotification} 
              disabled={testingNotification}
              className="w-full"
            >
              {testingNotification ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Notificação de Teste
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lista de notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            {notifications.length > 0 
              ? `${notifications.length} notificação(ões) recebida(s)` 
              : 'Nenhuma notificação recebida ainda'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação ainda</p>
              <p className="text-sm">
                {isSubscribed 
                  ? 'Você receberá notificações aqui quando forem enviadas' 
                  : 'Ative as notificações para começar a receber'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                    <Badge variant={getStatusColor(notification.status)}>
                      {getStatusText(notification.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Criada:</span> {formatDate(notification.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Enviada:</span> {formatDate(notification.sentAt)}
                    </div>
                    <div>
                      <span className="font-medium">Entregue:</span> {formatDate(notification.deliveredAt)}
                    </div>
                  </div>
                  {notification.errorMessage && (
                    <div className="text-xs text-destructive">
                      Erro: {notification.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de subscrições */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos Inscritos</CardTitle>
            <CardDescription>
              Dispositivos que receberão notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((subscription, index) => (
                <div 
                  key={subscription.id} 
                  className="p-3 border rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      Dispositivo {index + 1}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(subscription.createdAt)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {subscription.userAgent}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
