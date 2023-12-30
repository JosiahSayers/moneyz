FROM node as build

WORKDIR /app
COPY . .
RUN npm i -g corepack
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node as app
WORKDIR /app
RUN npm i -g corepack
COPY --from=build /app/package.json .
COPY --from=build /app/yarn.lock .
COPY --from=build /app/build .
COPY --from=build /app/node_modules .
COPY script/start /app/start
COPY prisma /app/prisma
COPY public /app/public
RUN NODE_ENV=production yarn install --frozen-lockfile

CMD ["/app/start"]
