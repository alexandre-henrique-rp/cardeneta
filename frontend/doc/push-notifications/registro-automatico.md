# Registro Automático de Notificações Push

## Visão Geral

O sistema agora registra automaticamente as notificações push após o login do usuário. Este processo é transparente e não requer interação manual do usuário, exceto pela permissão inicial de notificações.

## Fluxo de Funcionamento

### 1. Login do Usuário
Quando o usuário faz login com sucesso:
- O contexto de autenticação (`AuthContext`) armazena os dados do usuário
- Automaticamente chama a função `setupPushNotifications()`

### 2. Configuração de Push Notifications
A função `setupPushNotifications()` executa os seguintes passos:

1. **Verificação de Suporte**
   - Verifica se o navegador suporta Push Notifications
   - Se não suportar, retorna silenciosamente

2. **Obtenção da Chave VAPID**
   - Faz requisição ao endpoint `/push-notification/vapid-public-key`
   - Recebe a chave pública VAPID do servidor

3. **Registro da Subscrição**
   - Solicita permissão ao usuário (se ainda não concedida)
   - Registra o Service Worker
   - Cria uma subscrição push com a chave VAPID
   - Extrai as chaves `p256dh` e `auth` da subscrição

4. **Envio ao Servidor**
   - Envia os dados da subscrição para `/push-notification/subscribe`
   - Dados enviados:
     - `endpoint`: URL do endpoint de push
     - `p256dh`: Chave pública do cliente
     - `auth`: Chave de autenticação
     - `userAgent`: Informações do navegador

## Arquivos Envolvidos

### Frontend

#### `/src/services/pushNotification.ts`
Serviço responsável por:
- Converter chaves VAPID de base64 para Uint8Array
- Verificar suporte a push notifications
- Solicitar permissão de notificações
- Registrar e cancelar subscrições
- Verificar subscrições ativas

**Funções principais:**
- `isPushNotificationSupported()`: Verifica suporte do navegador
- `requestNotificationPermission()`: Solicita permissão ao usuário
- `registerPushSubscription(vapidPublicKey)`: Registra subscrição
- `unregisterPushSubscription()`: Cancela subscrição
- `hasActiveSubscription()`: Verifica se há subscrição ativa

#### `/src/context/auth/index.tsx`
Contexto de autenticação que:
- Gerencia o estado do usuário
- Executa `setupPushNotifications()` após login
- Integra o registro de push no fluxo de autenticação

#### `/src/api/service.ts`
Serviço de API com endpoints:
- `getVapidPublicKey()`: Obtém chave VAPID pública
- `subscribePushNotification(data)`: Registra subscrição
- `unsubscribePushNotification(endpoint)`: Remove subscrição
- `getUserSubscriptions()`: Lista subscrições do usuário

### Backend

#### `/src/push-notification/push-notification.controller.ts`
Controller com endpoints:
- `GET /push-notification/vapid-public-key`: Retorna chave VAPID (sem autenticação)
- `POST /push-notification/subscribe`: Registra subscrição (requer autenticação)
- `DELETE /push-notification/unsubscribe/:endpoint`: Remove subscrição (requer autenticação)
- `GET /push-notification/subscriptions`: Lista subscrições (requer autenticação)
- `POST /push-notification/send`: Envia notificação (requer autenticação)

#### `/src/push-notification/push-notification.service.ts`
Serviço que:
- Gerencia subscrições no banco de dados
- Envia notificações usando web-push
- Remove subscrições inválidas automaticamente

## Permissões

### Primeira Vez
Na primeira vez que o usuário faz login, o navegador solicitará permissão para enviar notificações. O usuário pode:
- **Permitir**: As notificações serão registradas automaticamente
- **Bloquear**: As notificações não serão registradas (sem erro visível)
- **Ignorar**: A permissão será solicitada novamente no próximo login

### Logins Subsequentes
Se a permissão já foi concedida:
- O registro acontece automaticamente
- Não há nova solicitação de permissão
- Se já existir uma subscrição, ela é reutilizada

## Tratamento de Erros

O sistema foi projetado para falhar silenciosamente:
- Erros não são mostrados ao usuário
- Logs são registrados no console do navegador
- A falha no registro de push não impede o login
- Push notifications são consideradas uma funcionalidade opcional

## Segurança

### Chave VAPID Pública
- Endpoint `/vapid-public-key` não requer autenticação
- É uma chave pública, segura para exposição
- Necessária antes do login para alguns fluxos

### Subscrições
- Todos os endpoints de subscrição requerem autenticação
- Cada subscrição é vinculada ao `userId`
- Usuários só podem gerenciar suas próprias subscrições

## Banco de Dados

### Modelo `PushSubscription`
```prisma
model PushSubscription {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint     String   @unique
  p256dh       String
  auth         String
  userAgent    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Características
- `endpoint` é único (previne duplicatas)
- Relacionamento com `User` com `onDelete: Cascade`
- `userAgent` opcional para identificar dispositivos

## Testando

### Verificar Registro
1. Faça login na aplicação
2. Abra o DevTools (F12)
3. Vá para a aba Console
4. Procure por: `"Notificações push registradas com sucesso"`

### Verificar Subscrição no Navegador
1. DevTools > Application > Service Workers
2. Verifique se o Service Worker está ativo
3. DevTools > Application > Push Messaging
4. Veja a subscrição registrada

### Verificar no Banco de Dados
Execute no backend:
```bash
npx prisma studio
```
Navegue até a tabela `PushSubscription` e verifique os registros.

## Troubleshooting

### Notificações não registram
- Verifique se o navegador suporta Push API
- Confirme que o Service Worker está registrado
- Verifique se a permissão foi concedida
- Confira os logs no console

### Erro de VAPID
- Verifique se as variáveis de ambiente estão configuradas
- Confirme que a chave VAPID está no formato correto

### Subscrição duplicada
- O sistema previne duplicatas usando o `endpoint` como chave única
- Se já existir, a subscrição é atualizada, não duplicada

## Próximos Passos

- [ ] Implementar notificação de teste após registro
- [ ] Adicionar opção de desativar notificações nas configurações
- [ ] Implementar sincronização de subscrições entre dispositivos
- [ ] Adicionar analytics de taxa de registro
