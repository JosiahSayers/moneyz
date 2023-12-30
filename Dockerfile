FROM node as build

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npx prisma generate
CMD ["/app/script/start"]
