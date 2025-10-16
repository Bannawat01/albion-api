#!/bin/bash

# Production Deployment Script for Albion API
# Make sure to run: chmod +x deploy.sh

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

echo -e "${YELLOW}Removing old images...${NC}"
docker image prune -f

echo -e "${YELLOW}Building and starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}Running health checks...${NC}"

# Check Nginx
if curl -f -k https://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx is healthy${NC}"
else
    echo -e "${RED}❌ Nginx health check failed${NC}"
fi

# Check API
if curl -f -k https://localhost/api/health/database > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
fi

# Check Frontend
if curl -f -k https://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend check failed${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "🌐 Your application should be available at:"
echo "   - Frontend: https://your-domain.com"
echo "   - API: https://your-domain.com/api"
echo ""
echo "📊 Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"