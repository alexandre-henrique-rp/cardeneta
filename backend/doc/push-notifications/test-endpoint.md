# Endpoint de Teste de Push Notifications

## Visão Geral

Endpoint **PÚBLICO** criado para testar o envio de notificações push. Envia notificações para **TODAS** as subscrições ativas no sistema. Útil para verificar se o sistema de notificações está funcionando corretamente.

## Endpoint

```
POST /push-notification/test
```

**Autenticação:** ❌ NÃO REQUERIDA (Endpoint Público)

## Descrição

Envia uma notificação de teste para **TODAS** as subscrições ativas no sistema. A notificação inclui:
- Título personalizado (customizável)
- Mensagem customizável
- Timestamp da notificação
- Ícone e badge do app
- URL de redirecionamento customizável

## Request

### Headers
```http
Content-Type: application/json
```

### Body (Opcional)
Todos os campos são opcionais. Se não fornecidos, usa valores padrão.

```json
{
  "title": "🎉 Título Customizado",
  "message": "Mensagem customizada da notificação",
  "redirectUrl": "/dashboard"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `title` | string | Não | Título da notificação (padrão: "🔔 Notificação de Teste") |
| `message` | string | Não | Mensagem da notificação (padrão: "Esta é uma notificação de teste do Cardeneta App!") |
| `redirectUrl` | string | Não | URL para redirecionar ao clicar (padrão: "/") |

## Response

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Notificação de teste enviada com sucesso!",
  "total": 2,
  "sent": 2,
  "failed": 0,
  "subscriptions": [
    {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "createdAt": "2025-10-12T20:30:00.000Z"
    },
    {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...)...",
      "createdAt": "2025-10-12T21:15:00.000Z"
    }
  ]
}
```

### Nenhuma Subscrição (200 OK)

```json
{
  "success": false,
  "message": "Nenhuma subscrição encontrada no sistema",
  "total": 0,
  "sent": 0,
  "failed": 0
}
```

### Falha Parcial (200 OK)

```json
{
  "success": true,
  "message": "Notificação de teste enviada com sucesso!",
  "total": 3,
  "sent": 2,
  "failed": 1,
  "subscriptions": [...]
}
```

### Erro (500 Internal Server Error)

```json
{
  "statusCode": 500,
  "message": "Erro ao enviar notificação de teste"
}
```

## Campos da Response

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | boolean | Indica se pelo menos uma notificação foi enviada com sucesso |
| `message` | string | Mensagem descritiva do resultado |
| `total` | number | Número total de subscrições do usuário |
| `sent` | number | Número de notificações enviadas com sucesso |
| `failed` | number | Número de notificações que falharam |
| `subscriptions` | array | Lista de subscrições com informações básicas |
| `subscriptions[].endpoint` | string | URL do endpoint da subscrição |
| `subscriptions[].userAgent` | string | User agent do dispositivo |
| `subscriptions[].createdAt` | string | Data de criação da subscrição (ISO 8601) |

## Comportamento

### Limpeza Automática
Se uma subscrição retornar erro 410 (Gone), ela será automaticamente removida do banco de dados, pois indica que o endpoint não é mais válido.

### Múltiplos Dispositivos
Se o usuário tiver múltiplas subscrições (diferentes dispositivos/navegadores), a notificação será enviada para todos eles.

### Notificação de Teste
A notificação enviada contém:
- **Título:** "🔔 Notificação de Teste"
- **Corpo:** "Olá [nome]! Esta é uma notificação de teste do Cardeneta App."
- **Dados extras:**
  - `url`: "/" (redireciona para home ao clicar)
  - `timestamp`: Data/hora do envio
  - `testNotification`: true (flag para identificar como teste)

## Exemplos de Uso

### cURL - Teste Simples (valores padrão)

```bash
curl -X POST https://api.seudominio.com/push-notification/test \
  -H "Content-Type: application/json"
```

### cURL - Teste Customizado

```bash
curl -X POST https://api.seudominio.com/push-notification/test \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 Teste Personalizado",
    "message": "Esta é uma mensagem customizada!",
    "redirectUrl": "/dashboard"
  }'
```

### JavaScript (Fetch) - Teste Simples

```javascript
const testPushNotification = async () => {
  const response = await fetch('https://api.seudominio.com/push-notification/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  console.log('Resultado:', result);
  
  if (result.success) {
    alert(`Notificação enviada! ${result.sent} de ${result.total} subscrições`);
  } else {
    alert(result.message);
  }
};

testPushNotification();
```

### JavaScript (Fetch) - Teste Customizado

```javascript
const testCustomNotification = async () => {
  const response = await fetch('https://api.seudominio.com/push-notification/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: '🎉 Promoção Especial',
      message: 'Aproveite 50% de desconto hoje!',
      redirectUrl: '/promocoes'
    })
  });
  
  const result = await response.json();
  console.log('Resultado:', result);
};

testCustomNotification();
```

### Axios - Teste Customizado

```javascript
import axios from 'axios';

const testPushNotification = async () => {
  try {
    const response = await axios.post(
      'https://api.seudominio.com/push-notification/test',
      {
        title: '🔔 Notificação Customizada',
        message: 'Teste de notificação via Axios!',
        redirectUrl: '/dashboard'
      }
    );
    
    console.log('Resultado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao testar notificação:', error);
    throw error;
  }
};
```

## Casos de Uso

### 1. Verificar Configuração
Após configurar as notificações push, use este endpoint para verificar se tudo está funcionando.

### 2. Debug de Problemas
Se um usuário reportar que não está recebendo notificações, use este endpoint para:
- Verificar se há subscrições ativas
- Testar o envio direto
- Identificar subscrições inválidas

### 3. Demonstração
Útil para demonstrar o funcionamento das notificações push para stakeholders ou em apresentações.

### 4. Monitoramento
Pode ser usado em testes automatizados para verificar a saúde do sistema de notificações.

## Logs

O endpoint gera logs detalhados:

### Sucesso
```
[PushNotificationService] Notificação de teste enviada com sucesso para https://fcm.googleapis.com/fcm/send/...
```

### Falha
```
[PushNotificationService] Erro ao enviar notificação de teste para https://fcm.googleapis.com/fcm/send/...: <mensagem_erro>
```

### Subscrição Removida
```
[PushNotificationService] Subscrição removida (endpoint não mais válido): https://fcm.googleapis.com/fcm/send/...
```

### Nenhuma Subscrição
```
[PushNotificationService] Nenhuma subscrição encontrada para o usuário <user_id>
```

## Segurança

- ⚠️ **Endpoint PÚBLICO** - Não requer autenticação
- ⚠️ Envia para TODAS as subscrições ativas no sistema
- ✅ Não expõe chaves sensíveis (p256dh, auth)
- ✅ Remove automaticamente subscrições inválidas
- ⚠️ **Uso recomendado apenas em ambiente de desenvolvimento/teste**

## Limitações

- Não permite especificar o conteúdo da notificação (é sempre uma mensagem de teste padrão)
- Envia para todas as subscrições do usuário (não permite escolher dispositivos específicos)
- Não suporta agendamento (envia imediatamente)

## Troubleshooting

### "Nenhuma subscrição encontrada"
**Causa:** O usuário não tem subscrições ativas.
**Solução:** Fazer login no frontend e permitir notificações.

### "Falha ao enviar notificação de teste"
**Causa:** Erro no servidor de push (FCM, etc).
**Solução:** Verificar logs do servidor, configuração VAPID e conectividade.

### Notificação não aparece no dispositivo
**Causa:** Permissão negada, navegador fechado, ou Service Worker inativo.
**Solução:** 
1. Verificar permissões do navegador
2. Manter o navegador aberto
3. Verificar se o Service Worker está ativo

## Próximos Passos

- [ ] Adicionar opção de customizar mensagem de teste
- [ ] Permitir enviar para dispositivo específico
- [ ] Adicionar estatísticas de taxa de entrega
- [ ] Implementar retry automático para falhas temporárias
