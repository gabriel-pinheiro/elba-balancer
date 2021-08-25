FROM node:alpine AS builder

WORKDIR /home/node
COPY package.json .
COPY package-lock.json .

RUN npm set progress=false
RUN npm install --only=production
RUN cp -R node_modules /home/prod_modules
RUN npm install
COPY . .
RUN npm run build


FROM node:alpine

WORKDIR /home/node
COPY --from=builder /home/prod_modules ./node_modules
COPY --from=builder /home/node/dist ./dist
COPY default.env .

CMD ["node", "dist/main"]
