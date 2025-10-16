#!/bin/bash

# Monitoring Setup Script
# Installs Prometheus, Grafana, and configures basic monitoring

set -e

echo "📊 Setting up monitoring stack..."

# Create monitoring network
docker network create monitoring || true

# Create Prometheus configuration
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'albion-api'
    static_configs:
      - targets: ['albion-server:8800']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/metrics'

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongo:27017']
EOF

# Create docker-compose.monitoring.yml
cat > docker-compose.monitoring.yml << EOF
version: '3.8'

networks:
  monitoring:
    driver: bridge

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: albion-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - monitoring
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: albion-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: albion-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
EOF

# Start monitoring stack
echo "Starting monitoring services..."
docker-compose -f docker-compose.monitoring.yml up -d

echo "✅ Monitoring setup completed!"
echo ""
echo "📊 Access points:"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3001 (admin/admin123)"
echo "   - Node Exporter: http://localhost:9100"
echo ""
echo "🔧 Next steps:"
echo "1. Configure Grafana dashboards"
echo "2. Add alerts in Prometheus"
echo "3. Set up notification channels"