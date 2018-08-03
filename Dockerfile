FROM "node:9.11.1-alpine"

ARG NPM_TOKEN 
WORKDIR /usr/src/app

COPY _.npmrc .npmrc
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --no-cache


COPY . .

EXPOSE 3002

RUN rm -f .npmrc
CMD [ "npm", "start" ]