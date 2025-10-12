/**
 * Script para gerar chaves VAPID para Push Notifications
 * Execute: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

console.log('\n🔑 Gerando chaves VAPID...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves geradas com sucesso!\n');
console.log('Adicione estas chaves ao arquivo .env do backend:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:seu-email@dominio.com`);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  IMPORTANTE: Mantenha a chave privada em segredo!\n');
