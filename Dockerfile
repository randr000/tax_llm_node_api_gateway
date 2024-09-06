FROM node:22.8-alpine3.19

ENV NODE_ENV=production

WORKDIR /app

COPY ./package.json ./package.json

COPY ./package-lock.json ./package-lock.json

RUN apk add --no-cache bash

RUN npm install --omit=dev

COPY . .

CMD ["node", "server.js"]