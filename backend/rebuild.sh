#!/bin/bash

# Sai imediatamente se um comando falhar
# Note que desativaremos temporariamente com '|| true' no loop de verificação
set -e

# --- VARIÁVEIS DE CONFIGURAÇÃO ---
# Mensagem exata que indica que a aplicação está pronta
SUCCESS_MESSAGE="Nest running on http://localhost:3030"

# Tempo máximo em segundos para esperar pela mensagem
TIMEOUT_SECONDS=20

# --- PARTE 1: PEGAR O NOME DO CONTÊINER ---

# Verifica se o docker-compose.yml existe
if [ ! -f docker-compose.yml ]; then
    echo "❌ Erro: Arquivo docker-compose.yml não encontrado!"
    exit 1
fi

# Pega o primeiro container_name definido no arquivo
container_name=$(grep 'container_name:' docker-compose.yml | head -n 1 | cut -d ':' -f 2 | tr -d ' ')
if [ -z "$container_name" ]; then
    echo "❌ Erro: não foi possível encontrar 'container_name' no docker-compose.yml"
    exit 1
fi

# Pegar o nome da imagem
image_name=$(grep 'image:' docker-compose.yml | head -n 1 | cut -d ':' -f 2 | tr -d ' ')
if [ -z "$image_name" ]; then
    echo "❌ Erro: não foi possível encontrar 'image' no docker-compose.yml"
    exit 1
fi

# verifica se a imagem existe se existir ele remove
if sudo docker images | grep -q "$image_name"; then
    echo "✅ Imagem '$image_name' encontrada."
    sudo docker stop "$container_name" || true
    sudo docker rm "$container_name" || true
    sudo docker rmi "$image_name"
fi

# --- PARTE 2: SUBIR O CONTÊINER ---
echo "⚙️  Subindo os serviços com 'docker-compose up -d --build'..."
sudo docker-compose up -d --build

# --- PARTE 3: VERIFICAÇÃO DO LOG COM TIMEOUT ---
echo "⏳ Aguardando a aplicação Nest iniciar... (procurando por '$SUCCESS_MESSAGE')"
echo "   Timeout: $TIMEOUT_SECONDS segundos."

# Usamos 'seq' para criar a sequência de segundos para o loop
for i in $(seq 1 $TIMEOUT_SECONDS); do
    # Verifica os logs do contêiner. O 'grep -q' é silencioso e apenas retorna um status de sucesso/falha.
    # '2>/dev/null' suprime erros caso o contêiner demore um instante para criar o arquivo de log.
    if sudo docker logs "$container_name" 2>/dev/null | grep -q "$SUCCESS_MESSAGE"; then
        echo "✅ Sucesso! A aplicação Nest está rodando."
        echo "--- Log de confirmação ---"
        # Mostra a linha de sucesso para confirmação visual
        sudo docker logs "$container_name" 2>/dev/null | grep "$SUCCESS_MESSAGE"
        echo "--------------------------"
        exit 0 # Termina o script com sucesso
    fi
    
    echo "   ...tentativa $i/$TIMEOUT_SECONDS. Mensagem ainda não encontrada. Aguardando 1s."
    sleep 1
done

# --- PARTE 4: FALHA (TIMEOUT ATINGIDO) ---
echo "❌ Erro: Timeout de $TIMEOUT_SECONDS segundos atingido!"
echo "   A mensagem '$SUCCESS_MESSAGE' não foi encontrada nos logs."
echo "--- Últimos logs do contêiner '$container_name' para depuração ---"
# Mostra os últimos logs para ajudar a identificar o problema
sudo docker logs "$container_name" --tail 100
echo "-------------------------------------------------"
exit 1 # Termina o script com um código de erro