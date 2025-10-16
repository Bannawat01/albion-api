# Dockerfile for Render.com deployment
FROM node:18-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install server dependencies
RUN cd server && bun install

# Install client dependencies
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 8800

# Start command
CMD ["cd", "server", "&&", "bun", "run", "src/index.ts"]