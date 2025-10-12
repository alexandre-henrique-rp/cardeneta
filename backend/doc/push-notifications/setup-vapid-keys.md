# Configuração de Chaves VAPID

Este guia explica como gerar e configurar as chaves VAPID para Push Notifications.

## Passo 1: Gerar Chaves VAPID

Execute o script de geração:

```bash
cd backend
node scripts/generate-vapid-keys.js
```

O script irá gerar algo como:

```
🔑 Gerando chaves VAPID...

✅ Chaves geradas com sucesso!

Adicione estas chaves ao arquivo .env do backend:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VAPID_PUBLIC_KEY=BJFevml2KSDz_ItAZXO6j9OPsM5HXv5zf65B0KF-RD1o...
VAPID_PRIVATE_KEY=t7pWOQXxm4Hk9ECEcTEqu8KE2qCoCBLEmfnOjCbDki0
VAPID_SUBJECT=mailto:seu-email@dominio.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANTE: Mantenha a chave privada em segredo!
```

## Passo 2: Configurar Backend

Adicione as chaves no arquivo **`backend/.env`**:

```env
# Push Notifications - VAPID Keys
VAPID_PUBLIC_KEY=BJFevml2KSDz_ItAZXO6j9OPsM5HXv5zf65B0KF-RD1o...
VAPID_PRIVATE_KEY=t7pWOQXxm4Hk9ECEcTEqu8KE2qCoCBLEmfnOjCbDki0
VAPID_SUBJECT=mailto:kingdevtec@gmail.com
```

**⚠️ Importante:**
- **NÃO** use aspas nas chaves
- O `VAPID_SUBJECT` deve ser um email válido no formato `mailto:seu@email.com`
- **NUNCA** commite o arquivo `.env` com as chaves reais

## Passo 3: Configurar Frontend

Adicione **APENAS a chave PÚBLICA** no arquivo **`frontend/.env`**:

```env
# API URL
VITE_API_URL=https://apiconta.kingdevtec.com

# Push Notifications - VAPID Public Key
VITE_VAPID_PUBLIC_KEY=BJFevml2KSDz_ItAZXO6j9OPsM5HXv5zf65B0KF-RD1o...
```

**⚠️ Importante:**
- Use a **MESMA** chave pública do backend
- **NUNCA** coloque a chave privada no frontend
- O frontend agora usa a chave do `.env` ao invés de buscar do backend

## Passo 4: Limpar Subscrições Antigas

Se você já tinha chaves VAPID configuradas anteriormente, precisa limpar as subscrições antigas:

```bash
cd backend
node scripts/reset-subscriptions.js
```

Isso remove todas as subscrições antigas que foram criadas com chaves diferentes.

## Passo 5: Reiniciar Serviços

### Backend

```bash
# Desenvolvimento
npm run start:dev

# Produção
pm2 restart backend
```

### Frontend

```bash
# Rebuild
npm run build

# Deploy para produção
# (copiar arquivos de dist/ para o servidor web)
```

## Passo 6: Testar

### 1. Verificar Chaves no Backend

```bash
cd backend
node scripts/check-vapid-keys.js
```

Deve mostrar:
```
✅ Todas as chaves VAPID estão configuradas!
✅ Chaves VAPID são válidas!
```

### 2. Testar Conectividade com FCM

```bash
node scripts/test-fcm-connection.js
```

Deve mostrar:
```
✅ Conectado com sucesso!
```

### 3. Criar Nova Subscrição

1. Abra o app no navegador/celular
2. Faça logout (se estiver logado)
3. Faça login novamente
4. Quando aparecer o pedido de permissão para notificações, clique em **Permitir**

### 4. Enviar Notificação de Teste

```bash
cd backend

# Testar com dados do banco
node scripts/test-real-notification.js

# Ou via API
curl -X POST https://apiconta.kingdevtec.com/push-notification/test \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔔 Teste",
    "message": "Notificação funcionando!"
  }'
```

Se tudo estiver correto, a notificação aparecerá no dispositivo! 🎉

## Troubleshooting

### Erro 403: "VAPID credentials do not correspond"

**Causa:** As subscrições foram criadas com chaves VAPID diferentes.

**Solução:**
```bash
# Limpar subscrições
node scripts/reset-subscriptions.js

# Fazer login novamente no app
```

### Erro: "VITE_VAPID_PUBLIC_KEY is not defined"

**Causa:** Variável não configurada no frontend ou build não foi feito após adicionar.

**Solução:**
```bash
cd frontend

# Verificar se está no .env
cat .env | grep VITE_VAPID_PUBLIC_KEY

# Rebuild
npm run build
```

### Erro: "ETIMEDOUT"

**Causa:** Servidor não consegue conectar ao FCM.

**Solução:** Veja [troubleshooting-timeout.md](./troubleshooting-timeout.md)

### Erro: "Chave VAPID não configurada"

**Causa:** Variável `VITE_VAPID_PUBLIC_KEY` não está no `.env` do frontend.

**Solução:**
```bash
# Adicionar no frontend/.env
echo "VITE_VAPID_PUBLIC_KEY=sua_chave_aqui" >> frontend/.env

# Rebuild
npm run build
```

## Segurança

### ✅ Boas Práticas

- **Gere as chaves UMA VEZ** e use as mesmas em todos os ambientes
- **Documente** as chaves em um gerenciador de senhas seguro
- **Use variáveis de ambiente** no servidor de produção
- **Adicione** `.env` no `.gitignore`
- **Commit** apenas o `.env.example` com valores de exemplo

### ❌ Nunca Faça

- Nunca commite o arquivo `.env` com chaves reais
- Nunca compartilhe a chave privada publicamente
- Nunca coloque a chave privada no frontend
- Nunca hardcode as chaves no código

## Verificação de Segurança

Execute este checklist:

```bash
# 1. Verificar se .env está no .gitignore
grep -r "\.env" .gitignore

# 2. Verificar se não há chaves hardcoded
grep -r "VAPID_PRIVATE_KEY" src/

# 3. Verificar histórico do git
git log --all --full-history -- "*/.env"
```

## Exemplo de .env

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cardeneta

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# Push Notifications
VAPID_PUBLIC_KEY=BJFevml2KSDz_ItAZXO6j9OPsM5HXv5zf65B0KF-RD1o...
VAPID_PRIVATE_KEY=t7pWOQXxm4Hk9ECEcTEqu8KE2qCoCBLEmfnOjCbDki0
VAPID_SUBJECT=mailto:kingdevtec@gmail.com

# Server
PORT=3000
URL_BASE_API=https://apiconta.kingdevtec.com
```

### Frontend (`frontend/.env`)

```env
# API Configuration
VITE_API_URL=https://apiconta.kingdevtec.com

# Push Notifications
VITE_VAPID_PUBLIC_KEY=BJFevml2KSDz_ItAZXO6j9OPsM5HXv5zf65B0KF-RD1o...
```

## Referências

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
