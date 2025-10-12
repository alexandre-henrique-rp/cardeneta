/**
 * Script para testar envio real de notificação usando dados do banco
 * Busca uma subscrição do banco e envia uma notificação de teste
 * 
 * Execute: node scripts/test-real-notification.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Teste Real de Notificação Push ===\n');

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

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error('❌ Chaves VAPID não encontradas no .env');
    process.exit(1);
  }

  console.log('✅ Chaves VAPID carregadas');
  console.log(`   Subject: ${vapidSubject}\n`);

  // Configurar VAPID
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Buscar subscrições do banco
  console.log('🔍 Buscando subscrições no banco de dados...');
  
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log('❌ Nenhuma subscrição encontrada no banco de dados');
      console.log('   Crie uma subscrição fazendo login no frontend\n');
      process.exit(1);
    }

    console.log(`✅ ${subscriptions.length} subscrição(ões) encontrada(s)\n`);

    // Listar subscrições
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.user.name || 'Sem nome'} (${sub.user.email})`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`   Criado: ${sub.createdAt}`);
    });

    // Perguntar qual usar (ou usar a primeira)
    const targetIndex = process.argv[2] ? parseInt(process.argv[2]) - 1 : 0;
    
    if (targetIndex < 0 || targetIndex >= subscriptions.length) {
      console.log('\n❌ Índice inválido');
      process.exit(1);
    }

    const subscription = subscriptions[targetIndex];
    
    console.log(`\n📤 Enviando notificação para: ${subscription.user.name || subscription.user.email}`);

    // Criar payload
    const payload = JSON.stringify({
      title: '🔔 Teste Real de Notificação',
      body: `Olá ${subscription.user.name || 'usuário'}! Esta é uma notificação de teste real do Cardeneta App.`,
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
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    // Enviar
    const startTime = Date.now();

    const response = await webpush.sendNotification(pushSubscription, payload);
    
    const duration = Date.now() - startTime;
    console.log('\n✅ Notificação enviada com sucesso!');
    console.log(`   Tempo: ${duration}ms`);
    console.log(`   Status: ${response.statusCode}`);
    console.log('\n🎉 A notificação deve aparecer no dispositivo agora!\n');

  } catch (error) {
    console.log('\n❌ Erro ao enviar notificação');
    console.log(`   Código: ${error.code || 'N/A'}`);
    console.log(`   Status: ${error.statusCode || 'N/A'}`);
    console.log(`   Mensagem: ${error.message}`);
    
    if (error.body) {
      console.log(`   Body: ${error.body}`);
    }
    
    if (error.statusCode === 401) {
      console.log('\n⚠️  Erro 401: Chaves VAPID não correspondem');
      console.log('   As subscrições foram criadas com chaves diferentes');
      console.log('   Solução: DELETE FROM "PushSubscription"; e recriar');
    } else if (error.statusCode === 410) {
      console.log('\n⚠️  Erro 410: Subscrição expirada');
      console.log('   O usuário desinstalou o app ou revogou permissões');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n⚠️  Timeout: Adicione dns.setDefaultResultOrder("ipv4first") no main.ts');
    }
    
    console.log('\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
