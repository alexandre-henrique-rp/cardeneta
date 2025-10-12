/**
 * Script de teste direto com dados fornecidos
 * Testa envio de notificação usando os dados do banco
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('\n=== Teste Direto de Notificação ===\n');

// Ler VAPID do .env
let vapidPublicKey, vapidPrivateKey, vapidSubject;

try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      value = value.replace(/^['"]|['"]$/g, '');
      
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

console.log('✅ Chaves VAPID:');
console.log(`   Subject: ${vapidSubject}`);
console.log(`   Public Key: ${vapidPublicKey.substring(0, 30)}...`);

// Configurar VAPID
webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

// Dados das subscrições
const subscriptions = [
  {
    endpoint: "https://fcm.googleapis.com/fcm/send/cBXJ9ek_bF8:APA91bEqzkScxk4iBVtlaSzkx-HeITl5XxK41N2gbtUZ98IU7tbO4SjOmPZlYhwnSI5_MZmVj4JeeR8QIgJIvzuys-tXyrsKJpQ-pmRVLyD8r-3sXQnTDQ3s-q_bVmES2hZ43W4x4h3Q",
    p256dh: "BDOJGyO00a3cY/oiscZfMli4XJ/K8Zv4ighCFFTYfof3grrUXhTU7nyNeBWmvWv3LM08ttYNB4xEeQ5E6U8VX8Y=",
    auth: "qIAoxf4TAokg297jpHuKyQ==",
    name: "Usuário 1"
  },
  {
    endpoint: "https://fcm.googleapis.com/fcm/send/eNyM9EcUtwk:APA91bFcfcUAgkWlgsPWxcV3IELTB6h3vvrpB0f0W7GK2vatrhXBzMR7Clfamz5JDco2ICjKo9cd7rd4Sm2grWeYsQ8lDBsZ84MI73gWFas0fknia-ko8qxYyBGLumth7cYo6ISz0DA6",
    p256dh: "BLdmS5BSXXjYs1x79jS8XmyfGhFhu08CeA551zrbNZL6usj8gMryfi8vp2yo/ViYn9rXXGl1NZHIb+IVg1MIN3c=",
    auth: "ZQ+XBYv2dOM+IT5oa5eQUA==",
    name: "Usuário 2"
  }
];

console.log(`\n📋 ${subscriptions.length} subscrições disponíveis:`);
subscriptions.forEach((sub, i) => {
  console.log(`   ${i + 1}. ${sub.name} - ${sub.endpoint.substring(0, 50)}...`);
});

// Escolher qual testar
const index = process.argv[2] ? parseInt(process.argv[2]) - 1 : 0;

if (index < 0 || index >= subscriptions.length) {
  console.log('\n❌ Índice inválido. Use: node scripts/test-direct.js [1 ou 2]');
  process.exit(1);
}

const target = subscriptions[index];

console.log(`\n📤 Testando envio para: ${target.name}`);
console.log(`   Endpoint: ${target.endpoint.substring(0, 60)}...`);

// Criar payload
const payload = JSON.stringify({
  title: '🔔 Teste Direto de Notificação',
  body: 'Testando notificação push do Cardeneta App! Se você está vendo isso, funcionou! 🎉',
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
const pushSubscription = {
  endpoint: target.endpoint,
  keys: {
    p256dh: target.p256dh,
    auth: target.auth,
  },
};

// Enviar
console.log('\n⏳ Enviando...');
const startTime = Date.now();

webpush
  .sendNotification(pushSubscription, payload)
  .then((response) => {
    const duration = Date.now() - startTime;
    console.log('\n✅ SUCESSO! Notificação enviada!');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Headers:`, JSON.stringify(response.headers, null, 2));
    console.log('\n🎉 Verifique o dispositivo - a notificação deve aparecer!\n');
    process.exit(0);
  })
  .catch((error) => {
    const duration = Date.now() - startTime;
    console.log('\n❌ ERRO ao enviar notificação');
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Status: ${error.statusCode || 'N/A'}`);
    console.log(`   Código: ${error.code || 'N/A'}`);
    console.log(`   Mensagem: ${error.message || 'N/A'}`);
    
    if (error.body) {
      try {
        const body = JSON.parse(error.body);
        console.log(`   Body:`, JSON.stringify(body, null, 2));
      } catch {
        console.log(`   Body: ${error.body}`);
      }
    }
    
    console.log('\n📋 Diagnóstico:');
    
    if (error.code === 'ETIMEDOUT') {
      console.log('   ⚠️  TIMEOUT - Problema de conectividade');
      console.log('   Solução: Adicione dns.setDefaultResultOrder("ipv4first") no main.ts');
      console.log('   Ou adicione NODE_OPTIONS=--dns-result-order=ipv4first no .env');
    } else if (error.statusCode === 401 || error.statusCode === 403) {
      console.log('   ⚠️  UNAUTHORIZED - Chaves VAPID não correspondem');
      console.log('   As subscrições foram criadas com chaves VAPID diferentes');
      console.log('   Solução: Limpar banco e recriar subscrições');
    } else if (error.statusCode === 410) {
      console.log('   ⚠️  GONE - Subscrição expirada ou inválida');
      console.log('   O usuário pode ter desinstalado o app');
      console.log('   Solução: Remover subscrição do banco');
    } else if (error.statusCode === 404) {
      console.log('   ⚠️  NOT FOUND - Endpoint inválido');
    } else if (error.statusCode === 400) {
      console.log('   ⚠️  BAD REQUEST - Payload ou formato inválido');
    }
    
    console.log('\n');
    process.exit(1);
  });
