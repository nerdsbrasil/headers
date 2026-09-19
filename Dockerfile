# Playwright's image already carries Chromium and its system libraries, which
# is the whole point of hosting this on a VPS: the API renders headers in a real
# browser, so the PNG matches the gallery exactly.
FROM mcr.microsoft.com/playwright:v1.63.0-noble AS base
WORKDIR /app
RUN npm install -g bun

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
# Chrome loads the render page from inside the container, not via the domain.
ENV RENDER_ORIGIN=http://127.0.0.1:3000
# Playwright's own Chromium; `chrome` only exists on the dev machine.
ENV CHROME_CHANNEL=""
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
# The image runs as root by default; drop to the image's unprivileged user so
# a browser process never runs as root.
USER pwuser
CMD ["bun", "run", "start"]
