#!/bin/bash

# Script de teste para Push Notifications
# Testa todo o fluxo de push notifications

echo "=========================================="
echo "🔔 Teste de Push Notifications"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL do backend
BACKEND_URL="${1:-http://localhost:3000}"
echo "Backend URL: $BACKEND_URL"
echo ""

# 1. Verificar se o backend está rodando
echo "1️⃣  Verificando se o backend está rodando..."
if curl -s -f "$BACKEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
else
    echo -e "${RED}❌ Backend não está respondendo em $BACKEND_URL${NC}"
    echo "Execute: cd backend && npm run start:dev"
    exit 1
fi
echo ""

# 2. Obter chave VAPID pública
echo "2️⃣  Obtendo chave VAPID pública..."
VAPID_KEY=$(curl -s "$BACKEND_URL/push-notification/vapid-public-key")
if [ -n "$VAPID_KEY" ]; then
    echo -e "${GREEN}✅ Chave VAPID obtida:${NC} ${VAPID_KEY:0:30}..."
else
    echo -e "${RED}❌ Falha ao obter chave VAPID${NC}"
    exit 1
fi
echo ""

# 3. Verificar quantas subscrições existem no banco
echo "3️⃣  Verificando subscrições no banco de dados..."
echo "Execute no Prisma Studio ou no banco:"
echo "SELECT COUNT(*) FROM PushSubscription;"
echo ""

# 4. Enviar notificação de teste
echo "4️⃣  Enviando notificação de teste..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/push-notification/test" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🧪 Teste de Notificação",
    "message": "Se você recebeu esta notificação, está funcionando! 🎉"
  }')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# 5. Verificar resultado
SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
SENT=$(echo "$RESPONSE" | jq -r '.sent' 2>/dev/null)
FAILED=$(echo "$RESPONSE" | jq -r '.failed' 2>/dev/null)
TOTAL=$(echo "$RESPONSE" | jq -r '.total' 2>/dev/null)

echo ""
echo "=========================================="
echo "📊 RESULTADO DO TESTE"
echo "=========================================="

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Notificações enviadas com sucesso!${NC}"
    echo "   Total de subscrições: $TOTAL"
    echo "   Enviadas: $SENT"
    echo "   Falhas: $FAILED"
else
    echo -e "${RED}❌ Falha ao enviar notificações${NC}"
    if [ "$TOTAL" = "0" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Nenhuma subscrição encontrada!${NC}"
        echo ""
        echo "Possíveis causas:"
        echo "  1. Usuário não fez subscrição no frontend"
        echo "  2. Service Worker não está registrado"
        echo "  3. Permissão de notificações não foi concedida"
        echo ""
        echo "Soluções:"
        echo "  1. Abra o frontend em: http://localhost:3001"
        echo "  2. Abra o console do navegador (F12)"
        echo "  3. Use o hook usePushNotification para fazer subscribe"
        echo "  4. Ou acesse: http://localhost:3001/test-push.html"
    fi
fi

echo ""
echo "=========================================="
echo "🔧 PRÓXIMOS PASSOS"
echo "=========================================="
echo ""
echo "1. Verifique se o service worker está ativo:"
echo "   - Abra DevTools → Application → Service Workers"
echo ""
echo "2. Verifique os logs do navegador:"
echo "   - Abra Console (F12)"
echo "   - Procure por '[Service Worker]' ou '[usePushNotification]'"
echo ""
echo "3. Teste manualmente:"
echo "   - Acesse: http://localhost:3001/test-push.html"
echo "   - Siga os passos na página"
echo ""
echo "4. Verifique logs do backend:"
echo "   - Procure por '[PushNotificationService]' nos logs"
echo ""
