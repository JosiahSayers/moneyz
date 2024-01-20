FROM node:20-alpine

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate
CMD ["/app/script/start"]
