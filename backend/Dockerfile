# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache dumb-init curl \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup database ./database
COPY --chown=appuser:appgroup scripts ./scripts
COPY --chown=appuser:appgroup docs ./docs
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5000/api/v1/health/live || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
