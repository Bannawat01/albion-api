# Domain Setup Guide for albion-market-ai.online

## 🚀 Production Deployment Steps

### **ขั้นตอนที่ 1: เตรียม Production Server**
```bash
# เลือก VPS provider (แนะนำ):
# - DigitalOcean ($6/month)
# - Linode ($5/month)
# - Vultr ($2.50/month)
# - AWS Lightsail ($3.50/month)

# OS: Ubuntu 22.04 LTS
# Specs: 1GB RAM, 1 vCPU (เพียงพอสำหรับเริ่มต้น)
```

### **ขั้นตอนที่ 2: ตั้งค่า DNS**
1. เข้าไปที่ Domain Registrar (ที่คุณซื้อ domain)
2. ตั้งค่า DNS records:

```
Type: A
Name: @
Value: YOUR_SERVER_IP_ADDRESS

Type: A
Name: www
Value: YOUR_SERVER_IP_ADDRESS

Type: CNAME (optional)
Name: api
Value: albion-market-ai.online
```

3. รอ DNS propagation (อาจใช้เวลา 5-30 นาที)

### **ขั้นตอนที่ 3: ติดตั้ง Dependencies บน Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin

# Install Git
sudo apt install git -y

# Clone project
git clone YOUR_REPOSITORY_URL albion-api
cd albion-api
```

### **ขั้นตอนที่ 4: ตั้งค่า Environment Variables**
```bash
# Copy environment file
cp .env.example .env

# แก้ไข .env file ด้วย editor
nano .env

# ตรวจสอบว่าตั้งค่าเหล่านี้ถูกต้อง:
# - MONGODB_URI (ใช้ MongoDB Atlas หรือ local)
# - GOOGLE_CLIENT_ID & SECRET
# - JWT_SECRET
# - N8N_WEBHOOK_TOKEN
```

### **ขั้นตอนที่ 5: ตั้งค่า SSL Certificate**
```bash
# ติดตั้ง Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# สร้าง certificate (รอ DNS propagation ก่อน)
sudo certbot certonly --standalone \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    --domain albion-market-ai.online \
    --domain www.albion-market-ai.online

# Copy certificates to project
sudo cp /etc/letsencrypt/live/albion-market-ai.online/fullchain.pem ./ssl/certificate.crt
sudo cp /etc/letsencrypt/live/albion-market-ai.online/privkey.pem ./ssl/private.key
sudo chmod 644 ./ssl/certificate.crt
sudo chmod 600 ./ssl/private.key
```

### **ขั้นตอนที่ 6: ตั้งค่า Firewall**
```bash
# ติดตั้ง UFW
sudo apt install ufw -y

# ตั้งค่า rules
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# ตรวจสอบ status
sudo ufw status
```

### **ขั้นตอนที่ 7: Deploy Application**
```bash
# Build และ start services
docker-compose -f docker-compose.prod.yml up -d --build

# ตรวจสอบ logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl -k https://albion-market-ai.online/health
curl -k https://albion-market-ai.online/api/health/database
```

### **ขั้นตอนที่ 8: ตั้งค่า Auto-renewal SSL**
```bash
# เพิ่ม cron job สำหรับ auto-renew SSL
sudo crontab -e

# เพิ่มบรรทัดนี้:
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /path/to/albion-api/docker-compose.prod.yml restart nginx
```

## 📊 Monitoring & Maintenance

### **ตรวจสอบ Application Health**
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f albion-server

# Check disk usage
df -h

# Check memory usage
docker stats
```

### **Backup Strategy**
```bash
# Database backup (run weekly)
./backup-setup.sh

# File backup (code + configs)
tar -czf backup_$(date +%Y%m%d).tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    .
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **SSL Certificate ไม่ work**
   ```bash
   # Check certificate files
   ls -la ./ssl/

   # Test SSL
   openssl s_client -connect albion-market-ai.online:443 -servername albion-market-ai.online
   ```

2. **Application ไม่ start**
   ```bash
   # Check environment variables
   cat .env

   # Check Docker logs
   docker-compose -f docker-compose.prod.yml logs albion-server
   ```

3. **DNS ไม่ resolve**
   ```bash
   # Test DNS
   nslookup albion-market-ai.online
   dig albion-market-ai.online
   ```

## 🎯 Performance Optimization

### **Nginx Optimization**
```nginx
# เพิ่มใน nginx.conf
gzip_types text/css application/javascript application/json;
client_max_body_size 50M;
keepalive_timeout 65;
```

### **Docker Optimization**
```yaml
# เพิ่มใน docker-compose.prod.yml
services:
  albion-server:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## 📞 Support

ถ้ามีปัญหา ติดต่อ:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Test endpoints: `curl https://albion-market-ai.online/api/health/database`
- DNS check: `dig albion-market-ai.online`

---
**🎉 Congratulations! Your Albion Online Database is now live at https://albion-market-ai.online**