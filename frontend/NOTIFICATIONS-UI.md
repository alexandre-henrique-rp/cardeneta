# Interface de Notificações - Guia de Uso

Este documento descreve a interface de usuário para gerenciamento de Push Notifications.

## 🎯 Funcionalidades Implementadas

### 1. Switch de Notificações (Menu do Usuário)

Local: [src/components/nav-user.tsx](src/components/nav-user.tsx)

**Como usar:**
1. Clique no avatar do usuário (canto inferior esquerdo)
2. No menu dropdown, você verá:
   - **Switch "Notificações"** - Ativa/desativa push notifications
   - **"Ver Notificações"** - Abre a página de notificações

**Comportamento:**
- ✅ Switch aparece apenas se o navegador suporta push notifications
- ✅ Ícone muda: `Bell` (ativo) / `BellOff` (inativo)
- ✅ Estado sincronizado com subscrição real
- ✅ Feedback visual durante operação (disabled enquanto processa)
- ✅ Toasts informativos de sucesso/erro

### 2. Página de Notificações

Local: [src/routes/(private)/_layout/notifications/index.tsx](src/routes/(private)/_layout/notifications/index.tsx)

**Acesso:**
- Menu do usuário > "Ver Notificações"
- URL: `/notifications`

**Features:**

#### A) Estatísticas
- Contador de notificações não lidas no header
- Botão "Marcar todas como lidas" (aparece apenas se houver não lidas)

#### B) Filtros
- **Todas** - Mostra todas as notificações
- **Não lidas** - Apenas não lidas
- **Lidas** - Apenas lidas
- Contador em cada filtro

#### C) Lista de Notificações
Cada notificação exibe:
- **Ícone** - Personalizado ou ícone padrão
- **Título** - Em negrito
- **Mensagem** - Corpo da notificação
- **Tempo** - "há X minutos/horas/dias" (usando date-fns)
- **Ícone de link** - Se a notificação tem URL de destino
- **Estado visual** - Não lidas em destaque, lidas com opacidade

#### D) Ações
- **Clicar na notificação**
  - Marca como lida automaticamente
  - Navega para URL (se houver)
- **Botão "✓" (Check)** - Marca como lida (apenas não lidas)
- **Botão "🗑️" (Trash)** - Remove a notificação

#### E) Estados Vazios
- Mensagens amigáveis quando não há notificações
- Ícones ilustrativos para cada filtro vazio

## 🎨 Design

### Cores e Estilos
- **Não lidas**: Fundo destacado, borda colorida, texto normal
- **Lidas**: Fundo neutro, opacidade 60%, texto cinza
- **Hover**: Efeitos suaves em botões
- **Responsivo**: Funciona em mobile e desktop

### Acessibilidade
- ✅ Todos os botões têm `type="button"`
- ✅ Elementos clicáveis são buttons de verdade
- ✅ Títulos descritivos em botões de ação
- ✅ Navegação por teclado funcional

## 🔧 Implementação Técnica

### Novos Services (src/services/push.ts)

```typescript
// Listar notificações
const notifications = await getNotifications()

// Marcar como lida
await markNotificationAsRead(notificationId)

// Marcar todas como lidas
await markAllNotificationsAsRead()

// Deletar notificação
await deleteNotification(notificationId)
```

### Interface TypeScript

```typescript
interface Notification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  createdAt: string
  deliveredAt?: string
  readAt?: string
  status: 'pending' | 'delivered' | 'read' | 'failed'
}
```

### Dependências Adicionadas
- ✅ `date-fns` - Formatação de datas em português

## 📱 Fluxo de Uso Completo

### Primeiro Acesso
```
1. Usuário faz login
2. Clica no avatar
3. Ativa o switch "Notificações"
4. Navegador solicita permissão
5. Usuário aceita
6. Toast de sucesso
7. Switch fica ativado
```

### Receber Notificação
```
1. Backend envia push notification
2. Service Worker recebe
3. Notificação aparece no sistema
4. Usuário vê a notificação
5. Usuário clica na notificação
6. Navegador abre/foca a aplicação
7. Aplicação navega para URL (se houver)
```

### Gerenciar Notificações
```
1. Usuário clica no avatar
2. Clica em "Ver Notificações"
3. Vê lista de todas as notificações
4. Pode filtrar (Todas/Não lidas/Lidas)
5. Pode clicar para abrir link
6. Pode marcar como lida
7. Pode deletar
8. Pode marcar todas como lidas
```

## 🔗 API Endpoints Utilizados

Conforme documentado em [API-EXAMPLES.md](API-EXAMPLES.md):

```
GET /push-notifications/notifications
  → Lista notificações do usuário

PATCH /push-notifications/notifications/:id/read
  → Marca notificação como lida

PATCH /push-notifications/notifications/read-all
  → Marca todas como lidas

DELETE /push-notifications/notifications/:id
  → Deleta notificação
```

## 🎯 Casos de Uso

### 1. Notificação de Nova Transação
```json
{
  "title": "Nova transação recebida",
  "body": "Você recebeu R$ 100,00 de João Silva",
  "data": {
    "url": "/transactions/abc-123",
    "transactionId": "abc-123",
    "amount": 100,
    "type": "credit"
  }
}
```

Usuário:
1. Recebe notificação no sistema
2. Clica na notificação
3. App abre em `/transactions/abc-123`
4. Vê detalhes da transação

### 2. Notificação de Pagamento Vencido
```json
{
  "title": "Pagamento vencido",
  "body": "A conta de Luz venceu há 3 dias",
  "data": {
    "url": "/bills/xyz-789",
    "billId": "xyz-789",
    "daysOverdue": 3
  }
}
```

Usuário:
1. Recebe notificação
2. Abre app
3. Vai em "Ver Notificações"
4. Clica na notificação
5. É direcionado para `/bills/xyz-789`

### 3. Lembrete Genérico
```json
{
  "title": "Lembrete",
  "body": "Não esqueça de fazer o backup dos dados",
  "data": {
    "url": "/settings"
  }
}
```

## 📊 Estados da Notificação

```
pending → delivered → read
   ↓          ↓         ↓
 failed    (visible)  (archived)
```

- **pending**: Aguardando entrega
- **delivered**: Entregue ao dispositivo (marcado pelo SW)
- **read**: Lida pelo usuário
- **failed**: Falha na entrega

## 🧪 Como Testar

### 1. Ativar Notificações
```bash
# No navegador
1. Abra http://localhost:3001
2. Faça login
3. Clique no avatar
4. Ative "Notificações"
5. Aceite permissão
```

### 2. Enviar Notificação de Teste
```bash
# Via cURL
TOKEN="seu-token-jwt"
SUBSCRIPTION_ID="uuid-da-subscricao"

curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "🎉 Teste de Interface",
    "body": "Esta é uma notificação de teste para a nova interface",
    "data": {
      "url": "/notifications"
    }
  }'
```

### 3. Verificar na Interface
```bash
1. Notificação aparece no sistema
2. Clique no avatar > "Ver Notificações"
3. Veja a notificação na lista
4. Teste filtros
5. Teste marcar como lida
6. Teste deletar
```

## 🐛 Troubleshooting

### Switch não aparece
**Causa**: Navegador não suporta push notifications
**Solução**: Use Chrome, Firefox ou Edge recente

### Notificações não aparecem na lista
**Causa**: Backend não retorna dados ou erro de API
**Solução**:
1. Verifique console do navegador
2. Verifique se backend está rodando
3. Verifique token JWT

### Erro ao marcar como lida
**Causa**: Endpoint não implementado ou erro de permissão
**Solução**:
1. Verifique logs do backend
2. Confirme que endpoint existe
3. Verifique token JWT

### Data em formato errado
**Causa**: Backend enviando data em formato inválido
**Solução**: Backend deve enviar ISO 8601 (ex: `2025-10-19T20:52:44.244Z`)

## 📚 Arquivos Relacionados

- [src/components/nav-user.tsx](src/components/nav-user.tsx) - Switch de notificações
- [src/routes/(private)/_layout/notifications/index.tsx](src/routes/(private)/_layout/notifications/index.tsx) - Página de notificações
- [src/services/push.ts](src/services/push.ts) - Services de API
- [src/hooks/usePushNotification.ts](src/hooks/usePushNotification.ts) - Hook React
- [API-EXAMPLES.md](API-EXAMPLES.md) - Documentação da API

## 🚀 Melhorias Futuras (Opcional)

1. **Paginação** - Se houver muitas notificações
2. **Busca** - Filtrar por texto
3. **Categorias** - Agrupar por tipo (transação, lembrete, etc)
4. **Sons** - Notificações sonoras customizadas
5. **Badge** - Contador no ícone do app (PWA)
6. **Ações rápidas** - Botões de ação na notificação (Aceitar/Recusar)
7. **Preferências** - Configurar tipos de notificação
8. **Arquivamento** - Arquivar em vez de deletar

---

**Status**: ✅ Completo e funcionando
**Data**: 2025-10-19
**Autor**: Claude Code
