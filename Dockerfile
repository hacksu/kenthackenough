FROM node:latest

# Install dependencies
COPY package.json .
RUN npm install

# Copy source code and build the project
COPY ./src ./src
COPY tsconfig.json .
COPY dist.paths.js .
RUN npm run build

ENV NODE_ENV=production

CMD [ "npm", "start" ]