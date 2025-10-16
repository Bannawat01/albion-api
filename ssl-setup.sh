#!/bin/bash

# SSL Certificate Setup with Let's Encrypt
# Run this on your production server

set -e

DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"

echo "🔐 Setting up SSL certificate for $DOMAIN..."

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily for certificate generation
echo "Stopping nginx temporarily..."
sudo systemctl stop nginx || docker-compose -f docker-compose.prod.yml down

# Generate certificate
echo "Generating SSL certificate..."
sudo certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domain $DOMAIN \
    --domain www.$DOMAIN

# Create SSL directory and copy certificates
echo "Setting up certificate files..."
sudo mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/certificate.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/private.key

# Set proper permissions
sudo chmod 644 ./ssl/certificate.crt
sudo chmod 600 ./ssl/private.key

# Setup auto-renewal
echo "Setting up auto-renewal..."
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"; } | sudo crontab -

echo "✅ SSL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update nginx.conf with correct certificate paths"
echo "2. Update docker-compose.prod.yml volumes for SSL"
echo "3. Run: docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "🔄 Certificates will auto-renew monthly"