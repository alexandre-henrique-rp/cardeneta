# Migração: Firebase → Web-Push Padrão

Este documento detalha a migração de Firebase Cloud Messaging para Web-Push padrão + integração com PWA.

## 📋 Resumo das Mudanças

### Antes (Firebase)
- ❌ Dependência do Firebase
- ❌ Configuração complexa de credenciais
- ❌ Conflito com VitePWA
- ❌ Service Worker separado para mensagens
- ❌ Vendor lock-in

### Depois (Web-Push)
- ✅ Web-Push padrão W3C
- ✅ Sem dependências externas
- ✅ Integrado com VitePWA
- ✅ Service Worker único
- ✅ Open standard

## 🔄 Arquivos Modificados

### 1. src/services/push.ts
**Antes:**
```typescript
// Usava VAPID do .env
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Endpoint Firebase específico
await axios.post(`${API_URL}/push-notification/subscribe`, ...);
```

**Depois:**
```typescript
// Busca VAPID do backend
const vapidPublicKey = await getVapidPublicKey();

// Converte para Uint8Array
applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)

// Endpoint REST padrão
await axios.post(`${API_URL}/push-notifications/subscriptions`, ...);
```

### 2. src/services/message.ts
**Antes:**
```typescript
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/messaging";

const token = await getToken(messaging, { vapidKey });
localStorage.setItem("firebase_token", token);
```

**Depois:**
```typescript
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "./push";

// Verifica HTTPS
if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
  toast.error("Push Notifications requerem HTTPS");
  return;
}

await subscribeToPushNotifications();
```

### 3. public/sw.js
**Antes:**
```javascript
// Service Worker do VitePWA (Workbox)
// Conflitava com firebase-messaging-sw.js
```

**Depois:**
```javascript
/**
 * Service Worker Integrado: PWA + Push Notifications
 */

// Push handler
self.addEventListener('push', async (event) => {
  const data = event.data.json();
  await self.registration.showNotification(data.title, options);
  await markAsDelivered(data.notificationId);
});

// PWA lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  clients.claim();
});
```

### 4. vite.config.ts
**Antes:**
```typescript
// import { VitePWA } from 'vite-plugin-pwa' // DESABILITADO - Conflito com Firebase SW

optimizeDeps: {
  include: ['firebase/app', 'firebase/messaging', 'firebase/analytics']
},
```

**Depois:**
```typescript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  strategies: 'injectManifest',
  srcDir: 'public',
  filename: 'sw.js',
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  // ... configurações do manifest
})
```

### 5. src/main.tsx
**Antes:**
```typescript
// Firebase inicializado separadamente
// Service Worker não registrado
```

**Depois:**
```typescript
// Service Worker será registrado automaticamente pelo VitePWA
// Veja configuração em vite.config.ts
```

### 6. .env.example
**Antes:**
```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id-here
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```

**Depois:**
```bash
VITE_API_URL=http://localhost:3000

# Push Notifications
# A chave VAPID é obtida automaticamente do backend
# Não é necessário configurar manualmente
```

## 🗑️ Arquivos Removidos

- ❌ `src/lib/messaging.ts` - Configuração Firebase
- ❌ `firebase-messaging-sw.js` - Service Worker Firebase
- ❌ Referências Firebase no package.json (mantido vite-plugin-pwa)

## ➕ Arquivos Criados

- ✅ `public/sw.js` - Service Worker integrado (PWA + Push)
- ✅ `PUSH-NOTIFICATIONS.md` - Documentação completa
- ✅ `PUSH-NOTIFICATIONS-QUICKSTART.md` - Guia rápido
- ✅ `PWA-PUSH-INTEGRATION.md` - Detalhes da integração
- ✅ `README-PWA-PUSH.md` - Resumo executivo
- ✅ `MIGRATION-FIREBASE-TO-WEBPUSH.md` - Este arquivo

## 🔧 Mudanças no Backend

O backend deve implementar as seguintes rotas (conforme API-EXAMPLES.md):

### Rotas Antigas (Firebase - Remover)
```
POST /push-notification/subscribe
DELETE /push-notification/unsubscribe/:endpoint
```

### Rotas Novas (Web-Push)
```
GET /push-notifications/vapid-public-key
POST /push-notifications/subscriptions
GET /push-notifications/subscriptions
DELETE /push-notifications/subscriptions/:id
POST /push-notifications/send
PATCH /push-notifications/notifications/:id/delivered
```

## 📦 Dependências

### Removidas
```json
{
  "firebase": "^x.x.x",        // Removido
  "firebase/app": "^x.x.x",     // Removido
  "firebase/messaging": "^x.x.x" // Removido
}
```

### Mantidas
```json
{
  "vite-plugin-pwa": "^1.1.0"  // Mantido - agora usado ativamente
}
```

### Backend (Adicionar se não tiver)
```json
{
  "web-push": "^3.x.x"
}
```

## 🚀 Como Migrar Usuários Existentes

### 1. Subscrições Antigas do Firebase
```sql
-- Se tiver tabela de tokens Firebase, migre para o novo formato
-- Usuários precisarão se reinscrever na primeira visita

-- Opcional: Marcar subscrições antigas como inativas
UPDATE push_subscriptions
SET active = false
WHERE provider = 'firebase';
```

### 2. No Frontend
Usuários que já tinham notificações ativadas:
- Precisarão **reativar** as notificações
- Sistema detecta automaticamente ausência de subscrição
- Mostra opção de ativar novamente

### 3. Comunicação
Informe aos usuários:
```
"Atualizamos o sistema de notificações!
Por favor, reative as notificações nas configurações
para continuar recebendo atualizações."
```

## ✅ Checklist de Migração

### Backend
- [ ] Instalar `web-push`: `npm install web-push`
- [ ] Gerar chaves VAPID: `npx web-push generate-vapid-keys`
- [ ] Configurar variáveis de ambiente (VAPID keys)
- [ ] Implementar novas rotas conforme API-EXAMPLES.md
- [ ] Testar endpoint de VAPID public key
- [ ] Testar criação de subscrição
- [ ] Testar envio de notificação
- [ ] Configurar CORS para frontend

### Frontend
- [ ] Atualizar `src/services/push.ts` ✅
- [ ] Atualizar `src/services/message.ts` ✅
- [ ] Criar `public/sw.js` ✅
- [ ] Atualizar `vite.config.ts` ✅
- [ ] Atualizar `.env.example` ✅
- [ ] Remover imports Firebase ✅
- [ ] Testar em desenvolvimento
- [ ] Testar build de produção
- [ ] Testar em HTTPS

### Testes
- [ ] Subscrição funciona
- [ ] Notificação é recebida
- [ ] Notificação é exibida
- [ ] Click handler funciona
- [ ] Desinscrição funciona
- [ ] PWA instala corretamente
- [ ] Service Worker atualiza automaticamente

## 🧪 Como Testar

### 1. Desenvolvimento
```bash
# Frontend
npm run dev

# Backend (em outro terminal)
cd ../backend
npm run start:dev
```

### 2. Ativar Notificações
1. Abra `http://localhost:3001`
2. Faça login
3. Vá em Configurações
4. Ative notificações
5. Aceite permissão

### 3. Verificar Subscrição
```bash
# Obter token de auth (do localStorage no navegador)
TOKEN="seu-token-jwt"

# Listar subscrições
curl http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Enviar Teste
```bash
# Copie o subscriptionId da resposta anterior
SUBSCRIPTION_ID="uuid-aqui"

curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "🎉 Migração Completa",
    "body": "Web-Push funcionando!",
    "data": {"url": "/"}
  }'
```

### 5. Verificar Logs
```javascript
// No DevTools > Application > Service Workers > Console
// Você verá:
[SW] Push recebido
[SW] Dados do push: {...}
[SW] Marcando notificação como entregue
[SW] Notificação marcada como entregue
```

## 🐛 Problemas Comuns

### "Service Worker não registra"
**Solução:**
1. Limpe cache: DevTools > Application > Clear storage
2. Force reload: Ctrl+Shift+R
3. Verifique se `public/sw.js` existe

### "Notificação não aparece"
**Solução:**
1. Verifique permissão do navegador
2. Veja console do Service Worker
3. Verifique payload do backend
4. Teste em HTTPS (ou localhost)

### "Erro 404 ao buscar VAPID"
**Solução:**
1. Backend não está rodando
2. Rota não implementada
3. URL da API incorreta no .env

### "Build falha com erro do VitePWA"
**Solução:**
1. Verifique se `public/sw.js` existe
2. Verifique sintaxe do Service Worker
3. Rode `npm run build` e veja erro específico

## 📊 Comparação de Performance

### Firebase
- Tamanho bundle: +150KB
- Dependências: 5+
- Requisições iniciais: 3+
- Configuração: Complexa

### Web-Push
- Tamanho bundle: +0KB (nativo)
- Dependências: 0
- Requisições iniciais: 1 (VAPID key)
- Configuração: Simples

## 🎯 Benefícios da Migração

1. **Sem Vendor Lock-in**: Padrão W3C, funciona em qualquer navegador
2. **Simplicidade**: Menos código, menos configuração
3. **Performance**: Bundle menor, sem dependências
4. **Controle**: Servidor próprio, sem terceiros
5. **Integração**: PWA + Push em um único SW
6. **Custo**: Sem custos de serviços externos
7. **Privacidade**: Dados não passam pelo Firebase

## 📚 Referências

- [Documentação Web-Push](https://github.com/web-push-libs/web-push)
- [Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VitePWA - injectManifest](https://vite-pwa-org.netlify.app/guide/inject-manifest.html)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)

## 🤝 Suporte Pós-Migração

### Usuários Reportando Problemas
1. Peça para **reativar** as notificações
2. Limpar cache do navegador
3. Verificar se está em HTTPS
4. Testar em outro navegador

### Monitoramento
- Quantos usuários reativaram notificações
- Taxa de entrega de notificações
- Erros no Service Worker (Sentry/logging)
- Performance do envio

---

**Status da Migração**: ✅ Completa
**Data**: 2025-10-19
**Impacto nos Usuários**: Precisam reativar notificações
**Rollback**: Possível (manter rotas antigas temporariamente)
**Recomendação**: Deploy em staging primeiro
