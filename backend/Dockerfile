FROM node:22-alpine

WORKDIR /app

# RUN npm install -g npm@latest

COPY package*.json .

RUN npm install

COPY . .

RUN npx prisma generate
# gerar o db
RUN npx prisma db push

RUN npm run build

EXPOSE 3030

CMD ["npm", "run", "start:prod"]
