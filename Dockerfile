FROM node:10

WORKDIR /var/www/kenthackenough

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]