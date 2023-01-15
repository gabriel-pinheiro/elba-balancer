FROM node:19 AS builder
WORKDIR /tmp/build

# Installing project dependencies
COPY package.json .
COPY package-lock.json .
RUN npm set progress=false
RUN npm install --omit=dev
RUN cp -R node_modules /tmp/prod_modules
RUN npm install

# Building project
COPY . .
RUN npm run test:mocks
RUN npm run build


# Setting up publish container
FROM node:19
WORKDIR /tmp/build

# Installing build dependencies
RUN npm set progress=false
RUN npm install -g pkg codetunnel-cli

# Copying built files
COPY --from=builder /tmp/prod_modules ./node_modules
COPY --from=builder /tmp/build/dist ./dist
COPY package.json .
COPY install.sh .

# Packaging project
RUN npm run package

# Publishing project
ARG CT_TOKEN
RUN echo $CT_TOKEN | ct cdn login
RUN ct cdn create object elba bin/elba --name elba
RUN ct cdn create object elba install.sh
