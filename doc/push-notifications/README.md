# Push Notifications - Documentação

## Visão Geral

Sistema de notificações push implementado para notificar usuários sobre novos registros (créditos e débitos) em suas wallets compartilhadas.

## Arquitetura

### Backend (NestJS)

#### Estrutura de Arquivos
```
backend/src/
├── push-notification/
│   ├── push-notification.module.ts
│   ├── push-notification.service.ts
│   ├── push-notification.controller.ts
│   └── dto/
│       ├── create-subscription.dto.ts
│       └── send-notification.dto.ts
├── api/
│   ├── credt/credt.service.ts (integrado)
│   └── debit/debit.service.ts (integrado)
└── prisma/schema.prisma (modelo PushSubscription adicionado)
```

#### Funcionalidades

1. **PushNotificationService** - Service genérico e reutilizável
   - `createSubscription()` - Registra subscrição de dispositivo
   - `removeSubscription()` - Remove subscrição
   - `sendNotificationToWalletUsers()` - **Função genérica** para enviar notificações
   - `getUserSubscriptions()` - Lista subscrições do usuário
   - `getVapidPublicKey()` - Retorna chave pública VAPID

2. **Triggers Automáticos**
   - Ao criar um crédito → notifica todos os usuários da wallet
   - Ao criar um débito → notifica todos os usuários da wallet
   - Mensagem personalizada com valor e descrição
   - Redirecionamento para `/conta/:id`

### Frontend (React + Vite)

#### Estrutura de Arquivos
```
frontend/
├── public/
│   └── sw.js (Service Worker customizado)
├── src/
│   ├── hooks/
│   │   └── usePushNotification.ts
│   └── components/
│       └── PushNotificationPrompt.tsx
```

#### Funcionalidades

1. **usePushNotification** - Hook customizado
   - Verifica suporte do navegador
   - Gerencia permissões
   - Registra/remove subscrições
   - Comunica com backend

2. **PushNotificationPrompt** - Componente de UI
   - Prompt automático quando PWA instalado
   - Solicita permissão de notificações
   - Configurações de notificações

3. **Service Worker**
   - Recebe notificações push
   - Exibe notificações ao usuário
   - Gerencia cliques e redirecionamentos

## Configuração

### 1. Gerar Chaves VAPID

As chaves VAPID são necessárias para autenticar o servidor ao enviar notificações.

```bash
cd backend
npx web-push generate-vapid-keys
```

Isso gerará algo como:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
Private Key: UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
```

### 2. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` do backend:

```env
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seu-email@dominio.com
```

### 3. Executar Migração do Prisma

```bash
cd backend
npx prisma migrate dev --name add_push_subscription
npx prisma generate
```

### 4. Configurar Frontend

Adicione ao arquivo `.env` do frontend:

```env
VITE_API_URL=http://localhost:3000
```

### 5. Instalar Dependências

Backend:
```bash
cd backend
yarn add web-push
yarn add -D @types/web-push
```

Frontend (já instalado):
```bash
cd frontend
yarn install
```

## Uso

### Enviar Notificação Manualmente

Você pode usar a função genérica `sendNotificationToWalletUsers` em qualquer parte do código:

```typescript
// Exemplo de uso em qualquer service
await this.pushNotificationService.sendNotificationToWalletUsers(
  walletId,
  {
    title: 'Título da Notificação',
    message: 'Mensagem da notificação',
    redirectUrl: '/pagina/destino',
    icon: '/icone.png',
  }
);
```

### Endpoint Manual

Você também pode enviar notificações via API:

```bash
POST /push-notification/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": "uuid-da-wallet",
  "title": "Título",
  "message": "Mensagem",
  "redirectUrl": "/conta/123"
}
```

### Integração no Frontend

Adicione o componente ao layout principal:

```tsx
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';

function App() {
  return (
    <>
      {/* Seu conteúdo */}
      <PushNotificationPrompt />
    </>
  );
}
```

Para configurações:

```tsx
import { PushNotificationSettings } from '@/components/PushNotificationPrompt';

function Settings() {
  return (
    <div>
      <h2>Configurações</h2>
      <PushNotificationSettings />
    </div>
  );
}
```

## Fluxo de Funcionamento

1. **Usuário instala PWA**
2. **Prompt automático** solicita permissão de notificações
3. **Usuário aceita** → subscrição é registrada no backend
4. **Novo registro criado** em uma wallet
5. **Backend identifica** todos os usuários da wallet
6. **Notificações enviadas** para todos os dispositivos registrados
7. **Service Worker recebe** e exibe notificação
8. **Usuário clica** → redirecionado para `/conta/:id`

## Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Chaves VAPID em variáveis de ambiente
- ✅ HTTPS obrigatório em produção
- ✅ Validação de permissões de usuário
- ✅ Limpeza automática de subscrições inválidas

## Testes

### Testar Notificações

1. Instale o PWA
2. Aceite as notificações
3. Crie um novo crédito ou débito
4. Verifique se a notificação aparece

### Verificar Subscrições

```bash
GET /push-notification/subscriptions
Authorization: Bearer {token}
```

## Troubleshooting

### Notificações não aparecem

1. Verificar se o PWA está instalado
2. Verificar permissões do navegador
3. Verificar se HTTPS está ativo (obrigatório)
4. Verificar console do Service Worker
5. Verificar logs do backend

### Erro ao registrar subscrição

1. Verificar chaves VAPID no `.env`
2. Verificar se o Prisma Client foi regenerado
3. Verificar se a migração foi executada
4. Verificar conexão com backend

### Service Worker não atualiza

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

Depois recarregue a página.

## Próximas Melhorias

- [ ] Notificações agrupadas por wallet
- [ ] Configuração de preferências de notificação
- [ ] Notificações silenciosas para sincronização
- [ ] Analytics de notificações
- [ ] Suporte a notificações ricas (imagens, ações)
- [ ] Agendamento de notificações
- [ ] Notificações recorrentes (lembretes)

## Referências

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push library](https://github.com/web-push-libs/web-push)
