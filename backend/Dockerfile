# Estágio de dependências
FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn prisma generate
RUN yarn build
EXPOSE 3000

# Comando para iniciar a aplicação com migrate deploy
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:prod"]
