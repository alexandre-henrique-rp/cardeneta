# 1. Instalar dependências e fazer o build
FROM node:22-alpine AS builder
WORKDIR /app

# Configura o Corepack e Yarn
RUN corepack enable && \
    yarn config set network-timeout 600000 -g

# Copia os arquivos necessários
COPY package.json yarn.lock ./

# Instala as dependências
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copia o restante dos arquivos e faz o build
COPY . .
RUN yarn build

# 2. Container final para produção
FROM node:22-alpine
WORKDIR /app

# Configura o Corepack
RUN corepack enable

# Copia apenas o necessário para produção
COPY package.json yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Instala o servidor de arquivos estáticos
RUN yarn global add serve

# Expõe a porta 3000
EXPOSE 3000

# Define o comando de inicialização
CMD ["serve", "-s", "build", "-l", "3000"]
