# Build frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY ./frontend .
RUN npm install && npm run build

# Serve with nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]