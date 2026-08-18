FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Build production bundle
COPY . .
RUN npm run build -- --configuration production

# Production stage — serve with Nginx
FROM nginx:alpine

# Copy built Angular app
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Nginx config for Angular single-page app routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
