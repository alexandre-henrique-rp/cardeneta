# Push Notifications API

Sistema de notificações push usando web-push para enviar notificações aos usuários.

## Configuração

### 1. Gerar chaves VAPID

Execute o comando para gerar as chaves VAPID:

```bash
npx web-push generate-vapid-keys
```

### 2. Configurar variáveis de ambiente

Adicione as chaves geradas no arquivo `.env`:

```env
VAPID_PUBLIC_KEY="sua-chave-publica"
VAPID_PRIVATE_KEY="sua-chave-privada"
VAPID_SUBJECT="mailto:seu-email@exemplo.com"
```

## Endpoints da API

Todas as rotas estão documentadas no Swagger em `/api` e requerem autenticação via Bearer Token.

### Subscrições

#### POST `/push-notifications/subscriptions`
Cria uma nova subscrição de push notification.

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "chave-publica-p256dh",
  "auth": "chave-auth",
  "userAgent": "Mozilla/5.0..." (opcional)
}
```

#### GET `/push-notifications/subscriptions`
Lista todas as subscrições do usuário autenticado.

#### DELETE `/push-notifications/subscriptions/:id`
Remove uma subscrição específica.

### Notificações

#### POST `/push-notifications/send`
Envia uma notificação push.

**Body:**
```json
{
  "subscriptionId": "uuid-da-subscricao",
  "title": "Título da notificação",
  "body": "Mensagem da notificação",
  "data": {
    "customKey": "customValue"
  },
  "scheduledAt": "2025-10-20T10:00:00Z" (opcional)
}
```

**Observações:**
- Se `scheduledAt` for omitido ou for uma data passada, a notificação é enviada imediatamente
- Se `scheduledAt` for uma data futura, a notificação é agendada (mas não enviada automaticamente - necessita implementar um job scheduler)

#### GET `/push-notifications/notifications`
Lista todas as notificações do usuário autenticado.

#### GET `/push-notifications/subscriptions/:subscriptionId/notifications`
Lista todas as notificações de uma subscrição específica.

#### PATCH `/push-notifications/notifications/:id/delivered`
Marca uma notificação como recebida/entregue.

## Estrutura do Banco de Dados

### Tabela: PushSubscription
Armazena as subscrições dos usuários.

- `id`: UUID da subscrição
- `userId`: ID do usuário
- `endpoint`: URL do endpoint de push
- `p256dh`: Chave pública P256DH
- `auth`: Chave de autenticação
- `userAgent`: User agent do navegador
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### Tabela: PushNotification
Armazena o histórico de notificações enviadas.

- `id`: UUID da notificação
- `subscriptionId`: ID da subscrição
- `title`: Título da notificação
- `body`: Corpo da notificação
- `data`: Dados adicionais (JSON)
- `scheduledAt`: Data/hora agendada para envio
- `sentAt`: Data/hora de envio
- `deliveredAt`: Data/hora de recebimento
- `status`: Status da notificação (PENDING, SENT, DELIVERED, FAILED)
- `errorMessage`: Mensagem de erro (se houver)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

## Status das Notificações

- **PENDING**: Notificação criada mas ainda não enviada
- **SENT**: Notificação enviada com sucesso
- **DELIVERED**: Notificação recebida pelo usuário (confirmada pelo cliente)
- **FAILED**: Falha ao enviar a notificação

## Exemplo de Uso

### 1. Criar subscrição no frontend

```javascript
// Registrar service worker e obter subscrição
const registration = await navigator.serviceWorker.register('/sw.js');
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'VAPID_PUBLIC_KEY'
});

// Enviar subscrição para o backend
await fetch('/push-notifications/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
    userAgent: navigator.userAgent
  })
});
```

### 2. Enviar notificação

```javascript
await fetch('/push-notifications/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subscriptionId: 'uuid-da-subscricao',
    title: 'Nova transação',
    body: 'Você recebeu um crédito de R$ 100,00',
    data: {
      transactionId: 'abc123',
      amount: 100
    }
  })
});
```

### 3. Marcar como recebida (no service worker)

```javascript
// No service worker (sw.js)
self.addEventListener('push', async (event) => {
  const data = event.data.json();

  // Mostrar notificação
  await self.registration.showNotification(data.title, {
    body: data.body,
    data: data.data
  });

  // Marcar como entregue (fazer requisição ao backend)
  // Isso deve ser feito quando o usuário recebe/visualiza a notificação
});
```

## Próximos Passos (Melhorias Futuras)

1. **Job Scheduler**: Implementar um sistema de agendamento (ex: Bull, node-cron) para enviar notificações agendadas
2. **Retry Logic**: Adicionar lógica de retry para notificações que falharam
3. **Batch Sending**: Implementar envio em lote para múltiplas subscrições
4. **Analytics**: Adicionar métricas e analytics de entrega
5. **Templates**: Criar sistema de templates para notificações
