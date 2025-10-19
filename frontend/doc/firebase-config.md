# Configuração do Firebase

## Erro: Missing App configuration value: "messagingSenderId"

Este erro ocorre quando as variáveis de ambiente do Firebase não estão configuradas corretamente.

## Como Corrigir

### 1. Obter as Credenciais do Firebase

#### A) Configuração Básica do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto **pushcardeneta** (ou crie um novo)
3. Clique no ícone de engrenagem ⚙️ > **Configurações do projeto**
4. Role até a seção **Seus aplicativos**
5. Selecione o app web ou clique em **Adicionar app** > **Web**
6. Copie os valores de configuração do Firebase

#### B) Obter a Chave VAPID (Web Push Certificate)

**IMPORTANTE:** Esta chave é necessária para notificações push!

1. No Firebase Console, vá em **Cloud Messaging** (menu lateral esquerdo)
2. Role até a seção **Web Push certificates**
3. Se não houver certificado, clique em **Gerar par de chaves**
4. Copie a **Chave pública** (começa com "B..." e tem ~88 caracteres)

### 2. Configurar o Arquivo .env

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e preencha com os valores do Firebase Console:

   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3000

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123...
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Firebase Cloud Messaging - Web Push Certificate (VAPID Key)
   VITE_VAPID_PUBLIC_KEY=BNdJ5t0Ng-dDD9QQabEFDbHU...
   ```

### 3. Reiniciar o Servidor de Desenvolvimento

Após configurar as variáveis de ambiente, reinicie o servidor:

```bash
npm run dev
# ou
yarn dev
```

## Onde Encontrar Cada Valor

### Configuração do App (Configurações do projeto)

No Firebase Console, após selecionar seu app web, você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",
  projectId: "pushcardeneta",
  storageBucket: "xxx.firebasestorage.app",
  messagingSenderId: "123456789012", // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abc123...", // → VITE_FIREBASE_APP_ID
  measurementId: "G-XXXXXXXXXX"     // → VITE_FIREBASE_MEASUREMENT_ID
};
```

### Chave VAPID (Cloud Messaging)

1. Firebase Console > **Cloud Messaging**
2. Seção **Web Push certificates**
3. Clique em **Gerar par de chaves** (se não houver)
4. Copie a **Chave pública**: `BNdJ5t0Ng-dDD9QQabEF...` → `VITE_VAPID_PUBLIC_KEY`

**Características da chave VAPID:**
- Começa com a letra "B"
- Tem aproximadamente 88 caracteres
- É uma string base64url

## Segurança

⚠️ **IMPORTANTE**: 
- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- Compartilhe as credenciais apenas com membros autorizados da equipe
- Use variáveis de ambiente diferentes para produção

## Habilitar Cloud Messaging

Para que as notificações push funcionem, você também precisa:

1. No Firebase Console, vá em **Cloud Messaging**
2. Habilite a **Cloud Messaging API**
3. Configure as credenciais do servidor no backend

## Verificação

Após configurar, você deve ver no console do navegador:

```
Firebase initialized successfully
```

E o erro `Missing App configuration value` não deve mais aparecer.
