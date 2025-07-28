# 1. Instalar dependências de desenvolvimento
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# 2. Instalar só dependências de produção
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

# 3. Build da aplicação
FROM node:20-alpine AS build-env
WORKDIR /app
RUN corepack enable
COPY --from=development-dependencies-env /app ./
RUN yarn build

# 4. Container final para produção
FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
CMD ["yarn", "start"]

