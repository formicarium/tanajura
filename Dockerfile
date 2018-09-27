FROM "node:9.11.1-alpine"

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN apk add --update git

RUN yarn install --frozen-lockfile --no-cache

ENV NODE_ENV "prod"

COPY . .

EXPOSE 3002
EXPOSE 6666

RUN rm -f .npmrc
CMD [ "npm", "run", "start" ]
