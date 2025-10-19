# Push Notifications - Exemplos de Rotas

Este documento contém exemplos práticos de todas as rotas da API de Push Notifications com exemplos de requisições e respostas.

## Índice

- [Rotas Públicas](#rotas-públicas)
  - [Obter Chave Pública VAPID](#1-obter-chave-pública-vapid)
  - [Marcar Notificação como Recebida](#2-marcar-notificação-como-recebida)
- [Rotas Autenticadas](#rotas-autenticadas)
  - [Criar Subscrição](#3-criar-subscrição)
  - [Listar Subscrições do Usuário](#4-listar-subscrições-do-usuário)
  - [Remover Subscrição](#5-remover-subscrição)
  - [Enviar Notificação](#6-enviar-notificação)
  - [Listar Notificações de uma Subscrição](#7-listar-notificações-de-uma-subscrição)
  - [Listar Todas as Notificações do Usuário](#8-listar-todas-as-notificações-do-usuário)

---

## Rotas Públicas

Estas rotas não requerem autenticação e podem ser acessadas por service workers.

### 1. Obter Chave Pública VAPID

Retorna a chave pública VAPID necessária para criar subscrições no frontend.

**Endpoint:** `GET /push-notifications/vapid-public-key`

**Autenticação:** Não requer

**Exemplo de Requisição:**

```bash
curl -X GET http://localhost:3000/push-notifications/vapid-public-key
```

**Exemplo de Resposta:**

```json
{
  "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa-zCzJ54pPLEYJvs4QvTmM6awFQ4-Y2Hn0nHXL5MpKQZvWLqBxVzHCMfC4Mqo"
}
```

**Códigos de Status:**
- `200` - Sucesso
- `400` - Chave VAPID não configurada

---

### 2. Marcar Notificação como Recebida

Marca uma notificação como recebida/entregue. Esta rota é pública para permitir que service workers confirmem o recebimento.

**Endpoint:** `PATCH /push-notifications/notifications/:id/delivered`

**Autenticação:** Não requer

**Parâmetros de URL:**
- `id` (string, obrigatório) - UUID da notificação

**Exemplo de Requisição:**

```bash
curl -X PATCH http://localhost:3000/push-notifications/notifications/123e4567-e89b-12d3-a456-426614174000/delivered
```

**Exemplo de Resposta:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
  "title": "Nova transação",
  "body": "Você recebeu um novo crédito de R$ 100,00",
  "data": {
    "transactionId": "abc123",
    "amount": 100
  },
  "scheduledAt": null,
  "sentAt": "2025-10-19T14:30:00.000Z",
  "deliveredAt": "2025-10-19T14:30:05.123Z",
  "status": "DELIVERED",
  "errorMessage": null,
  "createdAt": "2025-10-19T14:29:58.000Z",
  "updatedAt": "2025-10-19T14:30:05.123Z"
}
```

**Códigos de Status:**
- `200` - Sucesso
- `404` - Notificação não encontrada

---

## Rotas Autenticadas

Estas rotas requerem um Bearer Token JWT no header de autorização.

### 3. Criar Subscrição

Registra uma nova subscrição de push notification para o usuário autenticado.

**Endpoint:** `POST /push-notifications/subscriptions`

**Autenticação:** Bearer Token

**Body (JSON):**

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/c8VqLbFvNzQ:APA91bGJY9...",
  "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa-zCzJ54pPLEYJvs4QvTmM6awFQ4-Y...",
  "auth": "R9sidzkcdf7h53v8ui9nkf==",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
}
```

**Campos:**
- `endpoint` (string, obrigatório) - URL do endpoint de push notification
- `p256dh` (string, obrigatório) - Chave pública P256DH da subscrição
- `auth` (string, obrigatório) - Chave de autenticação da subscrição
- `userAgent` (string, opcional) - User agent do navegador

**Exemplo de Requisição:**

```bash
curl -X POST http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/c8VqLbFvNzQ:APA91bGJY9...",
    "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa-zCzJ54pPLEYJvs4QvTmM6awFQ4-Y...",
    "auth": "R9sidzkcdf7h53v8ui9nkf==",
    "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
  }'
```

**Exemplo de Resposta:**

```json
{
  "id": "987fcdeb-51a2-43f8-9876-543210fedcba",
  "userId": "456def78-9abc-12de-f345-678901234567",
  "endpoint": "https://fcm.googleapis.com/fcm/send/c8VqLbFvNzQ:APA91bGJY9...",
  "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa-zCzJ54pPLEYJvs4QvTmM6awFQ4-Y...",
  "auth": "R9sidzkcdf7h53v8ui9nkf==",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "createdAt": "2025-10-19T10:00:00.000Z",
  "updatedAt": "2025-10-19T10:00:00.000Z"
}
```

**Códigos de Status:**
- `201` - Subscrição criada com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado

---

### 4. Listar Subscrições do Usuário

Retorna todas as subscrições de push notification do usuário autenticado.

**Endpoint:** `GET /push-notifications/subscriptions`

**Autenticação:** Bearer Token

**Exemplo de Requisição:**

```bash
curl -X GET http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer seu-token-jwt"
```

**Exemplo de Resposta:**

```json
[
  {
    "id": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "userId": "456def78-9abc-12de-f345-678901234567",
    "endpoint": "https://fcm.googleapis.com/fcm/send/c8VqLbFvNzQ:APA91bGJY9...",
    "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa-zCzJ54pPLEYJvs4QvTmM6awFQ4-Y...",
    "auth": "R9sidzkcdf7h53v8ui9nkf==",
    "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "createdAt": "2025-10-19T10:00:00.000Z",
    "updatedAt": "2025-10-19T10:00:00.000Z"
  },
  {
    "id": "123abc45-67de-89fg-0123-456789abcdef",
    "userId": "456def78-9abc-12de-f345-678901234567",
    "endpoint": "https://fcm.googleapis.com/fcm/send/anotherEndpoint...",
    "p256dh": "AnotherP256DHKey...",
    "auth": "AnotherAuthKey==",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "createdAt": "2025-10-18T15:30:00.000Z",
    "updatedAt": "2025-10-18T15:30:00.000Z"
  }
]
```

**Códigos de Status:**
- `200` - Sucesso
- `401` - Não autorizado

---

### 5. Remover Subscrição

Remove uma subscrição de push notification do usuário.

**Endpoint:** `DELETE /push-notifications/subscriptions/:id`

**Autenticação:** Bearer Token

**Parâmetros de URL:**
- `id` (string, obrigatório) - UUID da subscrição

**Exemplo de Requisição:**

```bash
curl -X DELETE http://localhost:3000/push-notifications/subscriptions/987fcdeb-51a2-43f8-9876-543210fedcba \
  -H "Authorization: Bearer seu-token-jwt"
```

**Exemplo de Resposta:**

```json
{
  "message": "Subscrição removida com sucesso"
}
```

**Códigos de Status:**
- `200` - Subscrição removida com sucesso
- `401` - Não autorizado
- `404` - Subscrição não encontrada

---

### 6. Enviar Notificação

Envia uma notificação push para uma subscrição específica.

**Endpoint:** `POST /push-notifications/send`

**Autenticação:** Bearer Token

**Body (JSON):**

```json
{
  "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
  "title": "Nova transação",
  "body": "Você recebeu um novo crédito de R$ 100,00",
  "data": {
    "transactionId": "abc123",
    "amount": 100,
    "type": "credit"
  },
  "scheduledAt": "2025-10-20T10:00:00Z"
}
```

**Campos:**
- `subscriptionId` (string, obrigatório) - UUID da subscrição que receberá a notificação
- `title` (string, obrigatório) - Título da notificação
- `body` (string, obrigatório) - Corpo/mensagem da notificação
- `data` (object, opcional) - Dados adicionais personalizados (JSON)
- `scheduledAt` (string ISO 8601, opcional) - Data/hora para envio agendado

**Exemplo de Requisição (Envio Imediato):**

```bash
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "title": "Nova transação",
    "body": "Você recebeu um novo crédito de R$ 100,00",
    "data": {
      "transactionId": "abc123",
      "amount": 100
    }
  }'
```

**Exemplo de Requisição (Envio Agendado):**

```bash
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "title": "Lembrete",
    "body": "Sua reunião começa em 10 minutos",
    "data": {
      "meetingId": "meeting-456"
    },
    "scheduledAt": "2025-10-20T15:50:00Z"
  }'
```

**Exemplo de Resposta (Enviado):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
  "title": "Nova transação",
  "body": "Você recebeu um novo crédito de R$ 100,00",
  "data": {
    "transactionId": "abc123",
    "amount": 100
  },
  "scheduledAt": null,
  "sentAt": "2025-10-19T14:30:00.000Z",
  "deliveredAt": null,
  "status": "SENT",
  "errorMessage": null,
  "createdAt": "2025-10-19T14:29:58.000Z",
  "updatedAt": "2025-10-19T14:30:00.000Z"
}
```

**Exemplo de Resposta (Agendado):**

```json
{
  "id": "789xyz12-34ab-56cd-ef78-901234567890",
  "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
  "title": "Lembrete",
  "body": "Sua reunião começa em 10 minutos",
  "data": {
    "meetingId": "meeting-456"
  },
  "scheduledAt": "2025-10-20T15:50:00.000Z",
  "sentAt": null,
  "deliveredAt": null,
  "status": "PENDING",
  "errorMessage": null,
  "createdAt": "2025-10-19T14:30:00.000Z",
  "updatedAt": "2025-10-19T14:30:00.000Z"
}
```

**Status das Notificações:**
- `PENDING` - Criada mas ainda não enviada (aguardando agendamento)
- `SENT` - Enviada com sucesso para o serviço de push
- `DELIVERED` - Confirmada como recebida pelo usuário
- `FAILED` - Falha no envio

**Códigos de Status:**
- `201` - Notificação enviada ou agendada com sucesso
- `400` - Erro ao enviar notificação
- `401` - Não autorizado
- `404` - Subscrição não encontrada

---

### 7. Listar Notificações de uma Subscrição

Retorna todas as notificações enviadas para uma subscrição específica.

**Endpoint:** `GET /push-notifications/subscriptions/:subscriptionId/notifications`

**Autenticação:** Bearer Token

**Parâmetros de URL:**
- `subscriptionId` (string, obrigatório) - UUID da subscrição

**Exemplo de Requisição:**

```bash
curl -X GET http://localhost:3000/push-notifications/subscriptions/987fcdeb-51a2-43f8-9876-543210fedcba/notifications \
  -H "Authorization: Bearer seu-token-jwt"
```

**Exemplo de Resposta:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "title": "Nova transação",
    "body": "Você recebeu um novo crédito de R$ 100,00",
    "data": {
      "transactionId": "abc123",
      "amount": 100
    },
    "scheduledAt": null,
    "sentAt": "2025-10-19T14:30:00.000Z",
    "deliveredAt": "2025-10-19T14:30:05.000Z",
    "status": "DELIVERED",
    "errorMessage": null,
    "createdAt": "2025-10-19T14:29:58.000Z",
    "updatedAt": "2025-10-19T14:30:05.000Z"
  },
  {
    "id": "456def78-9abc-12de-f345-678901234567",
    "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "title": "Pagamento aprovado",
    "body": "Seu pagamento de R$ 50,00 foi aprovado",
    "data": {
      "paymentId": "pay-789"
    },
    "scheduledAt": null,
    "sentAt": "2025-10-19T10:15:00.000Z",
    "deliveredAt": "2025-10-19T10:15:03.000Z",
    "status": "DELIVERED",
    "errorMessage": null,
    "createdAt": "2025-10-19T10:14:55.000Z",
    "updatedAt": "2025-10-19T10:15:03.000Z"
  }
]
```

**Códigos de Status:**
- `200` - Sucesso
- `401` - Não autorizado
- `404` - Subscrição não encontrada

---

### 8. Listar Todas as Notificações do Usuário

Retorna todas as notificações enviadas para o usuário autenticado (de todas as suas subscrições).

**Endpoint:** `GET /push-notifications/notifications`

**Autenticação:** Bearer Token

**Exemplo de Requisição:**

```bash
curl -X GET http://localhost:3000/push-notifications/notifications \
  -H "Authorization: Bearer seu-token-jwt"
```

**Exemplo de Resposta:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "subscriptionId": "987fcdeb-51a2-43f8-9876-543210fedcba",
    "title": "Nova transação",
    "body": "Você recebeu um novo crédito de R$ 100,00",
    "data": {
      "transactionId": "abc123",
      "amount": 100
    },
    "scheduledAt": null,
    "sentAt": "2025-10-19T14:30:00.000Z",
    "deliveredAt": "2025-10-19T14:30:05.000Z",
    "status": "DELIVERED",
    "errorMessage": null,
    "createdAt": "2025-10-19T14:29:58.000Z",
    "updatedAt": "2025-10-19T14:30:05.000Z",
    "subscription": {
      "id": "987fcdeb-51a2-43f8-9876-543210fedcba",
      "userId": "456def78-9abc-12de-f345-678901234567",
      "endpoint": "https://fcm.googleapis.com/fcm/send/c8VqLbFvNzQ...",
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64)",
      "createdAt": "2025-10-19T10:00:00.000Z",
      "updatedAt": "2025-10-19T10:00:00.000Z"
    }
  },
  {
    "id": "789abc12-34de-56fg-7890-123456789abc",
    "subscriptionId": "123abc45-67de-89fg-0123-456789abcdef",
    "title": "Lembrete agendado",
    "body": "Não esqueça da reunião amanhã",
    "data": null,
    "scheduledAt": "2025-10-20T09:00:00.000Z",
    "sentAt": null,
    "deliveredAt": null,
    "status": "PENDING",
    "errorMessage": null,
    "createdAt": "2025-10-19T14:00:00.000Z",
    "updatedAt": "2025-10-19T14:00:00.000Z",
    "subscription": {
      "id": "123abc45-67de-89fg-0123-456789abcdef",
      "userId": "456def78-9abc-12de-f345-678901234567",
      "endpoint": "https://fcm.googleapis.com/fcm/send/anotherEndpoint...",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "createdAt": "2025-10-18T15:30:00.000Z",
      "updatedAt": "2025-10-18T15:30:00.000Z"
    }
  }
]
```

**Códigos de Status:**
- `200` - Sucesso
- `401` - Não autorizado

---

## Integração com Frontend

### Exemplo: Criar subscrição no frontend

```javascript
// 1. Obter chave pública VAPID
const response = await fetch('http://localhost:3000/push-notifications/vapid-public-key');
const { publicKey } = await response.json();

// 2. Registrar service worker
const registration = await navigator.serviceWorker.register('/sw.js');

// 3. Criar subscrição
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: publicKey
});

// 4. Enviar subscrição para o backend
const keys = subscription.getKey ? {
  p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
  auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
} : {};

await fetch('http://localhost:3000/push-notifications/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent: navigator.userAgent
  })
});
```

### Exemplo: Marcar como entregue no Service Worker

```javascript
// No arquivo sw.js (service worker)
self.addEventListener('push', async (event) => {
  const data = event.data.json();

  // Mostrar notificação
  await self.registration.showNotification(data.title, {
    body: data.body,
    data: data.data,
    icon: '/icon.png',
    badge: '/badge.png'
  });

  // Marcar como entregue
  if (data.notificationId) {
    await fetch(`http://localhost:3000/push-notifications/notifications/${data.notificationId}/delivered`, {
      method: 'PATCH'
    });
  }
});
```

---

## Observações Importantes

1. **Rotas Públicas**: As rotas `/vapid-public-key` e `/notifications/:id/delivered` são públicas para permitir acesso de service workers que não podem enviar tokens JWT.

2. **Agendamento**: Quando você envia uma notificação com `scheduledAt` futura, ela é salva no banco com status `PENDING`. Você precisará implementar um sistema de agendamento (como Bull Queue ou node-cron) para enviar essas notificações no horário correto.

3. **Status DELIVERED**: A mudança de status para `DELIVERED` deve ser feita pelo service worker do frontend quando a notificação é efetivamente recebida/visualizada pelo usuário.

4. **Dados Personalizados**: O campo `data` aceita qualquer objeto JSON e pode ser usado para passar informações adicionais para o frontend (IDs de transações, links, etc.).
