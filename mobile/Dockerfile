# ---- Builder ----
FROM node:18-bookworm-slim AS builder

WORKDIR /app

# Install bash for build script
RUN apt-get update -qq && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV EXPO_ROUTER_APP_ROOT=/app
ENV EXPO_ROUTER_PROJECT_ROOT=/app
ENV CI=1

# Match build-web.sh: pre-build, patch, then export
RUN node scripts/pre-build.js 2>/dev/null || true
RUN [ -f scripts/patch-expo-router.js ] && node scripts/patch-expo-router.js || true
RUN npx expo export --platform web

# ---- Runner ----
FROM node:18-bookworm-slim AS runner

WORKDIR /app

# Only need serve to run the static site
RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.js ./

# PORT is set by Railway at runtime
ENV PORT=3000
EXPOSE 3000

# Use Node script so PORT from env is always applied; bind to 0.0.0.0 for external access
CMD ["node", "serve.js"]
