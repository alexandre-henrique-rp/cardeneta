# 🔔 Integração Web Push - Documentação Completa

## 📋 Resumo

Integração completa de notificações push usando Web Push API nativa do navegador. Sistema funciona sem dependências externas como Firebase, usando apenas a API padrão do navegador e service workers.

---

## 🏗️ Arquitetura

### Arquivos Criados/Modificados

#### **1. Service Worker** (`/public/sw.js`)
- ✅ Gerencia eventos de push
- ✅ Exibe notificações
- ✅ Marca notificações como entregues no backend
- ✅ Gerencia cliques em notificações
- ✅ Integrado com VitePWA

#### **2. Hook de Estado** (`/src/hooks/usePushNotification.ts`)
```typescript
export function usePushNotification()
```
**Retorna:**
- `isSupported`: boolean - Navegador suporta push
- `permission`: NotificationPermission - Estado da permissão
- `isSubscribed`: boolean - Usuário inscrito
- `subscription`: PushSubscription | null - Subscrição ativa
- `refreshSubscription`: () => Promise<void> - Atualiza estado

#### **3. Serviço de Mensagens** (`/src/services/message.ts`)
```typescript
// Solicita permissão e cria subscrição
requestNotificationPermission(): Promise<PushSubscription | null>

// Remove subscrição
unsubscribeFromNotifications(): Promise<boolean>

// Toggle ativar/desativar
togglePushNotifications(enable: boolean): Promise<boolean>

// Envia notificação de teste
sendTestNotification(): Promise<boolean>
```

#### **4. API Service** (`/src/api/service.ts`)
Endpoints corrigidos para bater com a documentação da API:
```typescript
getVapidPublicKey()            // GET  /push-notifications/vapid-public-key
createSubscription(data)       // POST /push-notifications/subscriptions
deleteSubscription(id)         // DELETE /push-notifications/subscriptions/:id
getUserSubscriptions()         // GET  /push-notifications/subscriptions
sendNotification(data)         // POST /push-notifications/send
getNotifications()             // GET  /push-notifications/notifications
```

#### **5. Página de Notificações** (`/src/components/notifications-page.tsx`)
- ✅ Exibe status atual das notificações
- ✅ Lista subscrições ativas
- ✅ Histórico de notificações
- ✅ Toggle para ativar/desativar
- ✅ Botão de teste
- ✅ Estatísticas

#### **6. Componente Nav User** (`/src/components/nav-user.tsx`)
- ✅ Toggle de notificações no menu do usuário
- ✅ Link para página de notificações
- ✅ Indicador visual do estado

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ **Primeira Vez - Ativar Notificações**

```
Usuário clica no toggle
    ↓
requestNotificationPermission()
    ↓
Solicita permissão do navegador
    ↓
Service Worker já registrado (VitePWA)
    ↓
Obtém chave VAPID do backend
    ↓
Cria PushSubscription
    ↓
Envia subscription para backend
    ↓
Backend salva no banco de dados
    ↓
Usuário inscrito ✅
```

### 2️⃣ **Backend Envia Notificação**

```
Backend chama /push-notifications/send
    ↓
Notificação salva no banco (status: SENT)
    ↓
Web Push API envia para o navegador
    ↓
Service Worker recebe evento 'push'
    ↓
Exibe notificação visual
    ↓
Service Worker marca como DELIVERED
    ↓
Backend atualiza status no banco
```

### 3️⃣ **Usuário Clica na Notificação**

```
Usuário clica
    ↓
Service Worker recebe 'notificationclick'
    ↓
Fecha a notificação
    ↓
Busca janela do app aberta
    ↓
Se existe: foca e navega para URL
    ↓
Se não: abre nova janela
```

---

## 🔑 Pontos Críticos de Implementação

### ✅ **1. Conversão de Chaves Base64**

A Web Push API exige chaves em formato específico:

```typescript
// VAPID key: Base64 URL-safe → Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array

// Subscription keys: Uint8Array → Base64
function uint8ArrayToBase64(buffer: ArrayBuffer | Uint8Array): string
```

### ✅ **2. Service Worker Integrado**

O `sw.js` precisa:
- Ser processado pelo VitePWA (`__WB_MANIFEST`)
- Lidar com eventos de push
- Lidar com eventos de PWA

```javascript
// VitePWA substitui isso em build
const precacheManifest = self.__WB_MANIFEST || [];

// Eventos de Push
self.addEventListener('push', async (event) => { ... })
self.addEventListener('notificationclick', (event) => { ... })

// Eventos de PWA
self.addEventListener('install', (event) => { ... })
self.addEventListener('activate', (event) => { ... })
```

### ✅ **3. Endpoints Corretos**

**ATENÇÃO:** A API usa `/push-notifications/` (plural) e não `/push-notification/` (singular).

| Errado ❌ | Correto ✅ |
|----------|-----------|
| `/push-notification/vapid-public-key` | `/push-notifications/vapid-public-key` |
| `/push-notification/subscribe` | `/push-notifications/subscriptions` (POST) |
| `/push-notification/unsubscribe` | `/push-notifications/subscriptions/:id` (DELETE) |

---

## 📊 Estrutura de Dados

### **Subscription (Frontend → Backend)**
```typescript
{
  endpoint: string,      // URL único do push endpoint
  p256dh: string,        // Chave pública (Base64)
  auth: string,          // Chave de autenticação (Base64)
  userAgent: string      // Info do navegador
}
```

### **Notification (Backend → Frontend)**
```typescript
{
  id: string,
  subscriptionId: string,
  title: string,
  body: string,
  data?: {              // Dados customizados
    url?: string,       // URL para navegação
    ...customFields
  },
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED',
  scheduledAt?: string,
  sentAt?: string,
  deliveredAt?: string,
  errorMessage?: string
}
```

---

## 🧪 Como Testar

### **1. Ativar Notificações**
1. Fazer login na aplicação
2. Clicar no avatar do usuário (canto inferior esquerdo)
3. Ativar o toggle "Notificações"
4. Aceitar a permissão do navegador
5. Ver toast de sucesso: "Notificações ativadas com sucesso!"

### **2. Enviar Notificação de Teste**
1. Ir em "Ver Notificações" no menu do usuário
2. Clicar em "Enviar Notificação de Teste"
3. Aguardar alguns segundos
4. Notificação deve aparecer

### **3. Testar via Backend (cURL)**
```bash
# 1. Obter token JWT (fazer login)
TOKEN="seu-token-jwt"

# 2. Listar subscrições
curl -X GET http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer $TOKEN"

# 3. Enviar notificação
SUBSCRIPTION_ID="uuid-da-subscription"

curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "Teste Manual",
    "body": "Testando notificação via cURL",
    "data": {
      "url": "/dashboard",
      "type": "manual-test"
    }
  }'
```

---

## 🐛 Troubleshooting

### **Notificações não aparecem**

1. **Verificar permissão do navegador**
   ```javascript
   console.log(Notification.permission) // Deve ser 'granted'
   ```

2. **Verificar service worker**
   - Abrir DevTools → Application → Service Workers
   - Deve estar "activated and running"

3. **Verificar subscrição**
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscrição:', sub)
     })
   })
   ```

4. **Verificar logs do service worker**
   - DevTools → Console → Filtrar por "Service Worker"
   - Procurar mensagens com prefixo `[SW]`

### **Erro de chave VAPID**

- Verificar se backend está retornando a chave pública
- Chave deve ser Base64 URL-safe (usa `-` e `_` ao invés de `+` e `/`)

### **Backend retorna erro 400/401**

- Verificar se token JWT está sendo enviado
- Verificar endpoints (com 's' em notifications)
- Verificar formato do corpo da requisição

### **Service Worker não atualiza**

```javascript
// Forçar atualização
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update())
})
```

---

## 🔒 Segurança

### **1. HTTPS Obrigatório**
- Push notifications só funcionam em HTTPS (ou localhost)
- Certificado SSL válido é necessário em produção

### **2. Chaves VAPID**
- Chave privada NUNCA deve ser exposta ao frontend
- Apenas a chave pública é compartilhada
- Backend usa chave privada para assinar mensagens

### **3. Autenticação**
- Todas as rotas de subscrição/envio requerem JWT
- Service worker pode marcar como entregue sem auth (rota pública)

---

## 📱 Compatibilidade

### **Navegadores Suportados**
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16+ (macOS 13+)
- ✅ Opera 37+
- ❌ IE (não suportado)

### **Dispositivos**
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Android (Chrome, Firefox)
- ⚠️ iOS 16.4+ (Safari apenas, com limitações)

---

## 🚀 Próximos Passos (Opcional)

1. **Notificações Agendadas**
   - Implementar cron job no backend
   - Enviar notificações com `scheduledAt`

2. **Categorias de Notificações**
   - Permitir usuário escolher tipos de notificação
   - Filtrar por categoria

3. **Rich Notifications**
   - Adicionar imagens
   - Botões de ação
   - Sons customizados

4. **Analytics**
   - Rastrear taxa de abertura
   - Tempo de engajamento
   - Conversões

---

## 📚 Referências

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [VAPID Protocol - RFC 8292](https://datatracker.ietf.org/doc/html/rfc8292)

---

## ✅ Checklist de Implementação

- [x] Corrigir endpoints da API (/push-notifications/)
- [x] Criar hook `usePushNotification`
- [x] Criar serviço `message.ts`
- [x] Implementar conversão de chaves Base64
- [x] Integrar service worker com push events
- [x] Criar página de notificações
- [x] Adicionar toggle no menu do usuário
- [x] Implementar notificação de teste
- [x] Documentar sistema completo

**Status:** ✅ **INTEGRAÇÃO COMPLETA E FUNCIONAL**
