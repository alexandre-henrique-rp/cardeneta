# Integração PWA + Push Notifications

Este documento explica como a aplicação integra **PWA (Progressive Web App)** com **Push Notifications** usando um único Service Worker.

## Estratégia de Integração

### Problema Anterior
- VitePWA estava **desabilitado** devido a conflito com Firebase Messaging
- Cada serviço tentava registrar seu próprio Service Worker
- Apenas **um** Service Worker pode controlar um scope

### Solução Implementada
- **Strategy: `injectManifest`** do VitePWA
- Service Worker customizado em [public/sw.js](public/sw.js)
- Integra funcionalidades de **PWA** (cache, offline) + **Push Notifications**
- VitePWA gerencia o registro automaticamente

## Arquitetura

```
┌─────────────────────────────────────────────┐
│           VitePWA (vite.config.ts)          │
│   - Registra SW automaticamente             │
│   - Gera manifest.json                      │
│   - Injeta Workbox (opcional)               │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        Service Worker (public/sw.js)        │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │  PWA Features   │  │ Push Notifications│ │
│  │                 │  │                  │ │
│  │ • Cache assets  │  │ • Receive push   │ │
│  │ • Offline mode  │  │ • Show notif.    │ │
│  │ • Update app    │  │ • Click handler  │ │
│  └─────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────┘
```

## Configuração

### 1. VitePWA (vite.config.ts)

```typescript
VitePWA({
  strategies: 'injectManifest',  // Usa nosso SW customizado
  srcDir: 'public',               // Localização do SW
  filename: 'sw.js',              // Nome do arquivo
  registerType: 'autoUpdate',     // Atualiza automaticamente
  injectRegister: 'auto',         // Registra automaticamente

  manifest: {
    // Configurações do PWA
    name: 'Caderneta App',
    short_name: 'Caderneta',
    // ... outras configs
  },

  injectManifest: {
    // Arquivos para cache
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },

  devOptions: {
    enabled: true,  // PWA ativo em desenvolvimento
  }
})
```

### 2. Service Worker (public/sw.js)

O Service Worker customizado possui duas seções principais:

#### A) Push Notifications Handlers

```javascript
// Recebe push
self.addEventListener('push', async (event) => {
  const data = event.data.json();

  await self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/pwa-192x192.png',
    // ...
  });
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});
```

#### B) PWA Lifecycle Events

```javascript
// Instalação
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  clients.claim();
  // Limpa caches antigos
});
```

## Como Funciona

### Desenvolvimento (`npm run dev`)

1. VitePWA inicia em modo dev (`devOptions.enabled: true`)
2. Service Worker é registrado automaticamente
3. Push notifications funcionam normalmente
4. PWA features disponíveis para teste

### Produção (`npm run build`)

1. VitePWA processa `public/sw.js`
2. Gera versão otimizada em `dist/sw.js`
3. Opcionalmente injeta Workbox para cache avançado
4. Gera `manifest.webmanifest`
5. Tudo é servido em `dist/`

## Benefícios da Integração

### ✅ PWA Features
- App instalável (Add to Home Screen)
- Funciona offline (quando configurado cache)
- Atualizações automáticas
- Ícones e splash screens
- Modo standalone (sem barra do navegador)

### ✅ Push Notifications
- Recebe notificações mesmo com app fechado
- Notificações personalizadas
- Rastreamento de entrega
- Click actions customizados

### ✅ Sem Conflitos
- Um único Service Worker gerencia tudo
- Registro automático pelo VitePWA
- Manutenção simplificada

## Uso

### Para Usuários

1. **Desktop**: Acesse o site, clique em "Instalar" no navegador
2. **Mobile**: Acesse o site, toque em "Adicionar à tela inicial"
3. **Notificações**: Vá em Configurações e ative as notificações

### Para Desenvolvedores

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run serve
```

O Service Worker é registrado automaticamente, não precisa fazer nada!

## Debug

### Ver Service Workers Ativos

1. Abra DevTools (F12)
2. Vá em **Application** > **Service Workers**
3. Você verá o SW registrado com status "activated"

### Ver Manifest

1. DevTools > **Application** > **Manifest**
2. Verá todas as configurações do PWA

### Ver Cache

1. DevTools > **Application** > **Cache Storage**
2. Verá os caches criados pelo Workbox (se habilitado)

### Ver Push Notifications

1. DevTools > **Application** > **Service Workers**
2. Role até "Push" e clique em "Test Push Message"

## Customização

### Adicionar Cache de API

Edite [public/sw.js](public/sw.js) e adicione:

```javascript
// Cache de API
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Mudar Ícones do PWA

1. Substitua `/public/pwa-192x192.png`
2. Substitua `/public/pwa-512x512.png`
3. Rebuild: `npm run build`

### Configurar Offline Fallback

Edite [public/sw.js](public/sw.js):

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/offline.html');
    })
  );
});
```

## Compatibilidade

### Service Workers
- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

### Push Notifications
- ✅ Chrome 42+
- ✅ Firefox 44+
- ⚠️ Safari 16.4+ (iOS/macOS)
- ✅ Edge 17+

### PWA (Instalação)
- ✅ Chrome/Edge (Desktop + Mobile)
- ✅ Safari (iOS 13+, macOS 11.3+)
- ✅ Firefox (Desktop apenas, limitado)
- ✅ Samsung Internet

## Troubleshooting

### Service Worker não atualiza

```bash
# 1. Limpe o cache
# DevTools > Application > Clear storage

# 2. Force update
# DevTools > Application > Service Workers > Update

# 3. Unregister e recarregue
# DevTools > Application > Service Workers > Unregister
```

### PWA não aparece para instalar

1. Verifique se está em **HTTPS** (ou localhost)
2. Verifique se `manifest.json` está acessível
3. Verifique se há ícones válidos
4. Veja console para erros

### Push Notifications não funcionam

1. Verifique se Service Worker está registrado
2. Verifique se permissão foi concedida
3. Veja [PUSH-NOTIFICATIONS.md](PUSH-NOTIFICATIONS.md) para mais detalhes

## Referências

- [VitePWA Documentation](https://vite-pwa-org.netlify.app/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Arquivos Relacionados

- [vite.config.ts](vite.config.ts) - Configuração do VitePWA
- [public/sw.js](public/sw.js) - Service Worker integrado
- [public/manifest.json](public/manifest.json) - Manifest do PWA
- [src/main.tsx](src/main.tsx) - Entry point (SW auto-registrado)
- [PUSH-NOTIFICATIONS.md](PUSH-NOTIFICATIONS.md) - Docs de Push
- [PUSH-NOTIFICATIONS-QUICKSTART.md](PUSH-NOTIFICATIONS-QUICKSTART.md) - Guia rápido

## Próximos Passos

1. **Cache Strategy**: Implementar estratégia de cache para API
2. **Offline Page**: Criar página de fallback offline
3. **Background Sync**: Sincronizar dados quando voltar online
4. **Shortcuts**: Adicionar atalhos ao manifest
5. **Share Target**: Permitir compartilhamento com o app

---

**Última atualização**: 2025-10-19
**Status**: ✅ Funcionando - PWA + Push Notifications integrados
