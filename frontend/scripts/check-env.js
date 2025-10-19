#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar variáveis de ambiente do Vite
 */

import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Diagnóstico de Variáveis de Ambiente\n');
console.log('📁 Diretório raiz:', rootDir);

// Verificar se o arquivo .env existe
const envPath = join(rootDir, '.env');
const envExamplePath = join(rootDir, '.env.example');

console.log('\n📄 Verificando arquivos:');
console.log('  .env:', existsSync(envPath) ? '✅ Existe' : '❌ Não encontrado');
console.log('  .env.example:', existsSync(envExamplePath) ? '✅ Existe' : '❌ Não encontrado');

if (existsSync(envPath)) {
  console.log('\n📋 Conteúdo do .env:');
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      const value = line.split('=')[1] || '';
      const isSet = value.trim() !== '' && !value.includes('your-') && !value.includes('-here');
      console.log(`  ${isSet ? '✅' : '⚠️'}  ${key}`);
    }
  });
  
  // Carregar variáveis usando Vite
  console.log('\n🔧 Carregando com Vite:');
  const env = loadEnv('development', rootDir, 'VITE_');
  
  const requiredVars = [
    'VITE_API_URL'
  ];
  
  console.log('\n📊 Status das variáveis VITE_:');
  requiredVars.forEach(varName => {
    const value = env[varName];
    const status = value ? '✅' : '❌';
    const preview = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'NÃO ENCONTRADA';
    console.log(`  ${status} ${varName}: ${preview}`);
  });
  
} else {
  console.log('\n❌ Arquivo .env não encontrado!');
  console.log('   Execute: cp .env.example .env');
}

console.log('\n💡 Dicas:');
console.log('   1. Certifique-se de que o arquivo .env está no diretório frontend/');
console.log('   2. Todas as variáveis expostas ao client devem começar com VITE_');
console.log('   3. Reinicie o servidor após modificar o .env');
console.log('   4. Não use aspas ao redor dos valores no .env');
