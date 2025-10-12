/**
 * Script para testar conectividade com Firebase Cloud Messaging (FCM)
 * Útil para diagnosticar problemas de ETIMEDOUT
 * 
 * Execute: node scripts/test-fcm-connection.js
 */

const https = require('https');

console.log('\n=== Teste de Conectividade com FCM ===\n');

// Teste 1: Conexão básica
console.log('1️⃣  Testando conexão básica com FCM...');

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000,
  headers: {
    'User-Agent': 'Node.js FCM Connection Test'
  }
};

const startTime = Date.now();

const req = https.request(options, (res) => {
  const duration = Date.now() - startTime;
  console.log(`✅ Conectado com sucesso!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Tempo: ${duration}ms`);
  console.log(`   Headers:`, res.headers);
  
  res.on('data', (chunk) => {
    // Consumir dados
  });
  
  res.on('end', () => {
    console.log('\n2️⃣  Testando endpoints específicos...');
    testSpecificEndpoints();
  });
});

req.on('error', (error) => {
  const duration = Date.now() - startTime;
  console.error(`❌ Erro ao conectar!`);
  console.error(`   Código: ${error.code}`);
  console.error(`   Mensagem: ${error.message}`);
  console.error(`   Tempo: ${duration}ms`);
  
  if (error.code === 'ETIMEDOUT') {
    console.log('\n⚠️  TIMEOUT detectado!');
    console.log('\nPossíveis causas:');
    console.log('  1. Firewall bloqueando conexões HTTPS (porta 443)');
    console.log('  2. Servidor sem acesso à internet');
    console.log('  3. Proxy não configurado');
    console.log('  4. DNS não resolvendo corretamente');
    console.log('\nSoluções:');
    console.log('  - Verifique o firewall: sudo ufw status');
    console.log('  - Teste DNS: nslookup fcm.googleapis.com');
    console.log('  - Configure proxy no .env se necessário');
    console.log('  - Veja: backend/doc/push-notifications/troubleshooting-timeout.md');
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Timeout após 10 segundos!');
  req.destroy();
});

req.end();

// Função para testar endpoints específicos
function testSpecificEndpoints() {
  const endpoints = [
    { name: 'FCM v1', path: '/v1/projects/test/messages:send' },
    { name: 'FCM Legacy', path: '/fcm/send' }
  ];
  
  let completed = 0;
  
  endpoints.forEach(endpoint => {
    const opts = {
      hostname: 'fcm.googleapis.com',
      port: 443,
      path: endpoint.path,
      method: 'POST',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      }
    };
    
    const req = https.request(opts, (res) => {
      console.log(`   ${endpoint.name}: ✅ Acessível (Status: ${res.statusCode})`);
      res.on('data', () => {});
      res.on('end', () => {
        completed++;
        if (completed === endpoints.length) {
          printSummary();
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ${endpoint.name}: ❌ Erro (${error.code})`);
      completed++;
      if (completed === endpoints.length) {
        printSummary();
      }
    });
    
    req.on('timeout', () => {
      console.log(`   ${endpoint.name}: ❌ Timeout`);
      req.destroy();
    });
    
    req.end();
  });
}

function printSummary() {
  console.log('\n=== Resumo ===\n');
  console.log('✅ Servidor consegue conectar ao FCM!');
  console.log('✅ Notificações push devem funcionar');
  console.log('\nSe ainda houver erros ao enviar notificações:');
  console.log('  1. Verifique as chaves VAPID: node scripts/check-vapid-keys.js');
  console.log('  2. Verifique as subscrições no banco de dados');
  console.log('  3. Teste o endpoint: curl -X POST http://localhost:3000/push-notification/test');
  console.log('\n');
  process.exit(0);
}
