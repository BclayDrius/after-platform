FROM node:20-alpine

WORKDIR /src

# Docker uses CMD to start de container, so we need to use RUN for build steps
# only one CMD command can happen
COPY package.json package-lock.json ./
RUN npm install

COPY . .


# Desactiva el chequeo de linting en la build
ENV NEXT_DISABLE_ESLINT_PLUGIN=true

##builds the next.js app
RUN npm run build

##expone el puerto 3000
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "start"]