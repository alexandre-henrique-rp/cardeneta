# 1. Instalar dependências de desenvolvimento
FROM node:22-alpine AS development-dependencies-env
WORKDIR /app

# Configurações para melhorar a estabilidade do Yarn
RUN corepack enable && \
    yarn config set network-timeout 600000 -g && \
    yarn config set network-concurrency 1 -g

# Copia apenas os arquivos necessários para instalação
COPY package.json yarn.lock ./

# Instala as dependências com retry em caso de falha
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 600000 --network-concurrency 1

# 2. Instalar só dependências de produção
FROM node:22-alpine AS production-dependencies-env
WORKDIR /app

# Configurações para melhorar a estabilidade do Yarn
RUN corepack enable && \
    yarn config set network-timeout 600000 -g && \
    yarn config set network-concurrency 1 -g

# Copia apenas os arquivos necessários para instalação
COPY package.json yarn.lock ./

# Instala apenas as dependências de produção
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production --network-timeout 600000 --network-concurrency 1

# 3. Build da aplicação
FROM node:22-alpine AS build-env
WORKDIR /app

# Copia os arquivos necessários
COPY --from=development-dependencies-env /app ./

# Executa o build
RUN yarn build

# 4. Container final para produção
FROM node:22-alpine
WORKDIR /app

# Copia apenas o necessário para produção
COPY package.json yarn.lock ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build

# Expõe a porta 3000
EXPOSE 3000

# Define o comando de inicialização
CMD ["yarn", "start"]
