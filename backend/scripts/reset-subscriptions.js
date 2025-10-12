/**
 * Script para resetar subscrições de push notifications
 * Limpa as subscrições antigas que foram criadas com chaves VAPID diferentes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Reset de Subscrições Push ===\n');

  try {
    // Contar subscrições atuais
    const count = await prisma.pushSubscription.count();
    console.log(`📊 Subscrições atuais: ${count}`);

    if (count === 0) {
      console.log('✅ Nenhuma subscrição para remover\n');
      return;
    }

    // Confirmar
    console.log('\n⚠️  ATENÇÃO: Isso vai remover TODAS as subscrições!');
    console.log('   Os usuários precisarão fazer login novamente para recriar.');
    console.log('\n   Pressione Ctrl+C para cancelar ou aguarde 5 segundos...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Remover todas
    const result = await prisma.pushSubscription.deleteMany({});
    console.log(`✅ ${result.count} subscrição(ões) removida(s)`);

    console.log('\n📋 Próximos passos:');
    console.log('   1. Reinicie o backend: pm2 restart backend');
    console.log('   2. No app, faça logout');
    console.log('   3. Faça login novamente');
    console.log('   4. Permita notificações quando solicitado');
    console.log('   5. Teste: node scripts/test-real-notification.js\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
