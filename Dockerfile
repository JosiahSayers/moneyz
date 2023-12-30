FROM node as build

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node as app
WORKDIR /app
RUN npm i -g corepack
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
RUN NODE_ENV=production npm ci
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/build build
COPY script/start /app/start
COPY prisma /app/prisma
COPY public /app/public
RUN npx prisma generate

CMD ["/app/start"]
