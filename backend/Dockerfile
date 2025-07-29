FROM node:22-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npx prisma migrate dev --name init
RUN npx prisma generate
RUN npm run build
EXPOSE 3030
CMD ["npm", "run", "start:prod"]
