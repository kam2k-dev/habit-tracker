# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .env .
COPY . .
RUN npm run build

# Runtime stage (tanpa nginx)
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist

EXPOSE 5050
CMD ["serve", "-s", "dist", "-l", "5050"]
