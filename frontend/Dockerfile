# Frontend image. Build context = ./frontend
#   docker build -t spur-frontend --build-arg VITE_API_BASE_URL=https://your-api ./frontend
# Builds the static bundle and serves it with nginx (SPA fallback).
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# Baked at build time (Vite inlines VITE_* vars).
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
