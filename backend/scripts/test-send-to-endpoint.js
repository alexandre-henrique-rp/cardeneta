/**
 * Script para testar envio de notificação para um endpoint específico
 * Útil para testar se as chaves VAPID e o endpoint estão funcionando
 * 
 * Execute: node scripts/test-send-to-endpoint.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('\n=== Teste de Envio para Endpoint Específico ===\n');

// Ler configurações do .env
let vapidPublicKey, vapidPrivateKey, vapidSubject;

try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      value = value.replace(/^['"]|['"]$/g, ''); // Remover aspas
      
      if (key.trim() === 'VAPID_PUBLIC_KEY') {
        vapidPublicKey = value;
      } else if (key.trim() === 'VAPID_PRIVATE_KEY') {
        vapidPrivateKey = value;
      } else if (key.trim() === 'VAPID_SUBJECT') {
        vapidSubject = value;
      }
    });
  }
} catch (error) {
  console.error('❌ Erro ao ler .env:', error.message);
  process.exit(1);
}

// Validar chaves
if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
  console.error('❌ Chaves VAPID não encontradas no .env');
  console.error('Execute: node scripts/check-vapid-keys.js');
  process.exit(1);
}

console.log('✅ Chaves VAPID carregadas');
console.log(`   Subject: ${vapidSubject}`);

// Configurar VAPID
webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

// Endpoint para teste (pode ser passado como argumento)
const endpoint = process.argv[2] || 'https://fcm.googleapis.com/fcm/send/cBXJ9ek_bF8:APA91bEqzkScxk4iBVtlaSzkx-HeITl5XxK41N2gbtUZ98IU7tbO4SjOmPZlYhwnSI5_MZmVj4JeeR8QIgJIvzuys-tXyrsKJpQ-pmRVLyD8r-3sXQnTDQ3s-q_bVmES2hZ43W4x4h3Q';

// Chaves p256dh e auth (precisam ser fornecidas)
// Para um teste real, você precisa pegar essas chaves do banco de dados
const p256dh = process.argv[3];
const auth = process.argv[4];

if (!p256dh || !auth) {
  console.log('\n⚠️  Para testar com chaves reais, forneça p256dh e auth:');
  console.log('   node scripts/test-send-to-endpoint.js <endpoint> <p256dh> <auth>');
  console.log('\n📝 Pegue as chaves do banco de dados:');
  console.log('   SELECT endpoint, p256dh, auth FROM "PushSubscription" LIMIT 1;');
  console.log('\n❌ Teste cancelado - chaves não fornecidas\n');
  process.exit(1);
}

console.log('\n📤 Enviando notificação de teste...');
console.log(`   Endpoint: ${endpoint.substring(0, 50)}...`);

// Criar payload da notificação
const payload = JSON.stringify({
  title: '🔔 Teste de Notificação',
  body: 'Esta é uma notificação de teste enviada via script!',
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  data: {
    url: '/',
    timestamp: new Date().toISOString(),
    testNotification: true,
  },
  tag: 'test-notification',
  requireInteraction: false,
});

// Montar subscription
const subscription = {
  endpoint: endpoint,
  keys: {
    p256dh: p256dh,
    auth: auth,
  },
};

// Enviar notificação
const startTime = Date.now();

webpush
  .sendNotification(subscription, payload)
  .then((response) => {
    const duration = Date.now() - startTime;
    console.log('\n✅ Notificação enviada com sucesso!');
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Headers:`, response.headers);
    console.log('\n✅ A notificação deve aparecer no dispositivo agora!\n');
    process.exit(0);
  })
  .catch((error) => {
    const duration = Date.now() - startTime;
    console.log('\n❌ Erro ao enviar notificação');
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Status: ${error.statusCode || 'N/A'}`);
    console.log(`   Código: ${error.code || 'N/A'}`);
    console.log(`   Mensagem: ${error.message}`);
    
    if (error.body) {
      console.log(`   Body: ${error.body}`);
    }
    
    if (error.statusCode === 401) {
      console.log('\n⚠️  Erro 401: Chaves VAPID não correspondem');
      console.log('   Solução: Limpar subscrições e recriar');
    } else if (error.statusCode === 410) {
      console.log('\n⚠️  Erro 410: Subscrição expirada ou inválida');
      console.log('   Solução: Remover do banco e criar nova');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n⚠️  Timeout: Problema de conectividade');
      console.log('   Solução: Configure IPv4 first no main.ts');
    }
    
    console.log('\n');
    process.exit(1);
  });
