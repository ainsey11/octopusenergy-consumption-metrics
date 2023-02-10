FROM node:19.6.0-buster-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm audit fix
CMD ["npm", "run", "start"]
