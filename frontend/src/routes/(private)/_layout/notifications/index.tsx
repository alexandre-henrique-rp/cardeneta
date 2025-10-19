import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification
} from '@/services/push'
import { Bell, BellOff, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const Route = createFileRoute('/(private)/_layout/notifications/')({
  component: NotificationsPage,
})

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      toast.error('Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n)
      )
      toast.success('Notificação marcada como lida')
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const, readAt: new Date().toISOString() }))
      )
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notificação removida')
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      toast.error('Erro ao remover notificação')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marca como lida ao clicar
    if (notification.status !== 'read') {
      handleMarkAsRead(notification.id)
    }

    // Navega para a URL se houver
    if (notification.data?.url) {
      window.location.href = notification.data.url
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status !== 'read'
    if (filter === 'read') return n.status === 'read'
    return true
  })

  const unreadCount = notifications.filter(n => n.status !== 'read').length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Não lidas ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            filter === 'read'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Lidas ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Lista de Notificações */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filter === 'unread'
              ? 'Nenhuma notificação não lida'
              : filter === 'read'
              ? 'Nenhuma notificação lida'
              : 'Nenhuma notificação recebida'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all ${
                notification.status === 'read'
                  ? 'bg-background opacity-60'
                  : 'bg-card border-primary/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <div className={`flex-shrink-0 ${notification.status === 'read' ? 'opacity-50' : ''}`}>
                  {notification.icon ? (
                    <img
                      src={notification.icon}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <button
                  type="button"
                  className="flex-1 cursor-pointer text-left"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold ${notification.status === 'read' ? 'text-muted-foreground' : ''}`}>
                      {notification.title}
                    </h3>
                    {notification.data?.url && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${notification.status === 'read' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </button>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {notification.status !== 'read' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                      className="p-2 hover:bg-secondary rounded-md transition-colors"
                      title="Marcar como lida"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
