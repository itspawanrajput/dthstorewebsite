# WhatsApp API Deployment Guide for AWS EC2 Ubuntu

## Prerequisites
- AWS EC2 Ubuntu instance running
- SSH access to the instance
- Port 3000 (or your preferred port) open in Security Group

## Step 1: SSH into your EC2 instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 2: Update system and install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 for process management
sudo npm install -g pm2
```

## Step 3: Clone and setup WhatsApp API
```bash
cd ~
git clone https://github.com/chrishubert/whatsapp-api.git
cd whatsapp-api
npm install
```

## Step 4: Configure environment
```bash
cp .env.example .env
nano .env
```

Update these values in .env:
```
PORT=3000
API_KEY=your_secure_api_key_here
BASE_WEBHOOK_URL=https://dthstore.shop/webhook
ENABLE_LOCAL_CALLBACK_EXAMPLE=FALSE
SET_MESSAGES_AS_SEEN=TRUE
ENABLE_SWAGGER_ENDPOINT=TRUE
```

## Step 5: Install Chromium for whatsapp-web.js
```bash
sudo apt install -y chromium-browser

# For headless operation, also install these dependencies
sudo apt install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0
```

## Step 6: Start the API with PM2
```bash
cd ~/whatsapp-api
pm2 start server.js --name whatsapp-api
pm2 save
pm2 startup  # Follow the instructions shown
```

## Step 7: Verify it's running
```bash
pm2 status
curl http://localhost:3000/ping
```

## Step 8: Initialize WhatsApp Session
Open in browser: http://YOUR_EC2_IP:3000/session/start/DTHSTORE

You'll see a QR code in the terminal or at:
http://YOUR_EC2_IP:3000/session/qr/DTHSTORE/image

Scan this QR code with your WhatsApp mobile app:
1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Click "Link a Device"
4. Scan the QR code

## Step 9: Test sending a message
```bash
curl -X POST "http://YOUR_EC2_IP:3000/client/sendMessage/DTHSTORE" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secure_api_key_here" \
  -d '{"chatId": "919311252564@c.us", "message": "Hello from DTH Store!"}'
```

## Security Recommendations

### Set up Nginx as reverse proxy (optional but recommended)
```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/whatsapp-api
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL with Let's Encrypt (if using domain)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Useful PM2 Commands
```bash
pm2 logs whatsapp-api      # View logs
pm2 restart whatsapp-api   # Restart the API
pm2 stop whatsapp-api      # Stop the API
pm2 monit                  # Monitor resources
```

## Troubleshooting

### If QR code doesn't appear:
```bash
pm2 logs whatsapp-api --lines 50
```

### If Chromium fails:
```bash
# Run with more verbose logging
cd ~/whatsapp-api
DEBUG=whatsapp-web.js:* npm start
```

### Check session status:
```bash
curl http://localhost:3000/session/status/DTHSTORE
```
