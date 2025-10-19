# Push Notifications com Web-Push

Este projeto implementa Push Notifications usando a biblioteca **web-push** padrão do W3C, sem depender de Firebase ou outros serviços terceiros.

**🎉 INTEGRADO COM PWA**: Este projeto é um Progressive Web App (PWA) com Push Notifications integrados em um único Service Worker. Veja [PWA-PUSH-INTEGRATION.md](PWA-PUSH-INTEGRATION.md) para detalhes da integração.

## Requisitos

- **HTTPS obrigatório** (exceto para localhost em desenvolvimento)
- Navegador com suporte a Push API e Service Workers
- Backend configurado com web-push (veja documentação do backend)

## Arquitetura

### Frontend

1. **Service Worker** ([public/sw.js](public/sw.js))
   - **Integrado com PWA** usando VitePWA com estratégia `injectManifest`
   - Recebe notificações push do servidor
   - Exibe notificações para o usuário
   - Marca notificações como entregues no backend
   - Gerencia cliques nas notificações
   - Também gerencia features do PWA (cache, offline, etc.)

2. **Services**
   - [src/services/push.ts](src/services/push.ts): Gerencia subscrições push
   - [src/services/message.ts](src/services/message.ts): Toggle de notificações

3. **Hook React**
   - [src/hooks/usePushNotification.ts](src/hooks/usePushNotification.ts): Hook para gerenciar estado das notificações

### Backend

A API segue o padrão documentado em [API-EXAMPLES.md](API-EXAMPLES.md) com as seguintes rotas:

- `GET /push-notifications/vapid-public-key` - Obter chave VAPID pública
- `POST /push-notifications/subscriptions` - Criar subscrição
- `GET /push-notifications/subscriptions` - Listar subscrições
- `DELETE /push-notifications/subscriptions/:id` - Remover subscrição
- `POST /push-notifications/send` - Enviar notificação
- `PATCH /push-notifications/notifications/:id/delivered` - Marcar como entregue

## Como Funciona

### 1. Fluxo de Subscrição

```
Usuário clica em "Ativar Notificações"
    ↓
Frontend solicita permissão ao navegador
    ↓
Frontend busca chave VAPID do backend (/vapid-public-key)
    ↓
Frontend cria subscrição no navegador (PushManager.subscribe)
    ↓
Frontend envia subscrição para o backend (/subscriptions)
    ↓
Backend armazena subscrição no banco de dados
```

### 2. Fluxo de Notificação

```
Backend decide enviar notificação
    ↓
Backend usa web-push para enviar para o navegador
    ↓
Service Worker recebe o push
    ↓
Service Worker exibe notificação
    ↓
Service Worker marca como entregue no backend
    ↓
Usuário vê a notificação
```

### 3. Fluxo de Clique

```
Usuário clica na notificação
    ↓
Service Worker fecha a notificação
    ↓
Service Worker abre/foca a URL especificada
```

## Uso no Código

### Ativar/Desativar Notificações

```typescript
import { togglePushNotifications } from '@/services/message';

// Ativar
await togglePushNotifications(true);

// Desativar
await togglePushNotifications(false);
```

### Usar o Hook

```typescript
import { usePushNotification } from '@/hooks/usePushNotification';

function MyComponent() {
  const {
    isSupported,      // Navegador suporta push?
    permission,       // Status da permissão
    isSubscribed,     // Usuário está inscrito?
    isLoading,        // Carregando?
    error,            // Erro?
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotification();

  return (
    <div>
      {isSupported && (
        <button onClick={subscribe}>
          Ativar Notificações
        </button>
      )}
    </div>
  );
}
```

## Estrutura do Payload

O Service Worker espera receber notificações neste formato:

```json
{
  "title": "Título da Notificação",
  "body": "Mensagem da notificação",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "notificationId": "uuid-da-notificacao",
  "data": {
    "url": "/rota-para-abrir",
    "transactionId": "abc123",
    "customField": "valor"
  }
}
```

### Campos

- **title** (obrigatório): Título da notificação
- **body** (obrigatório): Texto principal
- **icon** (opcional): URL do ícone grande
- **badge** (opcional): URL do ícone pequeno
- **notificationId** (opcional): UUID para rastreamento
- **data** (opcional): Dados customizados
  - **url** (opcional): URL para abrir ao clicar (padrão: `/`)
  - Outros campos customizados conforme necessário

## Configuração de Ambiente

### Frontend

Arquivo [.env.example](.env.example):

```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# Push Notifications
# A chave VAPID é obtida automaticamente do backend
# Não é necessário configurar manualmente
```

### Backend

O backend precisa ter as seguintes variáveis configuradas:

```bash
# Web Push (VAPID Keys)
VAPID_PUBLIC_KEY=sua-chave-publica-aqui
VAPID_PRIVATE_KEY=sua-chave-privada-aqui
VAPID_SUBJECT=mailto:seu-email@exemplo.com
```

Para gerar as chaves VAPID, veja a documentação do backend.

## Desenvolvimento Local

### 1. Clone e Configure

```bash
# Clone o repositório
git clone <url-do-repo>
cd frontend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da sua API
```

### 2. Execute o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm run serve
```

### 3. Teste as Notificações

1. Abra a aplicação (funciona em `http://localhost:3001`)
2. Faça login
3. Vá nas configurações e ative as notificações
4. Conceda permissão quando solicitado
5. Use a API do backend para enviar uma notificação de teste

## Deploy em Produção

### Requisitos Críticos

1. **HTTPS obrigatório** - Push Notifications não funcionam em HTTP
2. Certificado SSL válido
3. Service Worker deve estar na raiz do domínio ou ter scope correto
4. Backend também deve estar em HTTPS

### Checklist de Deploy

- [ ] Domínio com HTTPS configurado
- [ ] Backend em HTTPS com CORS configurado
- [ ] Variável `VITE_API_URL` apontando para o backend em HTTPS
- [ ] Service Worker sendo servido corretamente em `/sw.js`
- [ ] Teste em navegadores diferentes (Chrome, Firefox, Edge)
- [ ] Teste em dispositivos móveis

## Compatibilidade

### Navegadores Suportados

- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Opera 29+
- ✅ Samsung Internet 4+
- ❌ Safari (iOS/macOS) - Suporte limitado, apenas iOS 16.4+

### Limitações

- **iOS Safari**: Suporte muito recente, apenas iOS 16.4+ e macOS Ventura+
- **iOS Chrome/Firefox**: Não suportam push (usam motor do Safari)
- **HTTP**: Não funciona, apenas HTTPS (exceto localhost)
- **Incognito/Privado**: Pode ter limitações dependendo do navegador

## Troubleshooting

### Notificações não aparecem

1. Verifique se está em HTTPS (ou localhost)
2. Verifique se a permissão foi concedida
3. Verifique o console do navegador para erros
4. Verifique se o Service Worker está registrado corretamente
5. Verifique se o backend está enviando o payload correto

### Erro ao registrar subscrição

1. Verifique se o backend está rodando
2. Verifique se a URL da API está correta no `.env`
3. Verifique se as chaves VAPID estão configuradas no backend
4. Verifique o console do navegador e do backend

### Service Worker não registra

1. Verifique se o arquivo `/sw.js` existe e é acessível
2. Verifique se não há erros de JavaScript no Service Worker
3. Tente limpar o cache e recarregar (Ctrl+Shift+R)
4. Vá em DevTools > Application > Service Workers e verifique o status

### Debug no Service Worker

1. Abra DevTools (F12)
2. Vá em Application > Service Workers
3. Veja logs, erros e status do SW
4. Use "Update" para forçar atualização
5. Use "Unregister" para remover e registrar novamente

## Exemplos de Uso

### Enviar Notificação Simples

```bash
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "uuid-da-subscricao",
    "title": "Nova transação",
    "body": "Você recebeu R$ 100,00"
  }'
```

### Enviar Notificação com Dados Customizados

```bash
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "uuid-da-subscricao",
    "title": "Nova transação",
    "body": "Você recebeu R$ 100,00",
    "data": {
      "url": "/transactions/123",
      "transactionId": "123",
      "amount": 100,
      "type": "credit"
    }
  }'
```

## Referências

- [PWA-PUSH-INTEGRATION.md](PWA-PUSH-INTEGRATION.md) - **Integração PWA + Push deste projeto**
- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [VAPID specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [VitePWA Documentation](https://vite-pwa-org.netlify.app/)

## Segurança

- As chaves VAPID privadas **NUNCA** devem ser expostas no frontend
- A chave pública VAPID pode ser exposta (é usada pelo navegador)
- Sempre valide permissões no backend antes de enviar notificações
- Use HTTPS em produção
- Implemente rate limiting no backend para prevenir spam
- Valide origem das requisições (CORS)

## Licença

MIT
