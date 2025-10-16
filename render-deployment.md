# Render.com PaaS Deployment Guide

## 🚀 Deploy to Render.com (Platform as a Service)

### **Why Render.com?**
- ✅ **Free tier** สำหรับเริ่มต้น
- ✅ **Managed infrastructure** ไม่ต้องจัดการ server
- ✅ **Auto SSL** certificates
- ✅ **Git integration** Deploy จาก GitHub
- ✅ **Built-in monitoring** และ logs
- ✅ **Easy scaling** และ custom domains

### **ขั้นตอนที่ 1: เตรียม Project**

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. **สร้าง render.yaml** สำหรับ multi-service deployment
```yaml
# render.yaml
services:
  - type: web
    name: albion-client
    runtime: static
    buildCommand: npm run build
    staticPublishPath: ./out
    envVars:
      - key: NODE_ENV
        value: production

  - type: web
    name: albion-server
    runtime: node
    buildCommand: bun install
    startCommand: bun run src/index.ts
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        fromSecret: mongodb_uri
      - key: JWT_SECRET
        fromSecret: jwt_secret
      - key: GOOGLE_CLIENT_ID
        fromSecret: google_client_id
      - key: GOOGLE_CLIENT_SECRET
        fromSecret: google_client_secret
      - key: N8N_WEBHOOK_TOKEN
        fromSecret: n8n_webhook_token

  - type: pserv
    name: albion-redis
    runtime: redis
    ipAllowList: []  # Allow all connections

databases:
  - name: albion-mongo
    databaseName: albion_prod
    user: albion_user
    plan: starter
```

### **ขั้นตอนที่ 2: สมัคร Render.com**

1. เข้าไปที่ [render.com](https://render.com)
2. Sign up ด้วย GitHub account
3. Connect GitHub repository

### **ขั้นตอนที่ 3: Deploy Services**

#### **Option A: Multi-service deployment (แนะนำ)**
1. **สร้าง New Blueprint** จาก render.yaml
2. **เลือก repository** ที่มี render.yaml
3. **ตั้งค่า Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   N8N_WEBHOOK_TOKEN=...
   ```
4. **Deploy** - Render จะสร้าง services อัตโนมัติ

#### **Option B: Manual deployment**

1. **Deploy Backend (Web Service)**
   - Service Type: Web Service
   - Runtime: Node
   - Build Command: `bun install`
   - Start Command: `bun run src/index.ts`
   - Environment: Production
   - Instance Type: Free/Starter ($7/month)

2. **Deploy Frontend (Static Site)**
   - Service Type: Static Site
   - Build Command: `npm run build`
   - Publish Directory: `out`
   - Environment: Production

3. **Deploy Database (ถ้าต้องการ)**
   - Service Type: Managed MongoDB
   - Plan: Free/Starter

### **ขั้นตอนที่ 4: ตั้งค่า Custom Domain**

1. **ใน Render Dashboard:**
   - เข้าไป service ที่ต้องการ
   - Settings → Custom Domains
   - เพิ่ม `albion-market-ai.online` และ `www.albion-market-ai.online`

2. **ตั้งค่า DNS:**
   ```
   Type: CNAME
   Name: www
   Value: your-render-domain.onrender.com

   Type: CNAME
   Name: @
   Value: your-render-domain.onrender.com
   ```

### **ขั้นตอนที่ 5: ตั้งค่า Environment Variables**

ใน Render Dashboard → Environment:

```
# Backend Environment Variables
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://albion-market-ai.online/api/auth/google/callback
N8N_WEBHOOK_TOKEN=...

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

## 📊 Render.com Pricing

### **Free Tier:**
- ✅ 750 ชั่วโมง/เดือน (Static sites)
- ✅ 750 ชั่วโมง/เดือน (Web services)
- ✅ Free SSL certificates
- ✅ Custom domains
- ❌ Sleep after 15 นาที inactive
- ❌ Limited bandwidth

### **Paid Plans:**
- **Starter**: $7/month - 750 ชั่วโมง + persistent apps
- **Standard**: $25/month - 2,500 ชั่วโมง
- **Pro**: $89/month - 10,000 ชั่วโมง

## 🔧 Render.com Features

### **Advantages:**
- ✅ **Zero maintenance** - Managed platform
- ✅ **Auto scaling** - Scale automatically
- ✅ **Built-in CI/CD** - Deploy จาก Git push
- ✅ **Global CDN** - Fast worldwide delivery
- ✅ **Monitoring** - Built-in logs และ metrics
- ✅ **Backups** - Automatic database backups

### **Limitations:**
- ❌ **Sleep on free tier** - Apps sleep after inactivity
- ❌ **Limited customization** - Less control than VPS
- ❌ **Vendor lock-in** - Tied to Render ecosystem

## 🚨 Troubleshooting Render

### **Common Issues:**

1. **Build fails**
```
# Check build logs in Render dashboard
# Common issues:
# - Missing dependencies in package.json
# - Wrong build commands
# - Environment variables not set
```

2. **App crashes**
```
# Check service logs
# Common causes:
# - Database connection issues
# - Missing environment variables
# - Port conflicts (use PORT env var)
```

3. **Custom domain not working**
```
# Check DNS propagation
dig albion-market-ai.online

# Verify domain settings in Render
# Wait 24-48 hours for DNS changes
```

## 📈 Scaling on Render

### **Vertical Scaling:**
1. Upgrade service plan
2. Increase instance size
3. Add more RAM/CPU

### **Horizontal Scaling:**
- Render supports auto-scaling
- Multiple instances automatically
- Load balancing included

## 🎯 Best Practices for Render

1. **ใช้ Environment Groups** สำหรับแยก dev/prod
2. **Monitor usage** ใน dashboard
3. **Set up alerts** สำหรับ downtime
4. **Use private services** สำหรับ databases
5. **Enable auto-deploy** จาก GitHub

## 🔄 Migration from VPS to Render

ถ้าอยากย้ายจาก VPS มา Render:

1. **Backup data** จาก current server
2. **Push code** to GitHub
3. **Create render.yaml** configuration
4. **Deploy services** on Render
5. **Import data** to Render database
6. **Update DNS** ชี้ไปที่ Render
7. **Test thoroughly** ก่อนปิด VPS

## 📞 Render Support

- **Documentation**: Extensive docs และ guides
- **Community**: Active community forum
- **Support**: Email support (paid plans)
- **Status Page**: Real-time service status

---

**🎉 Your Albion Online Database is now on Render.com at https://albion-market-ai.online**

**Free tier limitations:**
- Apps sleep after 15 minutes of inactivity
- Limited bandwidth and compute time
- Upgrade to paid plans for production use