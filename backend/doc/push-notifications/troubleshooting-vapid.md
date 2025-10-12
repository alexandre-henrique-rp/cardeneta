# Troubleshooting: Erro ao Enviar Push Notifications

## Problema

Erro ao enviar notificações push:
```
[PushNotificationService] Erro ao enviar notificação de teste para https://fcm.googleapis.com/...
```

## Causa Raiz

As **chaves VAPID** usadas para criar as subscrições no frontend são **diferentes** das chaves configuradas no backend. Isso acontece quando:

1. As chaves VAPID não estão configuradas no `.env`
2. As chaves foram alteradas após criar subscrições
3. Usando chaves padrão de desenvolvimento que não correspondem

## Solução

### Passo 1: Verificar Chaves VAPID

Execute o script de verificação:

```bash
cd backend
node scripts/check-vapid-keys.js
```

### Passo 2: Configurar Chaves no .env

Se as chaves não estiverem configuradas, o script irá gerar novas. Adicione ao `.env`:

```env
VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_SUBJECT=mailto:seu-email@dominio.com
```

**IMPORTANTE:** Use as mesmas chaves que foram usadas para criar as subscrições!

### Passo 3: Limpar Subscrições Antigas

Se você alterou as chaves VAPID, precisa limpar as subscrições antigas:

```sql
-- Conectar ao banco de dados
psql -U seu_usuario -d seu_banco

-- Limpar todas as subscrições
DELETE FROM "PushSubscription";
```

Ou usando Prisma Studio:
```bash
npx prisma studio
```

### Passo 4: Reiniciar Backend

```bash
pm2 restart backend
# ou
npm run start:dev
```

### Passo 5: Recriar Subscrições

1. Abra o frontend
2. Faça logout
3. Faça login novamente
4. Permita notificações quando solicitado
5. O sistema criará novas subscrições com as chaves corretas

### Passo 6: Testar

```bash
curl -X POST http://localhost:3000/push-notification/test \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔔 Teste",
    "message": "Testando após configurar VAPID"
  }'
```

## Verificação

Se tudo estiver correto, você verá:

```json
{
  "success": true,
  "message": "Notificação de teste enviada com sucesso!",
  "total": 1,
  "sent": 1,
  "failed": 0
}
```

E a notificação aparecerá no dispositivo!

## Prevenção

### Para Desenvolvimento

1. **Gere as chaves VAPID uma vez:**
   ```bash
   node scripts/check-vapid-keys.js
   ```

2. **Adicione ao .env e .env.example:**
   ```env
   # Push Notifications - VAPID Keys
   VAPID_PUBLIC_KEY=sua_chave_publica
   VAPID_PRIVATE_KEY=sua_chave_privada
   VAPID_SUBJECT=mailto:dev@seudominio.com
   ```

3. **Commit o .env.example** (sem as chaves reais)

4. **Nunca altere as chaves** após criar subscrições

### Para Produção

1. Configure as chaves VAPID nas variáveis de ambiente do servidor
2. Use o mesmo par de chaves em todos os ambientes (dev, staging, prod)
3. Documente as chaves em um gerenciador de senhas seguro
4. Se precisar trocar as chaves, planeje uma migração:
   - Notifique os usuários
   - Limpe as subscrições antigas
   - Peça para os usuários fazerem login novamente

## Erros Comuns

### Erro: "UnauthorizedRegistration"
**Causa:** Chaves VAPID não correspondem
**Solução:** Siga os passos acima

### Erro: "InvalidSubscription"
**Causa:** Subscrição expirada ou inválida
**Solução:** Limpar subscrição do banco e recriar

### Erro: "Gone (410)"
**Causa:** Usuário desinstalou o app ou revogou permissões
**Solução:** O sistema remove automaticamente

### Erro: "BadRequest (400)"
**Causa:** Payload da notificação inválido
**Solução:** Verificar formato do JSON

## Debug Avançado

### Ver Logs Detalhados

O service agora loga informações detalhadas:

```
[PushNotificationService] Erro ao enviar notificação de teste para https://...
[PushNotificationService] Status: 401
[PushNotificationService] Mensagem: UnauthorizedRegistration
[PushNotificationService] Body: {"error":"UnauthorizedRegistration"}
```

### Verificar Subscrições no Banco

```sql
SELECT 
  id,
  "userId",
  endpoint,
  "userAgent",
  "createdAt"
FROM "PushSubscription"
ORDER BY "createdAt" DESC;
```

### Testar Manualmente

```javascript
const webpush = require('web-push');

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:test@example.com',
  'sua_chave_publica',
  'sua_chave_privada'
);

// Testar envio
const subscription = {
  endpoint: 'https://fcm.googleapis.com/...',
  keys: {
    p256dh: 'chave_p256dh',
    auth: 'chave_auth'
  }
};

const payload = JSON.stringify({
  title: 'Teste',
  body: 'Mensagem de teste'
});

webpush.sendNotification(subscription, payload)
  .then(() => console.log('✅ Sucesso!'))
  .catch(err => console.error('❌ Erro:', err));
```

## Referências

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
