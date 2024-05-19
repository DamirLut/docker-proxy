FROM oven/bun:alpine

RUN apk add --no-cache tini openssh

WORKDIR /app

COPY . .

RUN bun install --frozen-lock

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun","./src/index.ts"]