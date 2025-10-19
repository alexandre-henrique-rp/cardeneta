# Solução de Problemas - Push Notifications

## Problema Comum: "Erro ao ativar notificações"

### Causa
O erro ocorre quando o Service Worker do Firebase (`firebase-messaging-sw.js`) não está configurado corretamente ou não existe.

### Solução Automatizada

O projeto agora gera automaticamente o Service Worker do Firebase sempre que você rodar:
```bash
yarn dev
# ou
yarn build
```

Os scripts `predev` e `prebuild` no `package.json` executam automaticamente `yarn generate-sw`.

### Solução Manual

Se precisar gerar manualmente o Service Worker:

```bash
yarn generate-sw
```

Ou diretamente:
```bash
node scripts/generate-sw-from-code.js
```

## Arquivos Envolvidos

### 1. `/public/firebase-messaging-sw.js.template`
Template do Service Worker com placeholders para as credenciais do Firebase.

### 2. `/public/firebase-messaging-sw.js` (gerado)
Service Worker final com as credenciais substituídas.
**Importante:** Este arquivo está no `.gitignore` e deve ser gerado localmente.

### 3. `/scripts/generate-sw-from-code.js`
Script que gera o Service Worker usando as credenciais hardcoded em `src/lib/messaging.ts`.

### 4. `/src/lib/messaging.ts`
Inicialização do Firebase com credenciais do projeto.

### 5. `/src/services/pushNotification.ts`
Serviço que gerencia o registro de notificações push.

### 6. `/src/context/auth/index.tsx`
Context que registra as notificações após o login bem-sucedido.

## Fluxo de Funcionamento

1. **Login do usuário**
   - `handleLoginSuccess()` é chamado após autenticação
   
2. **Setup de Notificações**
   - `setupPushNotifications()` é executado
   - Verifica se o navegador suporta notificações
   - Solicita permissão ao usuário
   
3. **Registro no Firebase**
   - Aguarda o Service Worker estar ativo
   - Obtém a chave VAPID do servidor
   - Cria uma subscrição push no Firebase
   
4. **Envio ao Backend**
   - Envia a subscrição para o servidor via API
   - Servidor armazena a subscrição para enviar notificações futuras

## Mensagens de Erro e Soluções

### ❌ "Service Worker não está ativo"
**Solução:** Recarregue a página e tente fazer login novamente.

### ❌ "Chave VAPID inválida"
**Problema:** A chave VAPID do servidor está incorreta ou mal formatada.
**Solução:** Verifique as credenciais no backend.

### ℹ️ "Você negou permissão para notificações"
**Solução:** Nas configurações do navegador, permita notificações para o site.

### ⚠️ "Push notifications não são suportadas"
**Causa:** Navegador ou dispositivo não suporta notificações push.
**Solução:** Use um navegador moderno (Chrome, Firefox, Edge).

## Requisitos do Navegador

- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16+ (macOS/iOS)
- ❌ IE (não suportado)

## Verificação de Funcionamento

Abra o console do navegador após fazer login. Você deve ver:

```
⏳ Aguardando Service Worker estar pronto...
✅ Service Worker ativo: activated
📝 Criando nova subscrição push...
🔑 Chave VAPID recebida: ...
✅ Subscrição criada com sucesso!
✅ Notificações push registradas com sucesso
```

## Debug Avançado

Para verificar o estado do Service Worker:

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers registrados:', regs);
});

navigator.serviceWorker.ready.then(reg => {
  console.log('SW ativo:', reg.active?.state);
  
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscrição:', sub);
  });
});
```

## Notas Importantes

1. **HTTPS Obrigatório**: Push notifications só funcionam em HTTPS (exceto localhost)
2. **Permissões**: O usuário deve conceder permissão manualmente
3. **Service Worker**: Deve estar ativo antes de criar subscrição
4. **VAPID Key**: Deve ser obtida do servidor backend

## Melhorias Futuras

- [ ] Adicionar retry automático em caso de falha
- [ ] Implementar fallback para navegadores sem suporte
- [ ] Adicionar opção para usuário desativar notificações
- [ ] Mostrar status de notificações na UI
