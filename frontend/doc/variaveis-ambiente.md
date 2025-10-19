# Variáveis de Ambiente

## Arquivo .env

O projeto utiliza variáveis de ambiente para configuração. Todas as variáveis que precisam estar disponíveis no cliente devem começar com o prefixo `VITE_`.

### Estrutura do Arquivo

```env
# API Configuration
VITE_API_URL=http://localhost:3030

# Firebase Configuration
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id-aqui
VITE_FIREBASE_APP_ID=seu-app-id-aqui
VITE_FIREBASE_MEASUREMENT_ID=seu-measurement-id-aqui

# Firebase Cloud Messaging - Web Push Certificate (VAPID Key)
VITE_VAPID_PUBLIC_KEY=sua-vapid-key-aqui
```

## ⚠️ IMPORTANTE: Regras do .env

### 1. **NÃO use aspas nos valores**
❌ **ERRADO:**
```env
VITE_FIREBASE_API_KEY="AIzaSyB3wTYytU1__4qJ8Av5ujrsiPhCyZ6gl78"
```

✅ **CORRETO:**
```env
VITE_FIREBASE_API_KEY=AIzaSyB3wTYytU1__4qJ8Av5ujrsiPhCyZ6gl78
```

### 2. **Nomes de variáveis devem estar corretos**
❌ **ERRADO:**
```env
VITE_FIREBASE_MESSAGING_SEND_ID=294604475627  # Falta "ER" no final
```

✅ **CORRETO:**
```env
VITE_FIREBASE_MESSAGING_SENDER_ID=294604475627
```

### 3. **Todas as variáveis devem começar com VITE_**
Para que o Vite exponha as variáveis para o cliente, elas DEVEM começar com o prefixo `VITE_`.

## Como Usar no Código

### ✅ Forma Correta
```typescript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
```

### ❌ Forma Incorreta
```typescript
// NÃO funciona no Vite
const apiKey = process.env.VITE_FIREBASE_API_KEY

// NÃO faça hardcode
const apiKey = "AIzaSyB3wTYytU1__4qJ8Av5ujrsiPhCyZ6gl78"
```

## Variáveis Utilizadas no Projeto

### Backend API
- `VITE_API_URL` - URL da API backend (ex: http://localhost:3030)

### Firebase
- `VITE_FIREBASE_API_KEY` - Chave de API do Firebase
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - ID do remetente para mensagens
- `VITE_FIREBASE_APP_ID` - ID da aplicação Firebase
- `VITE_FIREBASE_MEASUREMENT_ID` - ID para Google Analytics

### Push Notifications
- `VITE_VAPID_PUBLIC_KEY` - Chave pública VAPID para notificações push
  - Obtida em: Firebase Console > Cloud Messaging > Web Push certificates

## Scripts de Verificação

### Verificar Configuração
```bash
node scripts/check-env.js
```

Este script verifica:
- ✅ Se o arquivo `.env` existe
- ✅ Se todas as variáveis obrigatórias estão presentes
- ✅ Se os valores estão configurados (não são placeholders)
- ✅ Se o Vite consegue carregar as variáveis

### Exemplo de Output
```
🔍 Diagnóstico de Variáveis de Ambiente

📁 Diretório raiz: /home/user/projeto/frontend

📄 Verificando arquivos:
  .env: ✅ Existe
  .env.example: ✅ Existe

📋 Conteúdo do .env:
  ✅  VITE_API_URL
  ✅  VITE_FIREBASE_API_KEY
  ✅  VITE_FIREBASE_MESSAGING_SENDER_ID
  ✅  VITE_FIREBASE_APP_ID
  ✅  VITE_FIREBASE_MEASUREMENT_ID
  ✅  VITE_VAPID_PUBLIC_KEY

🔧 Carregando com Vite:

📊 Status das variáveis VITE_:
  ✅ VITE_API_URL: http://localhost:303...
  ✅ VITE_FIREBASE_API_KEY: AIzaSyB3wTYytU1__4qJ...
  ✅ VITE_FIREBASE_MESSAGING_SENDER_ID: 294604475627
  ✅ VITE_FIREBASE_APP_ID: 1:294604475627:web:1...
  ✅ VITE_FIREBASE_MEASUREMENT_ID: G-RBYNPMRQ7P
  ✅ VITE_VAPID_PUBLIC_KEY: BNu_0yArPK-ARc5C7DLm...
```

## Troubleshooting

### Problema: Variáveis não são carregadas
**Solução:**
1. Verifique se o arquivo `.env` está na raiz do projeto `frontend/`
2. Reinicie o servidor de desenvolvimento (`yarn dev`)
3. Limpe o cache do Vite: `rm -rf node_modules/.vite`

### Problema: "Chave VAPID não configurada"
**Solução:**
1. Verifique se `VITE_VAPID_PUBLIC_KEY` está no `.env`
2. Verifique se o nome está correto (sem erros de digitação)
3. Verifique se não há aspas ao redor do valor

### Problema: Firebase não inicializa
**Solução:**
1. Execute: `node scripts/check-env.js`
2. Verifique se todas as variáveis do Firebase estão corretas
3. Verifique o nome: `VITE_FIREBASE_MESSAGING_SENDER_ID` (não `SEND_ID`)

### Problema: Service Worker não é gerado
**Solução:**
1. Execute manualmente: `yarn generate-sw`
2. Verifique se as variáveis estão no `.env`
3. Verifique se o template existe: `public/firebase-messaging-sw.js.template`

## Segurança

### ⚠️ NUNCA faça commit do arquivo .env
O arquivo `.env` está no `.gitignore` e contém credenciais sensíveis.

### ✅ Use .env.example como template
O arquivo `.env.example` serve como template e deve ser commitado.

### 🔒 Em Produção
- Configure as variáveis de ambiente no servidor/plataforma de deploy
- Nunca exponha chaves secretas no código cliente
- Use variáveis diferentes para ambientes diferentes

## Checklist para Novo Ambiente

- [ ] Copiar `.env.example` para `.env`
- [ ] Preencher todas as variáveis obrigatórias
- [ ] Verificar nomes das variáveis (sem erros de digitação)
- [ ] Remover aspas dos valores
- [ ] Executar `node scripts/check-env.js`
- [ ] Executar `yarn generate-sw`
- [ ] Reiniciar servidor de desenvolvimento
- [ ] Testar autenticação e notificações

## Referências

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)
- [FCM Web Push Certificates](https://console.firebase.google.com/project/_/settings/cloudmessaging)
