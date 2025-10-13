# 🔍 Debug de Notificações Push no Android

## ✅ Status Atual

- ✅ Backend enviando com sucesso (Status 201)
- ✅ Service Worker tem handlers de `push` corretos
- ✅ Subscrição criada corretamente
- ❌ Notificação NÃO aparece no celular

## 🎯 Possíveis Causas

### 1️⃣ Permissões do Android

O Android pode bloquear notificações mesmo se o app diz que estão permitidas.

**Verifique:**

1. **Configurações** > **Apps** > **Cardeneta**
2. **Notificações** 
3. Verifique se está **ATIVADO**
4. Toque em **Notificações** e veja se há categorias
5. Todas as categorias devem estar **ATIVADAS**

### 2️⃣ Otimização de Bateria

Android pode matar o Service Worker para economizar bateria.

**Solução:**

1. **Configurações** > **Apps** > **Cardeneta**
2. **Bateria** ou **Uso de bateria**
3. Selecione **"Sem restrições"** ou **"Não otimizar"**

### 3️⃣ Modo "Não Perturbe"

Se o celular está em "Não Perturbe", notificações podem não aparecer.

**Desative:**

1. Puxe a barra de notificações
2. Verifique se **"Não Perturbe"** está DESATIVADO

### 4️⃣ Chrome/WebView desatualizado

PWAs usam o Chrome WebView. Se estiver desatualizado, pode ter bugs.

**Atualize:**

1. **Play Store** > **Meu apps**
2. Atualize **Chrome** e **Android System WebView**

## 🧪 Teste com App ABERTO

Vamos testar com o app **aberto em primeiro plano**:

1. **Abra o PWA** no celular
2. **Deixe ele visível** (não minimize)
3. **Execute no servidor:**

```bash
node /var/www/html/cardeneta/backend/scripts/test-with-simple-payload.js
```

4. A notificação deve aparecer **IMEDIATAMENTE**

Se aparecer com o app aberto mas NÃO aparecer com app fechado:
- É problema de otimização de bateria
- O Android está matando o Service Worker

## 🔧 Chrome Remote Debugging

Para ver **EXATAMENTE** o que está acontecendo:

### No Desktop:

1. Conecte o celular via **USB**
2. Ative **Depuração USB** no celular:
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Configurações > Sistema > Opções do desenvolvedor
   - Ative "Depuração USB"
3. No Chrome desktop, acesse: **chrome://inspect**
4. Encontre seu celular e clique em **"Inspect"** ao lado do app
5. Vá na aba **Console**
6. Execute o teste de notificação
7. **Você verá os logs do Service Worker!**

**O que procurar:**
```javascript
[Service Worker] Push recebido: PushEvent {...}
```

Se aparecer esse log mas a notificação não aparecer:
- É problema de permissão do Android

Se NÃO aparecer esse log:
- O Service Worker não está recebendo o push
- Pode ser problema de subscrição

## 🧪 Teste Alternativo: Navegador Mobile

Em vez do PWA instalado, teste no **navegador mobile**:

1. Abra **Chrome** no celular
2. Acesse: **https://conta.kingdevtec.com**
3. Faça login
4. **Autorize notificações** quando solicitado
5. **Deixe a aba aberta**
6. Execute o teste

Se funcionar no navegador mas não no PWA:
- É problema específico do PWA instalado
- Pode ser permissão ou otimização de bateria

## 📱 Teste Definitivo: Notificação Manual

Vamos adicionar um botão no app para testar:

### No Frontend:

Adicione em uma página do app:

```typescript
const testarNotificacao = async () => {
  if (!("Notification" in window)) {
    alert("Notificações não suportadas");
    return;
  }

  const permission = await Notification.requestPermission();
  console.log("Permissão:", permission);

  if (permission === "granted") {
    // Teste 1: Notificação local (não precisa de Service Worker)
    new Notification("Teste Local", {
      body: "Se você vê isso, notificações locais funcionam!",
      icon: "/pwa-192x192.png",
    });

    // Teste 2: Notificação via Service Worker
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification("Teste Service Worker", {
      body: "Se você vê isso, Service Worker funciona!",
      icon: "/pwa-192x192.png",
    });
  }
};

// Botão
<button onClick={testarNotificacao}>
  TESTAR NOTIFICAÇÕES
</button>
```

**O que acontece:**

- **Teste 1 aparece?** → Permissões OK, problema está no push
- **Teste 2 aparece?** → Service Worker OK, problema está no FCM/backend
- **Nenhum aparece?** → Problema de permissão do Android

## 💡 Solução Rápida: Samsung/Xiaomi/Huawei

Esses fabricantes têm **gerenciadores de energia agressivos**:

### Samsung:
1. Configurações > Apps > Cardeneta
2. **Bateria** > **Permitir atividade em segundo plano**
3. **Modo de suspensão** > Remover da lista

### Xiaomi:
1. Configurações > Apps > Cardeneta
2. **Economizar bateria** > **Sem restrições**
3. **Inicialização automática** > **ATIVAR**
4. **Controle de atividade** > Permitir tudo

### Huawei:
1. Configurações > Bateria > **Iniciar apps**
2. Encontre Cardeneta
3. **Gerenciar manualmente**
4. Ative todas as permissões

## 🎯 Checklist Final

- [ ] Permissões de notificação ATIVADAS
- [ ] Modo "Não Perturbe" DESATIVADO
- [ ] Otimização de bateria DESATIVADA para o app
- [ ] Chrome/WebView ATUALIZADOS
- [ ] Service Worker registrado (veja em chrome://serviceworker-internals)
- [ ] Teste com app ABERTO funcionou
- [ ] Remote debugging mostra logs do Service Worker

---

**Se NADA disso funcionar:**

O problema pode ser **específico do dispositivo**. Alguns Android têm bugs com PWAs e notificações push. Nesse caso:
- Teste em outro dispositivo Android
- Ou considere migrar para um app nativo (React Native)
