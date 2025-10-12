/**
 * Script de diagnóstico para problema de VAPID
 * Mostra as chaves usadas e identifica o problema
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Diagnóstico de Problema VAPID ===\n');

  // Ler chaves do .env (backend)
  let backendVapidKey;
  
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
          backendVapidKey = value;
        }
      });
    }
  } catch (error) {
    console.error('❌ Erro ao ler .env:', error.message);
    process.exit(1);
  }

  console.log('🔑 Chave VAPID no Backend (.env):');
  console.log(`   ${backendVapidKey}\n`);

  // Buscar subscrições do banco
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
    console.log('❌ Nenhuma subscrição encontrada no banco\n');
    process.exit(0);
  }

  console.log(`📋 Subscrições encontradas: ${subscriptions.length}\n`);

  subscriptions.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.user.name || sub.user.email}`);
    console.log(`   Criado em: ${sub.createdAt}`);
    console.log(`   Endpoint: ${sub.endpoint.substring(0, 70)}...\n`);
  });

  console.log('⚠️  DIAGNÓSTICO:\n');
  console.log('O erro 403 ocorre porque:');
  console.log('1. As subscrições foram criadas com uma chave VAPID');
  console.log('2. O backend está tentando usar uma chave VAPID DIFERENTE');
  console.log('3. O FCM (Firebase) valida isso e rejeita (403)\n');
  
  console.log('🔧 SOLUÇÃO:\n');
  console.log('O Service Worker do navegador tem cache das chaves antigas!');
  console.log('Você PRECISA limpar o Service Worker:\n');
  
  console.log('📱 No Navegador:');
  console.log('1. Abra o DevTools (F12)');
  console.log('2. Vá em Application > Service Workers');
  console.log('3. Clique em "Unregister"');
  console.log('4. Vá em Application > Clear storage');
  console.log('5. Marque "Unregister service workers"');
  console.log('6. Clique em "Clear site data"');
  console.log('7. FECHE e REABRA o navegador completamente');
  console.log('8. Faça login novamente no app');
  console.log('9. Autorize as notificações novamente\n');

  console.log('🖥️  Alternativa pelo Console do Navegador:');
  console.log('Cole este código no Console (F12 > Console):\n');
  console.log('navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));');
  console.log('\nDepois: Ctrl+F5 (hard refresh) e faça login novamente\n');

  await prisma.$disconnect();
}

main().catch(console.error);
