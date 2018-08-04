FROM "node:9.11.1-alpine"

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --no-cache

COPY . .

EXPOSE 3002
EXPOSE 6666

RUN rm -f .npmrc
CMD [ "npm", "start" ]