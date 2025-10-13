/**
 * Teste de notificação com dados customizados e debug
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Teste de Notificação com Debug ===\n');

  // Ler chaves VAPID
  let vapidPublicKey, vapidPrivateKey, vapidSubject;
  
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      value = value.replace(/^['"]|['"]$/g, '');
      
      if (key.trim() === 'VAPID_PUBLIC_KEY') vapidPublicKey = value;
      else if (key.trim() === 'VAPID_PRIVATE_KEY') vapidPrivateKey = value;
      else if (key.trim() === 'VAPID_SUBJECT') vapidSubject = value;
    });
  } catch (error) {
    console.error('❌ Erro ao ler .env:', error.message);
    process.exit(1);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Buscar subscrição
  const subscription = await prisma.pushSubscription.findFirst({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!subscription) {
    console.log('❌ Nenhuma subscrição encontrada');
    await prisma.$disconnect();
    return;
  }

  console.log('📋 Subscrição encontrada:');
  console.log(`   Usuário: ${subscription.user.name}`);
  console.log(`   Endpoint: ${subscription.endpoint.substring(0, 70)}...`);

  // Payload com mais dados para debug
  const now = new Date();
  const payload = JSON.stringify({
    title: '🔔 TESTE DE NOTIFICAÇÃO',
    body: `Esta é uma notificação de teste enviada às ${now.toLocaleTimeString('pt-BR')}. Se você está vendo isso, FUNCIONOU! 🎉`,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: '/logo.png', // Adiciona imagem
    data: {
      url: '/',
      timestamp: now.toISOString(),
      testId: Math.random().toString(36).substr(2, 9),
    },
    tag: 'test-notification',
    requireInteraction: true, // Força a notificação a ficar visível
    vibrate: [200, 100, 200, 100, 200], // Padrão de vibração mais longo
    silent: false, // Garante que não é silenciosa
  });

  console.log('\n📨 Payload da notificação:');
  console.log(JSON.parse(payload));

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const httpsAgent = new https.Agent({
    keepAlive: true,
    timeout: 30000,
    maxSockets: 100,
    family: 4,
  });

  const options = {
    timeout: 30000,
    TTL: 3600,
    headers: {},
    agent: httpsAgent,
  };

  console.log('\n⏳ Enviando...\n');
  const startTime = Date.now();

  try {
    const response = await webpush.sendNotification(pushSubscription, payload, options);
    const duration = Date.now() - startTime;
    
    console.log('✅ SUCESSO! Notificação enviada!');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Headers:`, response.headers);
    console.log('\n📱 AGORA:');
    console.log('   1. Olhe para o seu celular');
    console.log('   2. Puxe a barra de notificações');
    console.log('   3. A notificação deve estar lá!');
    console.log('\n💡 Se não aparecer:');
    console.log('   - Verifique permissões de notificação');
    console.log('   - Desative "Não Perturbe"');
    console.log('   - Verifique se o app não foi "forçado a parar"');
    console.log('   - Teste com o app aberto em primeiro plano\n');
    
  } catch (error) {
    console.log('\n❌ Erro ao enviar:');
    console.log(`   Status: ${error.statusCode || 'N/A'}`);
    console.log(`   Mensagem: ${error.message}`);
    if (error.body) console.log(`   Body: ${error.body}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
