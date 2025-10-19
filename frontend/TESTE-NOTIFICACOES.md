# Guia de Teste - Sistema de Notificações

## 🎯 O Que Testar

Este guia mostra como testar todas as funcionalidades de notificações implementadas.

## 🚀 Pré-requisitos

1. **Backend rodando** em `http://localhost:3000`
2. **Frontend** em `http://localhost:3001`
3. **HTTPS** ou localhost (push notifications requerem)
4. **Navegador moderno** (Chrome, Firefox, Edge)

## 📝 Passo a Passo

### 1. Iniciar o Projeto

```bash
# Terminal 1 - Backend
cd ../backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:3001`

---

### 2. Testar Switch de Notificações

#### A) Ativar Notificações

1. **Faça login** na aplicação
2. **Clique no avatar** do usuário (canto inferior esquerdo)
3. **Verifique** se aparece:
   ```
   🔔 Notificações    [Switch OFF]
   🔔 Ver Notificações
   ```
4. **Ative o switch** (clique nele)
5. **Navegador pergunta permissão** - Clique em "Permitir"
6. **Toast de sucesso** deve aparecer: "Notificações ativadas com sucesso!"
7. **Switch muda para ON** e ícone vira `Bell`

✅ **Esperado**: Switch ativo, permissão concedida, toast de sucesso

❌ **Se falhar**:
- Verifique se navegador suporta push (Chrome, Firefox, Edge)
- Veja console do navegador (F12)
- Verifique se backend está rodando

#### B) Desativar Notificações

1. **Clique no avatar** novamente
2. **Desative o switch**
3. **Toast**: "Notificações desativadas"
4. **Switch OFF**, ícone vira `BellOff`

---

### 3. Testar Página de Notificações

#### A) Acessar a Página

**Opção 1**: Via menu
1. Clique no avatar
2. Clique em "Ver Notificações"

**Opção 2**: Via URL
1. Digite na barra: `http://localhost:3001/notifications`

✅ **Esperado**: Página abre mostrando "Nenhuma notificação recebida"

#### B) Estado Inicial (Vazio)

Você verá:
```
🔔 Notificações

[Todas (0)] [Não lidas (0)] [Lidas (0)]

    🔕
    Nenhuma notificação recebida
```

---

### 4. Enviar Notificação de Teste

Agora vamos enviar uma notificação via API.

#### A) Obter Token JWT

1. **Abra DevTools** (F12)
2. **Vá em Application > Local Storage**
3. **Copie o valor de `token`**

#### B) Obter Subscription ID

**Terminal 3**:
```bash
# Substitua SEU-TOKEN-JWT pelo token copiado
TOKEN="SEU-TOKEN-JWT-AQUI"

# Liste as subscrições
curl http://localhost:3000/push-notifications/subscriptions \
  -H "Authorization: Bearer $TOKEN" | jq

# Copie o "id" da resposta
```

Você verá algo como:
```json
[
  {
    "id": "abc-123-def-456",
    "endpoint": "https://...",
    "createdAt": "..."
  }
]
```

Copie o `id`.

#### C) Enviar Notificação

```bash
# Substitua os valores
TOKEN="seu-token-jwt"
SUBSCRIPTION_ID="id-copiado-acima"

# Envie a notificação
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "🎉 Primeira Notificação",
    "body": "Parabéns! O sistema de notificações está funcionando perfeitamente!",
    "data": {
      "url": "/notifications"
    }
  }'
```

✅ **Esperado**:
1. **Notificação aparece** no sistema operacional
2. **Click** na notificação abre o navegador
3. **App navega** para `/notifications`

---

### 5. Testar Lista de Notificações

Depois de enviar a notificação de teste:

#### A) Ver na Lista

Recarregue a página `/notifications`:

```
🔔 Notificações          [Marcar todas como lidas]
1 não lida

[Todas (1)] [Não lidas (1)] [Lidas (0)]

┌─────────────────────────────────────┐
│ 🔔 🎉 Primeira Notificação     ✓ 🗑️│
│ Parabéns! O sistema de...          │
│ há alguns segundos                  │
└─────────────────────────────────────┘
```

✅ **Esperado**: Notificação aparece, destaque visual, não lida

#### B) Testar Filtros

1. **Clique em "Não lidas (1)"** - Mostra 1 notificação
2. **Clique em "Lidas (0)"** - Mostra vazio
3. **Clique em "Todas (1)"** - Mostra 1 notificação

✅ **Esperado**: Filtros funcionam corretamente

#### C) Marcar como Lida

1. **Clique no botão ✓** (check) da notificação
2. **Toast**: "Notificação marcada como lida"
3. **Visual muda**: Fica cinza/opaca
4. **Contador atualiza**: "0 não lidas"
5. **Botão ✓ desaparece**

✅ **Esperado**: Notificação fica cinza, contador atualiza

#### D) Testar Filtro "Lidas"

1. **Clique em "Lidas (1)"**
2. **Notificação aparece** (agora está lida)

✅ **Esperado**: Filtro mostra notificação lida

#### E) Deletar Notificação

1. **Clique no botão 🗑️** (trash)
2. **Toast**: "Notificação removida"
3. **Notificação desaparece** da lista
4. **Contador**: "Todas (0)"

✅ **Esperado**: Notificação removida, lista vazia

---

### 6. Testar Múltiplas Notificações

Envie várias notificações de teste:

```bash
# Notificação 1 - Transação
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "💰 Nova Transação",
    "body": "Você recebeu R$ 150,00 de Maria Silva",
    "data": {"url": "/transactions/1"}
  }'

# Notificação 2 - Lembrete
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "⏰ Lembrete",
    "body": "Pagar conta de luz até amanhã",
    "data": {"url": "/bills/2"}
  }'

# Notificação 3 - Alerta
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "⚠️ Atenção",
    "body": "Seu saldo está baixo: R$ 50,00",
    "data": {"url": "/dashboard"}
  }'
```

#### A) Verificar Lista

Recarregue `/notifications`:

```
🔔 Notificações          [Marcar todas como lidas]
3 não lidas

[Todas (3)] [Não lidas (3)] [Lidas (0)]

┌─────────────────────────────────────┐
│ ⚠️ Atenção                     ✓ 🗑️│
│ Seu saldo está baixo...             │
│ há alguns segundos                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⏰ Lembrete                    ✓ 🗑️│
│ Pagar conta de luz...               │
│ há alguns segundos                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💰 Nova Transação              ✓ 🗑️│
│ Você recebeu R$ 150,00...           │
│ há alguns segundos                  │
└─────────────────────────────────────┘
```

✅ **Esperado**: 3 notificações, todas não lidas

#### B) Marcar Todas Como Lidas

1. **Clique em "Marcar todas como lidas"**
2. **Toast**: "Todas as notificações foram marcadas como lidas"
3. **Todas ficam cinzas**
4. **Contador**: "0 não lidas"
5. **Botão "Marcar todas" desaparece**

✅ **Esperado**: Todas marcadas simultaneamente

---

### 7. Testar Click em Notificação com URL

1. **Envie notificação** com URL específica:
```bash
curl -X POST http://localhost:3000/push-notifications/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "'$SUBSCRIPTION_ID'",
    "title": "🔗 Link de Teste",
    "body": "Clique para ir ao dashboard",
    "data": {"url": "/dashboard"}
  }'
```

2. **Vá em** `/notifications`
3. **Clique na notificação**
4. **App navega** para `/dashboard`
5. **Notificação marcada como lida** automaticamente

✅ **Esperado**: Navegação funciona, marca como lida

---

### 8. Testar Formatação de Data

1. **Aguarde 1 minuto**
2. **Recarregue** a página
3. **Verifique** que mostra "há 1 minuto"

Aguarde mais tempo:
- Após 5 min: "há 5 minutos"
- Após 1 hora: "há 1 hora"
- Após 1 dia: "há 1 dia"

✅ **Esperado**: Data atualiza corretamente em português

---

### 9. Testar Estados Vazios

#### A) Nenhuma Notificação
1. **Delete todas** as notificações
2. **Verifique**: "Nenhuma notificação recebida"

#### B) Nenhuma Não Lida
1. **Marque todas como lidas**
2. **Clique em filtro "Não lidas"**
3. **Verifique**: "Nenhuma notificação não lida"

#### C) Nenhuma Lida
1. **Delete todas as lidas**
2. **Envie notificação nova**
3. **Clique em "Lidas"**
4. **Verifique**: "Nenhuma notificação lida"

✅ **Esperado**: Mensagens corretas para cada estado

---

## 🧪 Checklist Completo

### Switch de Notificações
- [ ] Switch aparece no menu do usuário
- [ ] Ativar solicita permissão do navegador
- [ ] Ativação mostra toast de sucesso
- [ ] Ícone muda (Bell/BellOff)
- [ ] Desativação funciona
- [ ] Estado persiste após reload

### Página de Notificações
- [ ] Página acessível via menu
- [ ] URL `/notifications` funciona
- [ ] Estado vazio mostra mensagem amigável
- [ ] Contador de não lidas correto

### Listagem
- [ ] Notificações aparecem na lista
- [ ] Ordenação correta (mais recentes primeiro)
- [ ] Visual diferente (lida vs não lida)
- [ ] Data formatada corretamente

### Filtros
- [ ] Filtro "Todas" funciona
- [ ] Filtro "Não lidas" funciona
- [ ] Filtro "Lidas" funciona
- [ ] Contadores corretos

### Ações
- [ ] Marcar como lida (individual)
- [ ] Marcar todas como lidas
- [ ] Deletar notificação
- [ ] Click na notificação navega
- [ ] Click marca como lida automaticamente

### Notificações Push
- [ ] Notificação aparece no SO
- [ ] Click abre navegador
- [ ] Navega para URL correta
- [ ] Service Worker registra entrega

---

## 🐛 Problemas Comuns

### Notificação não aparece no SO
**Causa**: Permissão negada
**Solução**:
1. Chrome: chrome://settings/content/notifications
2. Remova bloqueio do site
3. Recarregue página
4. Ative novamente

### Lista vazia após enviar
**Causa**: Backend não salvou notificação
**Solução**:
1. Verifique logs do backend
2. Confirme que endpoint `/notifications` existe
3. Teste endpoint: `curl http://localhost:3000/push-notifications/notifications -H "Authorization: Bearer $TOKEN"`

### Data em formato errado
**Causa**: Backend enviando data inválida
**Solução**: Backend deve enviar ISO 8601 (ex: `2025-10-19T20:52:44.244Z`)

### Erro 401 ao listar
**Causa**: Token JWT inválido ou expirado
**Solução**:
1. Faça logout e login novamente
2. Copie novo token
3. Tente novamente

---

## 📊 Resultado Esperado

Após completar todos os testes:

✅ Switch de notificações funciona perfeitamente
✅ Notificações aparecem no sistema operacional
✅ Página lista todas as notificações
✅ Filtros funcionam corretamente
✅ Ações (marcar, deletar) funcionam
✅ Navegação por URL funciona
✅ Formatação de data em português
✅ Estados vazios com mensagens amigáveis
✅ UI responsiva e acessível

---

## 📚 Próximos Passos

Após testar tudo:

1. **Deploy em staging**
2. **Teste em HTTPS**
3. **Teste em diferentes navegadores**
4. **Teste em mobile**
5. **Configure monitoramento**
6. **Deploy em produção**

---

**Boa sorte nos testes!** 🚀

Se encontrar problemas, consulte:
- [TROUBLESHOOTING-PWA-PUSH.md](TROUBLESHOOTING-PWA-PUSH.md)
- [NOTIFICATIONS-UI.md](NOTIFICATIONS-UI.md)
- Console do navegador (F12)
- Logs do backend
