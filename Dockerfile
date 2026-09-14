FROM node:18-alpine AS build
WORKDIR /app
ARG BUILD_CONFIG=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=${BUILD_CONFIG}

FROM nginx:stable-alpine
# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/bciqweb /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Set proper ownership
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
	chown -R appuser:appgroup /var/cache/nginx && \
	chown -R appuser:appgroup /var/log/nginx && \
	touch /var/run/nginx.pid && \
	chown appuser:appgroup /var/run/nginx.pid
USER appuser
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]