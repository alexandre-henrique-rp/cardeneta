# Troubleshooting: ETIMEDOUT - Timeout ao Enviar Notificações

## Problema

Erro ao enviar notificações push:
```
AggregateError [ETIMEDOUT]
"code": "ETIMEDOUT"
```

## Causa

O servidor **não consegue estabelecer conexão** com o Firebase Cloud Messaging (FCM). Isso é um problema de **rede/conectividade**.

## Diagnóstico

### 1. Verificar Conectividade com FCM

```bash
# Testar se consegue acessar o FCM
curl -v https://fcm.googleapis.com/

# Testar DNS
nslookup fcm.googleapis.com

# Testar ping
ping -c 4 fcm.googleapis.com

# Testar com timeout
timeout 10 curl https://fcm.googleapis.com/
```

### 2. Verificar Proxy/VPN

```bash
# Ver variáveis de proxy
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY

# Testar sem proxy
unset HTTP_PROXY
unset HTTPS_PROXY
curl https://fcm.googleapis.com/
```

### 3. Verificar Firewall

```bash
# Ubuntu/Debian
sudo ufw status
sudo iptables -L -n | grep 443

# CentOS/RHEL
sudo firewall-cmd --list-all
```

### 4. Verificar Conectividade do Servidor

```bash
# Testar conectividade geral
ping -c 4 8.8.8.8

# Testar DNS
nslookup google.com

# Testar HTTPS
curl -I https://google.com
```

## Soluções

### Solução 1: Configurar Proxy (se necessário)

Se o servidor usa proxy, configure no Node.js:

#### Opção A: Variáveis de Ambiente

Adicione no `.env`:
```env
HTTP_PROXY=http://proxy.empresa.com:8080
HTTPS_PROXY=http://proxy.empresa.com:8080
NO_PROXY=localhost,127.0.0.1
```

#### Opção B: Configurar no Código

Adicione no `main.ts`:
```typescript
// Configurar proxy global
process.env.HTTP_PROXY = 'http://proxy.empresa.com:8080';
process.env.HTTPS_PROXY = 'http://proxy.empresa.com:8080';
```

### Solução 2: Liberar Firewall

#### Ubuntu/Debian (UFW)

```bash
# Permitir saída HTTPS
sudo ufw allow out 443/tcp

# Permitir para FCM especificamente
sudo ufw allow out to fcm.googleapis.com port 443 proto tcp
```

#### CentOS/RHEL (firewalld)

```bash
# Permitir saída HTTPS
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### iptables

```bash
# Permitir saída para porta 443
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save
```

### Solução 3: Configurar Timeout Maior

O timeout padrão pode ser muito curto. Configure um timeout maior:

Adicione no `.env`:
```env
# Timeout em milissegundos (padrão: 60000 = 60s)
PUSH_NOTIFICATION_TIMEOUT=120000
```

### Solução 4: Usar Servidor Relay/Proxy

Se o servidor não tem acesso direto à internet, configure um relay:

#### Opção A: Nginx como Proxy Reverso

```nginx
# /etc/nginx/sites-available/fcm-proxy
server {
    listen 8080;
    server_name localhost;
    
    location / {
        proxy_pass https://fcm.googleapis.com;
        proxy_ssl_server_name on;
        proxy_set_header Host fcm.googleapis.com;
    }
}
```

#### Opção B: Squid Proxy

```bash
# Instalar Squid
sudo apt install squid

# Configurar
sudo nano /etc/squid/squid.conf

# Adicionar
http_access allow all
http_port 3128

# Reiniciar
sudo systemctl restart squid
```

### Solução 5: Testar em Ambiente Diferente

Se possível, teste em um ambiente com melhor conectividade:

```bash
# Testar localmente (desenvolvimento)
npm run start:dev

# Testar em outro servidor
ssh usuario@outro-servidor
# ... executar testes
```

## Verificação

### Teste Manual de Conectividade

```bash
# Criar script de teste
cat > test-fcm-connection.js << 'EOF'
const https = require('https');

console.log('Testando conexão com FCM...');

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Conectado! Status: ${res.statusCode}`);
  res.on('data', () => {});
});

req.on('error', (error) => {
  console.error(`❌ Erro: ${error.message}`);
  console.error(`Código: ${error.code}`);
});

req.on('timeout', () => {
  console.error('❌ Timeout!');
  req.destroy();
});

req.end();
EOF

# Executar teste
node test-fcm-connection.js
```

### Teste com curl Detalhado

```bash
# Teste com verbose
curl -v --connect-timeout 10 https://fcm.googleapis.com/

# Teste com trace
curl --trace-ascii trace.txt https://fcm.googleapis.com/
cat trace.txt
```

### Verificar Logs do Sistema

```bash
# Ver logs de rede
sudo journalctl -u networking -f

# Ver logs do firewall
sudo tail -f /var/log/ufw.log

# Ver logs do sistema
sudo dmesg | grep -i network
```

## Workarounds Temporários

### 1. Usar Serviço de Relay Externo

Configure um serviço externo (como Cloudflare Workers) para fazer relay das notificações.

### 2. Fila de Retry

Implemente uma fila para tentar novamente após timeout:

```typescript
// Exemplo simplificado
async sendWithRetry(subscription, payload, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await webpush.sendNotification(subscription, payload);
      return { success: true };
    } catch (error) {
      if (error.code === 'ETIMEDOUT' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

### 3. Enviar em Lote Menor

Reduza o número de notificações enviadas simultaneamente:

```typescript
// Enviar em lotes de 5
const batchSize = 5;
for (let i = 0; i < subscriptions.length; i += batchSize) {
  const batch = subscriptions.slice(i, i + batchSize);
  await Promise.all(batch.map(sub => sendNotification(sub)));
  await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre lotes
}
```

## Prevenção

### 1. Monitoramento

Configure alertas para timeouts:

```typescript
// Exemplo com métricas
if (error.code === 'ETIMEDOUT') {
  metrics.increment('push_notification.timeout');
  logger.error('Timeout ao enviar notificação');
}
```

### 2. Health Check

Adicione health check para FCM:

```typescript
@Get('health/fcm')
async checkFCMConnection() {
  try {
    // Tentar conexão simples
    await fetch('https://fcm.googleapis.com/', { timeout: 5000 });
    return { status: 'ok', fcm: 'connected' };
  } catch (error) {
    return { status: 'error', fcm: 'disconnected', error: error.message };
  }
}
```

### 3. Configuração de Rede Adequada

- Garantir que o servidor tem acesso à internet
- Configurar DNS corretamente
- Liberar portas necessárias (443)
- Configurar proxy se necessário

## Referências

- [FCM HTTP Protocol](https://firebase.google.com/docs/cloud-messaging/http-server-ref)
- [Node.js ETIMEDOUT](https://nodejs.org/api/errors.html#errors_common_system_errors)
- [web-push Troubleshooting](https://github.com/web-push-libs/web-push#troubleshooting)
- [Debugging Network Issues](https://nodejs.org/en/docs/guides/debugging-getting-started/)

## Contato

Se o problema persistir após tentar todas as soluções:

1. Verifique com a equipe de infraestrutura/rede
2. Considere usar um serviço de relay
3. Entre em contato com o suporte do Firebase
