FROM node:18-alpine as base

EXPOSE 3000

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

WORKDIR /src

# Add chromium for pupeteer
RUN apk update \
    && apk add --no-cache --virtual .build-deps udev ttf-opensans chromium ca-certificates

# Install deps
COPY ./package*.json .
RUN npm ci
COPY . .

# Add pupeteer user
RUN addgroup -S pptruser && adduser -S -g pptruser -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /src

# Run as pupeteer user to keep sandboxing
USER pptruser

CMD npm run start