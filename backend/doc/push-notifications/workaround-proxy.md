# Workaround: Usar Proxy para FCM

Se o servidor VPS não consegue acessar o FCM diretamente devido a restrições de firewall, você pode usar um proxy/relay.

## Opção 1: Cloudflare Workers (Recomendado)

### Passo 1: Criar Worker

1. Acesse https://dash.cloudflare.com/
2. Vá em Workers & Pages > Create Worker
3. Cole o código:

```javascript
export default {
  async fetch(request) {
    // Permitir apenas POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Pegar o body da requisição
    const body = await request.text();
    const headers = {};
    
    // Copiar headers importantes
    for (const [key, value] of request.headers) {
      if (key.toLowerCase().startsWith('authorization') || 
          key.toLowerCase() === 'content-type' ||
          key.toLowerCase() === 'ttl' ||
          key.toLowerCase() === 'urgency') {
        headers[key] = value;
      }
    }

    // Fazer requisição para FCM
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: headers,
      body: body
    });

    // Retornar resposta
    return new Response(fcmResponse.body, {
      status: fcmResponse.status,
      headers: fcmResponse.headers
    });
  }
};
```

4. Deploy
5. Anote a URL: `https://seu-worker.workers.dev`

### Passo 2: Configurar Backend

Adicione no `.env`:
```env
FCM_PROXY_URL=https://seu-worker.workers.dev
```

### Passo 3: Modificar Service

Crie um arquivo de configuração para o proxy:

```typescript
// src/push-notification/push-notification.config.ts
export const pushNotificationConfig = {
  fcmProxyUrl: process.env.FCM_PROXY_URL || null,
  useProxy: !!process.env.FCM_PROXY_URL,
};
```

Modifique o service para usar o proxy quando configurado.

## Opção 2: Servidor Proxy Próprio

Se você tem outro servidor com acesso ao FCM:

### No Servidor com Acesso (Proxy)

```bash
# Instalar nginx
sudo apt install nginx

# Configurar
sudo nano /etc/nginx/sites-available/fcm-proxy
```

```nginx
server {
    listen 8443 ssl;
    server_name seu-proxy.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass https://fcm.googleapis.com;
        proxy_ssl_server_name on;
        proxy_set_header Host fcm.googleapis.com;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Ativar
sudo ln -s /etc/nginx/sites-available/fcm-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### No Servidor VPS (Backend)

Configure para usar o proxy:
```env
HTTPS_PROXY=https://seu-proxy.com:8443
```

## Opção 3: Túnel SSH

Se você tem acesso SSH a outro servidor:

```bash
# No servidor VPS
ssh -L 8443:fcm.googleapis.com:443 user@servidor-com-acesso

# Em outro terminal, configure
export HTTPS_PROXY=http://localhost:8443
```

## Opção 4: Contatar Provedor VPS

Entre em contato com o suporte do provedor e solicite:

1. Liberação da porta 443 de saída
2. Acesso aos domínios do Google (fcm.googleapis.com)
3. Remoção de restrições de firewall

## Teste

Após configurar qualquer opção:

```bash
# Testar conectividade
node scripts/test-fcm-connection.js

# Testar notificação
curl -X POST http://localhost:3000/push-notification/test
```

## Recomendação

**Melhor solução:** Liberar o firewall da VPS (Solução 1 do documento principal)

**Workaround rápido:** Cloudflare Workers (gratuito e rápido de configurar)

**Última opção:** Trocar de provedor VPS para um que não tenha essas restrições
