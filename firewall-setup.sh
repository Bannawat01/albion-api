#!/bin/bash

# Firewall Configuration Script
# Sets up UFW firewall rules for production server

set -e

echo "🔥 Configuring firewall..."

# Install UFW if not installed
if ! command -v ufw &> /dev/null; then
    echo "Installing UFW..."
    sudo apt update
    sudo apt install -y ufw
fi

# Reset UFW to default
echo "Resetting UFW to defaults..."
sudo ufw --force reset

# Default policies
echo "Setting default policies..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if using non-standard)
echo "Allowing SSH..."
sudo ufw allow ssh
# sudo ufw allow 2222  # If using custom SSH port

# Allow HTTP and HTTPS
echo "Allowing HTTP and HTTPS..."
sudo ufw allow 80
sudo ufw allow 443

# Allow monitoring ports (optional)
echo "Allowing monitoring ports..."
sudo ufw allow 9090  # Prometheus
sudo ufw allow 3001  # Grafana
sudo ufw allow 9100  # Node Exporter

# Rate limiting for SSH to prevent brute force
echo "Setting up rate limiting..."
sudo ufw limit ssh

# Enable UFW
echo "Enabling UFW..."
echo "y" | sudo ufw enable

# Show status
echo ""
echo "📋 Firewall status:"
sudo ufw status verbose

echo ""
echo "✅ Firewall configuration completed!"
echo ""
echo "🔒 Security features enabled:"
echo "  - Default deny incoming connections"
echo "  - Allow outgoing connections"
echo "  - SSH with rate limiting"
echo "  - HTTP (80) and HTTPS (443)"
echo "  - Monitoring ports (9090, 3001, 9100)"
echo ""
echo "🛡️ Additional security recommendations:"
echo "  - Change default SSH port (22) to custom port"
echo "  - Use SSH keys instead of passwords"
echo "  - Install fail2ban for additional protection"
echo "  - Regularly update server packages"
echo "  - Monitor logs for suspicious activity"