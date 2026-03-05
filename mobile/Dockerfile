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

# PORT is set by Railway at runtime. Shell form so $PORT is expanded; exec so serve is PID 1.
ENV PORT=3000
EXPOSE 3000

# Must use shell form so Railway's injected $PORT is expanded (JSON form does not expand env vars).
CMD ["sh", "-c", "exec serve dist -s -l 0.0.0.0:${PORT}"]
