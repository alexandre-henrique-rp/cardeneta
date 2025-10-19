# Troubleshooting: PWA + Push Notifications

Guia de resolução de problemas para a integração PWA + Push Notifications.

## 🔍 Diagnóstico Rápido

### Verificar Status do Service Worker

```javascript
// Cole no console do navegador (F12)
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations.length);
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('State:', reg.active?.state);
    console.log('Script URL:', reg.active?.scriptURL);
  });
});
```

**Resultado esperado:**
```
Service Workers registrados: 1
Scope: http://localhost:3001/
State: activated
Script URL: http://localhost:3001/sw.js
```

### Verificar Subscrição Push

```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    if (sub) {
      console.log('✅ Inscrito para push');
      console.log('Endpoint:', sub.endpoint);
      console.log('Keys:', sub.toJSON().keys);
    } else {
      console.log('❌ Não inscrito');
    }
  });
});
```

### Verificar Permissões

```javascript
console.log('Notification permission:', Notification.permission);
console.log('Push supported:', 'PushManager' in window);
console.log('Service Worker supported:', 'serviceWorker' in navigator);
```

## 🚨 Problemas Comuns

### 1. Service Worker Não Registra

#### Sintomas
- Console mostra: "Failed to register service worker"
- Application > Service Workers está vazio
- Push notifications não funcionam

#### Possíveis Causas e Soluções

**A) Arquivo sw.js não encontrado**
```bash
# Verificar se existe
ls public/sw.js

# Se não existir, criar conforme documentação
```

**B) Erro de sintaxe no sw.js**
```javascript
// Verificar logs no console
// DevTools > Console
// Procure por erros de JavaScript
```

**C) HTTPS não configurado (produção)**
```bash
# Push API requer HTTPS em produção
# Exceção: localhost em desenvolvimento

# Solução: Configure certificado SSL
```

**D) Service Worker antigo travado**
```javascript
// Desregistrar todos os SWs
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Depois recarregue: Ctrl+Shift+R
```

### 2. Múltiplos Service Workers

#### Sintomas
- Console mostra vários SWs registrados
- Comportamento inconsistente
- Push funciona às vezes

#### Solução
```javascript
// 1. Ver todos os SWs
navigator.serviceWorker.getRegistrations().then(console.log);

// 2. Desregistrar todos
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => {
    console.log('Desregistrando:', reg.scope);
    reg.unregister();
  });
});

// 3. Limpar cache
// DevTools > Application > Clear storage > Clear site data

// 4. Recarregar: Ctrl+Shift+R
```

### 3. Push Subscription Falha

#### Sintomas
- Erro ao ativar notificações
- Console: "Failed to subscribe"
- Permissão foi concedida mas não funciona

#### Diagnóstico
```javascript
// Teste manual
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'SUA-CHAVE-VAPID-AQUI'
  }).then(sub => {
    console.log('✅ Subscrição OK:', sub);
  }).catch(err => {
    console.error('❌ Erro na subscrição:', err);
  });
});
```

#### Soluções

**A) Chave VAPID inválida**
```bash
# Verificar endpoint do backend
curl http://localhost:3000/push-notifications/vapid-public-key

# Deve retornar:
# {"publicKey": "BNgF8o..."}
```

**B) Permissão negada**
```javascript
// Verificar permissão
console.log(Notification.permission);

// Se "denied", usuário precisa:
// 1. Ir em Configurações do navegador
// 2. Site settings > Permissions > Notifications
// 3. Mudar para "Allow"
```

**C) Backend não responde**
```bash
# Testar backend
curl http://localhost:3000/push-notifications/vapid-public-key \
  -v

# Verificar:
# - Status 200
# - CORS headers
# - JSON válido
```

### 4. Notificação Não Aparece

#### Sintomas
- Subscrição OK
- Backend envia push
- Notificação não exibe

#### Diagnóstico
```javascript
// Ver logs do Service Worker
// DevTools > Application > Service Workers
// Clique no link "sw.js" > Console

// Envie uma notificação e veja os logs
```

#### Soluções

**A) Push handler com erro**
```javascript
// Adicione try-catch no sw.js
self.addEventListener('push', async (event) => {
  try {
    const data = event.data.json();
    console.log('📨 Push recebido:', data);
    // ... resto do código
  } catch (error) {
    console.error('❌ Erro no push handler:', error);
  }
});
```

**B) Payload inválido**
```bash
# Verificar formato do payload
# Deve ser JSON com campos obrigatórios:
{
  "title": "Título",
  "body": "Mensagem"
}
```

**C) Permissão revogada**
```javascript
// Verificar permissão novamente
if (Notification.permission !== 'granted') {
  await Notification.requestPermission();
}
```

**D) Service Worker inativo**
```javascript
// Forçar ativação
self.skipWaiting();
self.clients.claim();
```

### 5. PWA Não Instala

#### Sintomas
- Botão "Instalar" não aparece
- Prompt de instalação não mostra
- Chrome não oferece instalação

#### Verificações

**A) Manifest válido**
```javascript
// Verificar manifest
// DevTools > Application > Manifest

// Deve mostrar:
// - Name
// - Icons (192x192, 512x512)
// - Start URL
// - Display: standalone
```

**B) HTTPS necessário**
```
PWA só instala em:
- HTTPS em produção
- localhost em desenvolvimento
```

**C) Service Worker registrado**
```javascript
// Verificar SW
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', reg ? '✅' : '❌');
});
```

**D) Critérios de instalação**
```
Chrome requer:
1. Manifest válido
2. Service Worker registrado
3. HTTPS
4. Ícones de tamanho adequado (192x192, 512x512)
5. start_url que funciona
```

### 6. Service Worker Não Atualiza

#### Sintomas
- Mudanças no sw.js não aparecem
- Versão antiga permanece ativa
- Push handler antigo executa

#### Soluções

**A) Forçar atualização**
```javascript
// DevTools > Application > Service Workers
// Clique em "Update"

// Ou via código
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});
```

**B) skipWaiting não funciona**
```javascript
// No sw.js, force instalação imediata
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão...');
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(clients.claim()); // Toma controle imediato
});
```

**C) Cache do navegador**
```bash
# Limpar completamente
# DevTools > Application > Clear storage
# Marcar tudo > Clear site data

# Depois: Ctrl+Shift+R
```

**D) Hard reload**
```
1. Abra DevTools (F12)
2. Clique com botão direito no reload
3. Escolha "Empty Cache and Hard Reload"
```

### 7. CORS Errors

#### Sintomas
- Erro: "CORS policy blocked"
- Push subscription falha
- Backend não responde

#### Solução (Backend)

**NestJS:**
```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://contas.kingdevtec.com'
  ],
  credentials: true,
});
```

**Express:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://contas.kingdevtec.com'
  ],
  credentials: true
}));
```

### 8. VitePWA Build Errors

#### Sintomas
- Build falha com erro do VitePWA
- "Unable to find sw.js"
- Workbox erros

#### Soluções

**A) Verificar configuração**
```typescript
// vite.config.ts
VitePWA({
  strategies: 'injectManifest',  // ✅ Importante!
  srcDir: 'public',              // ✅ Onde está o sw.js
  filename: 'sw.js',             // ✅ Nome do arquivo
  // ...
})
```

**B) Verificar arquivo existe**
```bash
# Deve existir
ls public/sw.js

# Se não existir, copiar da documentação
```

**C) Sintaxe do sw.js**
```bash
# Testar sintaxe
node -c public/sw.js

# Se houver erro, corrigir JavaScript
```

## 🧪 Testes de Diagnóstico

### Script Completo de Diagnóstico

Cole no console do navegador:

```javascript
async function diagnosticoPWAPush() {
  console.log('🔍 Iniciando diagnóstico...\n');

  // 1. Service Worker
  console.log('1️⃣ SERVICE WORKER');
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log(`Registrados: ${registrations.length}`);
  registrations.forEach(reg => {
    console.log(`  - Scope: ${reg.scope}`);
    console.log(`  - State: ${reg.active?.state}`);
  });

  // 2. Permissões
  console.log('\n2️⃣ PERMISSÕES');
  console.log(`Notification: ${Notification.permission}`);
  console.log(`Push API: ${'PushManager' in window ? '✅' : '❌'}`);
  console.log(`Service Worker API: ${'serviceWorker' in navigator ? '✅' : '❌'}`);

  // 3. Subscrição
  console.log('\n3️⃣ SUBSCRIÇÃO PUSH');
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    console.log('✅ Inscrito');
    console.log(`  - Endpoint: ${sub.endpoint.substring(0, 50)}...`);
    console.log(`  - Keys: ${Object.keys(sub.toJSON().keys).join(', ')}`);
  } else {
    console.log('❌ Não inscrito');
  }

  // 4. Manifest
  console.log('\n4️⃣ MANIFEST (PWA)');
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log(`✅ Link presente: ${manifestLink.href}`);
    try {
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      console.log(`  - Name: ${manifest.name || manifest.short_name}`);
      console.log(`  - Icons: ${manifest.icons?.length || 0}`);
      console.log(`  - Display: ${manifest.display}`);
    } catch (e) {
      console.error('❌ Erro ao carregar manifest:', e);
    }
  } else {
    console.log('❌ Link não encontrado');
  }

  // 5. Protocolo
  console.log('\n5️⃣ PROTOCOLO');
  console.log(`URL: ${window.location.href}`);
  console.log(`HTTPS: ${window.location.protocol === 'https:' ? '✅' : '⚠️  localhost only'}`);

  console.log('\n✅ Diagnóstico completo!');
}

diagnosticoPWAPush();
```

## 📞 Quando Pedir Ajuda

Se após seguir este guia você ainda tiver problemas:

1. **Colete informações:**
   - Resultado do script de diagnóstico
   - Console do navegador (erros)
   - Console do Service Worker
   - Logs do backend

2. **Teste em outro navegador:**
   - Chrome
   - Firefox
   - Edge

3. **Verifique documentação:**
   - [PUSH-NOTIFICATIONS.md](PUSH-NOTIFICATIONS.md)
   - [PWA-PUSH-INTEGRATION.md](PWA-PUSH-INTEGRATION.md)

4. **Abra issue com:**
   - Descrição do problema
   - Passos para reproduzir
   - Resultado do diagnóstico
   - Navegador e versão
   - Sistema operacional

## 🔗 Links Úteis

- [Can I Use - Push API](https://caniuse.com/push-api)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)
- [Can I Use - Web App Manifest](https://caniuse.com/web-app-manifest)
- [Chrome DevTools - Service Workers](https://developer.chrome.com/docs/devtools/progressive-web-apps/)

---

**Última atualização**: 2025-10-19
**Mantenedor**: Claude Code
