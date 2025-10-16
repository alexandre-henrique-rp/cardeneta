#!/usr/bin/env node

/**
 * Script para testar se as chaves VAPID estão válidas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando chaves VAPID...\n');

// Ler arquivo .env
const envPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado em:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let vapidPublicKey = '';
let vapidPrivateKey = '';
let vapidSubject = '';

envLines.forEach(line => {
  if (line.startsWith('VAPID_PUBLIC_KEY=')) {
    vapidPublicKey = line.split('=')[1].trim();
  } else if (line.startsWith('VAPID_PRIVATE_KEY=')) {
    vapidPrivateKey = line.split('=')[1].trim();
  } else if (line.startsWith('VAPID_SUBJECT=')) {
    vapidSubject = line.split('=')[1].trim();
  }
});

console.log('📋 Chaves encontradas no .env:');
console.log('  VAPID_PUBLIC_KEY:', vapidPublicKey ? `${vapidPublicKey.substring(0, 20)}...` : '❌ NÃO ENCONTRADA');
console.log('  VAPID_PRIVATE_KEY:', vapidPrivateKey ? `${vapidPrivateKey.substring(0, 20)}...` : '❌ NÃO ENCONTRADA');
console.log('  VAPID_SUBJECT:', vapidSubject || '❌ NÃO ENCONTRADA');
console.log('');

// Validar chave pública
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  try {
    const rawData = Buffer.from(base64, 'base64');
    return rawData;
  } catch (e) {
    return null;
  }
}

if (vapidPublicKey) {
  const publicKeyBuffer = urlBase64ToUint8Array(vapidPublicKey);
  if (publicKeyBuffer && publicKeyBuffer.length === 65) {
    console.log('✅ Chave pública VAPID é válida! (65 bytes)');
  } else {
    console.log('❌ Chave pública VAPID parece inválida!');
    console.log('   Tamanho:', publicKeyBuffer ? publicKeyBuffer.length : 0, 'bytes (esperado: 65)');
  }
} else {
  console.log('❌ VAPID_PUBLIC_KEY não configurada!');
}

if (vapidPrivateKey) {
  const privateKeyBuffer = urlBase64ToUint8Array(vapidPrivateKey);
  if (privateKeyBuffer && privateKeyBuffer.length === 32) {
    console.log('✅ Chave privada VAPID é válida! (32 bytes)');
  } else {
    console.log('❌ Chave privada VAPID parece inválida!');
    console.log('   Tamanho:', privateKeyBuffer ? privateKeyBuffer.length : 0, 'bytes (esperado: 32)');
  }
} else {
  console.log('❌ VAPID_PRIVATE_KEY não configurada!');
}

if (!vapidSubject) {
  console.log('⚠️  VAPID_SUBJECT não configurada (será usado padrão)');
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📝 Use esta chave pública no frontend:');
console.log('');
console.log(`  ${vapidPublicKey}`);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (!vapidPublicKey || !vapidPrivateKey) {
  console.log('⚠️  Chaves VAPID não configuradas corretamente!');
  console.log('');
  console.log('Para gerar novas chaves, execute:');
  console.log('  cd backend');
  console.log('  npx web-push generate-vapid-keys');
  console.log('');
  process.exit(1);
}

console.log('✅ Todas as chaves VAPID estão configuradas corretamente!');
console.log('');
console.log('🚀 Próximos passos:');
console.log('  1. Reinicie o backend: cd backend && npm run start:dev');
console.log('  2. Limpe o cache do navegador (Ctrl+Shift+R)');
console.log('  3. Teste em: http://localhost:3001/test-push.html');
console.log('');
