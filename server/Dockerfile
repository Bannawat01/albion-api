## Simple Dockerfile for albion-server (dev oriented)
FROM oven/bun:1

WORKDIR /app

# Copy manifest & lock first for better caching. The server repo uses bun.lock (not bun.lockb)
# Use wildcard so it works whether lock file is bun.lock or bun.lockb.
COPY package.json tsconfig.json ./
COPY bun.lock* ./

RUN bun install

# Copy source AFTER deps to leverage cache
COPY src ./src
COPY ssl ./ssl

EXPOSE 8800
ENV PORT=8800

CMD ["bun","run","src/index.ts"]
