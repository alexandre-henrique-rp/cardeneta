/**
 * Script para testar notificações em loop
 * Útil para debug
 */

const { execSync } = require('child_process');

console.log('\n=== Teste de Notificações em Loop ===\n');
console.log('Enviando notificação a cada 10 segundos...');
console.log('Pressione Ctrl+C para parar\n');

let count = 1;

const sendNotification = () => {
  console.log(`\n[${new Date().toLocaleTimeString()}] Enviando notificação #${count}...`);
  
  try {
    const output = execSync(
      'node /var/www/html/cardeneta/backend/scripts/test-real-notification.js',
      { encoding: 'utf8' }
    );
    
    if (output.includes('✅ Notificação enviada com sucesso')) {
      console.log(`✅ Notificação #${count} enviada com sucesso!`);
      console.log('📱 Verifique seu celular agora!');
    } else {
      console.log('❌ Erro ao enviar');
      console.log(output);
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
  
  count++;
};

// Enviar imediatamente
sendNotification();

// Enviar a cada 10 segundos
setInterval(sendNotification, 10000);
