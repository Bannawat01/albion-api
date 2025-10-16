# Dockerfile for Render.com deployment
FROM node:18-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package.json ./server/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build client
RUN cd client && npm install && npm run build

# Expose port
EXPOSE 8800

# Start command
CMD ["bun", "run", "src/index.ts"]