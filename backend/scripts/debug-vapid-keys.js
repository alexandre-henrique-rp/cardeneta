/**
 * Script para debugar chaves VAPID e comparar com subscrição
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const webpush = require('web-push');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Debug: Chaves VAPID ===\n');

  // 1. Ler chaves do .env (backend)
  let backendPublicKey, backendPrivateKey, backendSubject;
  
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      value = value.replace(/^['"]|['"]$/g, '');
      
      if (key.trim() === 'VAPID_PUBLIC_KEY') {
        backendPublicKey = value;
      } else if (key.trim() === 'VAPID_PRIVATE_KEY') {
        backendPrivateKey = value;
      } else if (key.trim() === 'VAPID_SUBJECT') {
        backendSubject = value;
      }
    });
  } catch (error) {
    console.error('❌ Erro ao ler .env:', error.message);
    process.exit(1);
  }

  console.log('🔑 Chaves no Backend (.env):');
  console.log(`   Public:  ${backendPublicKey}`);
  console.log(`   Private: ${backendPrivateKey.substring(0, 20)}...`);
  console.log(`   Subject: ${backendSubject}\n`);

  // 2. Configurar webpush e verificar o que ele usa
  webpush.setVapidDetails(backendSubject, backendPublicKey, backendPrivateKey);
  console.log('✅ Web-push configurado com essas chaves\n');

  // 3. Buscar subscrição do banco
  const subscription = await prisma.pushSubscription.findFirst({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!subscription) {
    console.log('❌ Nenhuma subscrição encontrada\n');
    await prisma.$disconnect();
    return;
  }

  console.log('📋 Subscrição no Banco:');
  console.log(`   Usuário: ${subscription.user.name || subscription.user.email}`);
  console.log(`   Criado: ${subscription.createdAt}`);
  console.log(`   Endpoint: ${subscription.endpoint.substring(0, 80)}...`);
  console.log(`   P256DH: ${subscription.p256dh}`);
  console.log(`   Auth: ${subscription.auth}\n`);

  // 4. Simular o que o frontend faz
  console.log('🌐 Testando endpoint do backend:');
  console.log('   GET /push-notification/vapid-public-key\n');

  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3030,
    path: '/push-notification/vapid-public-key',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📨 Resposta do Backend:');
        console.log(`   ${JSON.stringify(response, null, 2)}\n`);
        
        if (response.publicKey) {
          console.log('🔍 Comparação:');
          console.log(`   Backend .env:     ${backendPublicKey}`);
          console.log(`   Backend retorna:  ${response.publicKey}`);
          console.log(`   São iguais? ${backendPublicKey === response.publicKey ? '✅ SIM' : '❌ NÃO'}\n`);
        }

        // 5. Diagnóstico final
        console.log('⚠️  DIAGNÓSTICO FINAL:\n');
        
        if (backendPublicKey === response.publicKey) {
          console.log('✅ Backend está retornando a chave correta do .env');
          console.log('');
          console.log('❌ MAS o erro 403 persiste porque:');
          console.log('');
          console.log('A subscrição no banco foi criada com OUTRA chave VAPID!');
          console.log('');
          console.log('Isso significa que quando o frontend criou a subscrição,');
          console.log('ele usou uma chave diferente (do Service Worker em cache).');
          console.log('');
          console.log('🔧 SOLUÇÃO:');
          console.log('');
          console.log('1. No navegador, pressione F12');
          console.log('2. Vá em Application > Service Workers');
          console.log('3. Clique em "Unregister"');
          console.log('4. Vá em Application > Clear storage');
          console.log('5. Clique em "Clear site data"');
          console.log('6. FECHE e REABRA o navegador');
          console.log('7. Faça login novamente');
          console.log('8. Autorize notificações novamente');
          console.log('');
          console.log('Ou execute no Console do navegador:');
          console.log('navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));');
        } else {
          console.log('❌ PROBLEMA: Backend está retornando chave DIFERENTE do .env!');
          console.log('   Reinicie o backend: pm2 restart 0');
        }
        
        prisma.$disconnect();
      } catch (error) {
        console.error('❌ Erro ao parsear resposta:', error.message);
        console.log('Resposta recebida:', data);
        prisma.$disconnect();
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
    prisma.$disconnect();
  });

  req.end();
}

main().catch(console.error);
