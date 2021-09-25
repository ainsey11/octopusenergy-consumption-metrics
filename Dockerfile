FROM node:14-buster-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD ["npm", "run", "start"]