#!/bin/bash

# Database Backup Script
# Automates MongoDB backups with retention policy

set -e

BACKUP_DIR="./backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="albion_backup_$TIMESTAMP"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Starting database backup...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Backup MongoDB
echo "📦 Creating MongoDB backup..."
docker exec albion-mongo-prod mongodump \
    --username $MONGO_USERNAME \
    --password $MONGO_PASSWORD \
    --db albion_dev \
    --out /tmp/$BACKUP_NAME

# Copy backup from container
docker cp albion-mongo-prod:/tmp/$BACKUP_NAME $BACKUP_DIR/

# Compress backup
echo "🗜️ Compressing backup..."
tar -czf $BACKUP_DIR/${BACKUP_NAME}.tar.gz -C $BACKUP_DIR $BACKUP_NAME

# Clean up uncompressed backup
rm -rf $BACKUP_DIR/$BACKUP_NAME

# Clean old backups
echo "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR/${BACKUP_NAME}.tar.gz | cut -f1)

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo "📁 Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo "📊 Backup size: $BACKUP_SIZE"
echo "🗂️ Total backups: $(ls $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)"

# Setup cron job for automated backups (optional)
if [ "$1" = "--schedule" ]; then
    echo "⏰ Setting up daily backup schedule..."
    CRON_JOB="0 2 * * * $(pwd)/backup-setup.sh"
    (crontab -l ; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Daily backup scheduled at 2:00 AM${NC}"
fi

# Upload to cloud storage (optional - uncomment and configure)
# echo "☁️ Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/${BACKUP_NAME}.tar.gz s3://your-backup-bucket/
# or
# rclone copy $BACKUP_DIR/${BACKUP_NAME}.tar.gz remote:backups/

echo ""
echo "💡 Tips:"
echo "  - Run './backup-setup.sh --schedule' to enable daily automated backups"
echo "  - Configure cloud storage for offsite backups"
echo "  - Test restore process regularly"