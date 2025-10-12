/**
 * Script para verificar e exibir as chaves VAPID configuradas
 * Útil para debug de problemas com push notifications
 * 
 * Execute: node scripts/check-vapid-keys.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('\n=== Verificação de Chaves VAPID ===\n');

// Tentar ler o arquivo .env
let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;
let subject = process.env.VAPID_SUBJECT;

// Se não estiver nas variáveis de ambiente, tentar ler do arquivo .env
if (!publicKey || !privateKey) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        let value = valueParts.join('=').trim();
        
        // Remover aspas simples ou duplas
        value = value.replace(/^['"]|['"]$/g, '');
        
        if (key.trim() === 'VAPID_PUBLIC_KEY') {
          publicKey = value;
        } else if (key.trim() === 'VAPID_PRIVATE_KEY') {
          privateKey = value;
        } else if (key.trim() === 'VAPID_SUBJECT') {
          subject = value;
        }
      });
    }
  } catch (error) {
    console.log('⚠️  Não foi possível ler o arquivo .env');
  }
}

console.log('Chaves no .env:');
console.log(
  'VAPID_PUBLIC_KEY:',
  publicKey ? '✅ Configurada' : '❌ Não configurada',
);
console.log(
  'VAPID_PRIVATE_KEY:',
  privateKey ? '✅ Configurada' : '❌ Não configurada',
);
console.log(
  'VAPID_SUBJECT:',
  subject ? '✅ Configurada' : '❌ Não configurada',
);

if (publicKey) {
  console.log('\nChave Pública (VAPID_PUBLIC_KEY):');
  console.log(publicKey);
}

if (privateKey) {
  console.log('\nChave Privada (VAPID_PRIVATE_KEY):');
  console.log(privateKey);
}

if (subject) {
  console.log('\nSubject (VAPID_SUBJECT):');
  console.log(subject);
}

// Se não estiverem configuradas, gerar novas
if (!publicKey || !privateKey) {
  console.log('\n⚠️  Chaves não configuradas! Gerando novas chaves VAPID...\n');

  const vapidKeys = webpush.generateVAPIDKeys();

  console.log('=== NOVAS CHAVES VAPID GERADAS ===\n');
  console.log('Adicione estas linhas ao seu arquivo .env:\n');
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:seu-email@dominio.com`);
  console.log('\n⚠️  IMPORTANTE: Após adicionar as chaves, você precisará:');
  console.log('1. Reiniciar o servidor backend');
  console.log('2. Limpar todas as subscrições antigas do banco de dados');
  console.log(
    '3. Fazer login novamente no frontend para criar novas subscrições',
  );
  console.log('\nComando SQL para limpar subscrições:');
  console.log('DELETE FROM "PushSubscription";');
} else {
  console.log('\n✅ Todas as chaves VAPID estão configuradas!');

  // Testar se as chaves são válidas
  try {
    webpush.setVapidDetails(
      subject || 'mailto:test@example.com',
      publicKey,
      privateKey,
    );
    console.log('✅ Chaves VAPID são válidas!');
  } catch (error) {
    console.log('❌ Erro ao validar chaves VAPID:', error.message);
  }
}

console.log('\n');
