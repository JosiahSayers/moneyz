FROM node as build

WORKDIR /app
COPY package.json yarn.lock /app/
RUN npm i -g corepack
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node as app
WORKDIR /app
COPY package.json yarn.lock /app/
COPY build app
RUN yarn install --production=true --frozen-lockfile

CMD ["yarn", "start"]
