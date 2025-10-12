# Setup de Push Notifications

## ✅ Implementação Completa

O sistema de Push Notifications foi implementado com sucesso! Siga os passos abaixo para configurar e testar.

## 📋 Passos para Configuração

### 1. Gerar Chaves VAPID

Execute o script para gerar as chaves VAPID:

```bash
cd backend
node scripts/generate-vapid-keys.js
```

Copie as chaves geradas e adicione ao arquivo `backend/.env`:

```env
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seu-email@dominio.com
```

### 2. Executar Migração do Banco de Dados

```bash
cd backend
npx prisma migrate dev --name add_push_subscription
npx prisma generate
```

### 3. Reiniciar o Backend

```bash
cd backend
yarn start:dev
```

### 4. Configurar Frontend

Certifique-se de que o arquivo `frontend/.env` contém:

```env
VITE_API_URL=http://localhost:3000
```

### 5. Adicionar Componente ao Frontend

Edite o arquivo principal do app (ex: `src/App.tsx` ou layout principal) e adicione:

```tsx
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';

function App() {
  return (
    <>
      {/* Seu conteúdo existente */}
      <PushNotificationPrompt />
    </>
  );
}
```

### 6. Rebuild do Frontend

```bash
cd frontend
yarn build
```

## 🧪 Como Testar

### Teste Local (Desenvolvimento)

1. **Inicie o backend:**
   ```bash
   cd backend
   yarn start:dev
   ```

2. **Inicie o frontend:**
   ```bash
   cd frontend
   yarn dev
   ```

3. **Acesse a aplicação** em `http://localhost:3001`

4. **Faça login** na aplicação

5. **Instale o PWA:**
   - Chrome: Clique no ícone de instalação na barra de endereço
   - Edge: Menu → Apps → Instalar este site como app

6. **Aceite as notificações** quando o prompt aparecer

7. **Crie um novo crédito ou débito** em uma wallet

8. **Verifique se a notificação aparece**

### Teste em Produção

⚠️ **IMPORTANTE:** Push Notifications só funcionam em HTTPS!

1. Deploy da aplicação em servidor com HTTPS
2. Configure as variáveis de ambiente
3. Instale o PWA
4. Teste as notificações

## 📁 Arquivos Criados/Modificados

### Backend

**Novos arquivos:**
- `src/push-notification/push-notification.module.ts`
- `src/push-notification/push-notification.service.ts`
- `src/push-notification/push-notification.controller.ts`
- `src/push-notification/dto/create-subscription.dto.ts`
- `src/push-notification/dto/send-notification.dto.ts`
- `scripts/generate-vapid-keys.js`

**Modificados:**
- `prisma/schema.prisma` - Adicionado model `PushSubscription`
- `src/app.module.ts` - Importado `PushNotificationModule`
- `src/api/credt/credt.module.ts` - Importado `PushNotificationModule`
- `src/api/credt/credt.service.ts` - Adicionado trigger de notificação
- `src/api/debit/debit.module.ts` - Importado `PushNotificationModule`
- `src/api/debit/debit.service.ts` - Adicionado trigger de notificação

### Frontend

**Novos arquivos:**
- `public/sw.js` - Service Worker customizado
- `src/hooks/usePushNotification.ts` - Hook para gerenciar notificações
- `src/components/PushNotificationPrompt.tsx` - Componente de UI

**Modificados:**
- `vite.config.ts` - Configurado para usar service worker customizado

### Documentação

- `doc/push-notifications/README.md` - Documentação completa

## 🔧 Funcionalidades Implementadas

### Backend

✅ **Service Genérico Reutilizável**
- Função `sendNotificationToWalletUsers(walletId, notificationData)` pode ser usada em qualquer parte do código

✅ **Triggers Automáticos**
- Ao criar crédito → notifica todos os usuários da wallet
- Ao criar débito → notifica todos os usuários da wallet

✅ **Endpoints API**
- `GET /push-notification/vapid-public-key` - Obter chave pública
- `POST /push-notification/subscribe` - Registrar subscrição
- `DELETE /push-notification/unsubscribe/:endpoint` - Remover subscrição
- `GET /push-notification/subscriptions` - Listar subscrições do usuário
- `POST /push-notification/send` - Enviar notificação manual

### Frontend

✅ **Hook Customizado**
- Gerencia permissões
- Registra/remove subscrições
- Verifica suporte do navegador

✅ **Componentes de UI**
- Prompt automático quando PWA instalado
- Configurações de notificações
- Feedback visual de status

✅ **Service Worker**
- Recebe notificações push
- Exibe notificações
- Gerencia cliques e redirecionamentos

## 🎯 Exemplo de Uso da Função Genérica

Você pode usar a função genérica em qualquer service:

```typescript
// Em qualquer service do backend
constructor(
  private pushNotificationService: PushNotificationService,
) {}

async minhaFuncao() {
  // Enviar notificação para todos os usuários de uma wallet
  await this.pushNotificationService.sendNotificationToWalletUsers(
    'wallet-id-aqui',
    {
      title: 'Título Personalizado',
      message: 'Mensagem personalizada',
      redirectUrl: '/pagina/destino',
      icon: '/icone.png',
    }
  );
}
```

## 📊 Fluxo Completo

```
1. Usuário cria novo registro (crédito/débito)
   ↓
2. Backend salva no banco de dados
   ↓
3. Trigger automático identifica wallet
   ↓
4. Service busca todos os usuários da wallet
   ↓
5. Service busca subscrições de cada usuário
   ↓
6. Notificações enviadas via Web Push
   ↓
7. Service Worker recebe notificação
   ↓
8. Notificação exibida ao usuário
   ↓
9. Usuário clica → redirecionado para /conta/:id
```

## ⚠️ Requisitos

- ✅ HTTPS em produção (obrigatório)
- ✅ Navegador moderno com suporte a Push API
- ✅ PWA instalado
- ✅ Permissão de notificações concedida

## 🐛 Troubleshooting

### Erro: "pushSubscription não existe no tipo PrismaService"

**Solução:** Execute a migração e regenere o Prisma Client:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Notificações não aparecem

**Verificar:**
1. PWA está instalado?
2. Permissão foi concedida?
3. HTTPS está ativo? (obrigatório em produção)
4. Service Worker está registrado?
5. Backend está rodando?

### Service Worker não atualiza

**Solução:** Limpar cache e desregistrar:
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
location.reload();
```

## 📚 Documentação Completa

Consulte `doc/push-notifications/README.md` para documentação detalhada.

## 🎉 Pronto!

O sistema de Push Notifications está implementado e pronto para uso!
