# Push Notifications - Quick Start Guide

Guia rápido para começar a usar Push Notifications no projeto.

## 1️⃣ Pré-requisitos

### Backend
- Backend rodando com as chaves VAPID configuradas
- Rotas de push notifications disponíveis

### Frontend
- Node.js instalado
- Projeto clonado

## 2️⃣ Configuração (2 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Editar o .env (se necessário)
# VITE_API_URL=http://localhost:3000
```

## 3️⃣ Executar (1 minuto)

```bash
# Modo desenvolvimento
npm run dev

# Ou build + preview
npm run build && npm run serve
```

## 4️⃣ Testar (3 minutos)

### No Navegador

1. Abra `http://localhost:3001`
2. Faça login na aplicação
3. Vá em **Configurações** ou onde o toggle de notificações estiver
4. Clique em **"Ativar Notificações"**
5. Aceite a permissão quando o navegador solicitar
6. ✅ Pronto! Você está inscrito

### Verificar se Funcionou

Abra o DevTools (F12):

1. **Console** - Deve mostrar:
   ```
   Service Worker registrado com sucesso: http://localhost:3001/
   Push Notifications ativadas
   ```

2. **Application > Service Workers** - Deve mostrar:
   ```
   Status: activated and is running
   Source: /sw.js
   ```

3. **Application > Storage > Local Storage** - Deve ter:
   ```
   token: seu-jwt-token
   ```

## 5️⃣ Enviar Notificação de Teste

### Opção 1: Via cURL

```bash
# 1. Obter token JWT (copie do localStorage do navegador)
TOKEN="seu-token-aqui"

# 2. Listar subscrições para pegar o ID
curl -X GET http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer $TOKEN"

# 3. Copiar o "id" da subscrição e enviar notificação
SUBSCRIPTION_ID="id-copiado-aqui"

curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "🎉 Teste de Notificação",
    "body": "Se você está vendo isso, funcionou!",
    "data": {
      "url": "/",
      "test": true
    }
  }'
```

### Opção 2: Via Postman/Insomnia

**POST** `http://localhost:3000/push-notifications/send`

Headers:
```
Authorization: Bearer seu-token-jwt
Content-Type: application/json
```

Body:
```json
{
  "subscriptionId": "uuid-da-subscricao",
  "title": "🎉 Teste de Notificação",
  "body": "Se você está vendo isso, funcionou!",
  "data": {
    "url": "/",
    "test": true
  }
}
```

### Opção 3: Via Backend (Código)

Se você tiver acesso ao código do backend, pode criar um endpoint de teste:

```typescript
// No seu controller de push notifications
@Post('test')
async sendTestNotification(@Request() req) {
  const userId = req.user.id;

  // Busca primeira subscrição do usuário
  const subscription = await this.prisma.pushSubscription.findFirst({
    where: { userId }
  });

  if (!subscription) {
    throw new NotFoundException('Nenhuma subscrição encontrada');
  }

  // Envia notificação de teste
  return this.pushNotificationService.sendNotification({
    subscriptionId: subscription.id,
    title: '🎉 Notificação de Teste',
    body: 'Parabéns! Suas notificações estão funcionando.',
    data: {
      url: '/',
      test: true
    }
  });
}
```

## 6️⃣ Debug

### Console do Service Worker

1. F12 > Application > Service Workers
2. Clique no link "sw.js" para ver o código
3. Clique em "Console" no canto inferior
4. Envie uma notificação de teste
5. Você verá logs como:
   ```
   [Service Worker] Push recebido
   [Service Worker] Dados do push: {...}
   [Service Worker] Marcando notificação como entregue
   ```

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Este navegador não suporta notificações" | Use Chrome, Firefox ou Edge recente |
| "Push Notifications requerem HTTPS" | Use localhost ou configure HTTPS |
| Service Worker não registra | Verifique se `/public/sw.js` existe |
| Notificação não aparece | Verifique permissão e console do SW |
| Erro 401 ao enviar | Token JWT inválido ou expirado |
| Erro 404 na subscrição | Backend não está rodando ou URL errada |

## 7️⃣ Próximos Passos

### Personalizar Notificações

Edite [public/sw.js](public/sw.js:20-40) para customizar:
- Ícones
- Sons
- Vibração
- Ações (botões)
- Comportamento ao clicar

### Adicionar Ícones

Crie ícones para as notificações:
- `/public/icon-192x192.png` - Ícone grande
- `/public/badge-72x72.png` - Ícone pequeno (badge)

### Integrar com sua UI

Use o hook `usePushNotification` em qualquer componente:

```typescript
import { usePushNotification } from '@/hooks/usePushNotification';

function NotificationButton() {
  const { isSubscribed, subscribe, unsubscribe } = usePushNotification();

  return (
    <button onClick={() => isSubscribed ? unsubscribe() : subscribe()}>
      {isSubscribed ? 'Desativar' : 'Ativar'} Notificações
    </button>
  );
}
```

### Deploy em Produção

**Checklist:**
- [ ] HTTPS configurado
- [ ] Backend em HTTPS
- [ ] CORS configurado
- [ ] Variáveis de ambiente atualizadas
- [ ] Ícones criados
- [ ] Testado em diferentes navegadores

## 📚 Documentação Completa

Para mais detalhes, veja:
- [PUSH-NOTIFICATIONS.md](PUSH-NOTIFICATIONS.md) - Documentação completa
- [API-EXAMPLES.md](API-EXAMPLES.md) - Exemplos da API
- [public/sw.js](public/sw.js) - Código do Service Worker
- [src/services/push.ts](src/services/push.ts) - Service de push
- [src/hooks/usePushNotification.ts](src/hooks/usePushNotification.ts) - Hook React

## 🆘 Ajuda

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique o console do Service Worker (F12 > Application > Service Workers)
3. Verifique os logs do backend
4. Consulte a documentação completa
5. Teste em outro navegador

---

**Tempo total estimado:** ~6 minutos ⏱️
**Nível de dificuldade:** Fácil 🟢
