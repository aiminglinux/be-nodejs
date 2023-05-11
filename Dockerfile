FROM node:16-alpine

WORKDIR /app

RUN npm install

COPY . .

EXPOSE  5000

CMD ["npm", "start"]