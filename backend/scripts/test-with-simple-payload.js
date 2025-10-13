/**
 * Teste com payload EXTREMAMENTE simples para debug
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
  console.log('\n=== Teste com Payload Simples ===\n');

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

  console.log('📋 Subscrição:');
  console.log(`   Usuário: ${subscription.user.name}`);
  console.log(`   Criado: ${subscription.createdAt}`);

  // PAYLOAD MAIS SIMPLES POSSÍVEL
  const payload = JSON.stringify({
    title: 'TESTE',
    body: 'Funcionou!',
  });

  console.log('\n📨 Payload:', payload);

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
    
    console.log('✅ SUCESSO!');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Tempo: ${duration}ms`);
    
    console.log('\n📱 SE A NOTIFICAÇÃO NÃO APARECER:');
    console.log('\n1. Verifique no celular:');
    console.log('   - Configurações > Apps > Cardeneta > Notificações > ATIVADO');
    console.log('   - Modo "Não Perturbe" está DESATIVADO');
    console.log('   - App não está em "Economia de bateria"');
    console.log('\n2. Abra o Chrome DevTools Remote Debugging:');
    console.log('   - No desktop: chrome://inspect');
    console.log('   - Conecte o celular via USB');
    console.log('   - Inspect o app');
    console.log('   - Vá em Console e veja os logs do Service Worker');
    console.log('\n3. Teste com o app ABERTO em primeiro plano\n');
    
  } catch (error) {
    console.log('\n❌ Erro:');
    console.log(`   Status: ${error.statusCode || 'N/A'}`);
    console.log(`   Mensagem: ${error.message}`);
    if (error.body) console.log(`   Body: ${error.body}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
