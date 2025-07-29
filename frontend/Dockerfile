# 1. Instalar dependências e fazer o build
FROM node:22-alpine
WORKDIR /app
COPY package*.json .
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
