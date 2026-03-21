# ---- Builder ----
FROM node:18-bookworm-slim AS builder

# Build-time env for Expo (inlined into web bundle). Set EXPO_PUBLIC_API_URL in Railway Variables.
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

WORKDIR /app

RUN apt-get update -qq && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV EXPO_ROUTER_APP_ROOT=/app
ENV EXPO_ROUTER_PROJECT_ROOT=/app
ENV CI=1

RUN node scripts/pre-build.js 2>/dev/null || true
RUN [ -f scripts/patch-expo-router.js ] && node scripts/patch-expo-router.js || true
RUN npx expo export --platform web

# ---- Runner ----
FROM nginx:alpine AS runner

# Railway sets PORT at runtime; nginx template uses it. Default for local runs.
ENV PORT=3000

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose matches PORT so Railway/docs are consistent. Do not override to 8080 in Railway.
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
