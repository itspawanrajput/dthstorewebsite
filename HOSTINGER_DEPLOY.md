# 🚀 DTH Store - Hostinger Deployment Guide

## Overview

This guide explains how to deploy the DTH Store website to **Hostinger Shared Hosting**.

> ⚠️ **Important**: Hostinger shared hosting only supports **static files**. The Node.js backend (`server/`) will NOT run on shared hosting.

## Architecture on Hostinger

```
┌─────────────────────────────────────────────────────────────┐
│                  Hostinger Shared Hosting                    │
│                                                              │
│  public_html/                                                │
│  ├── index.html          (React SPA entry point)            │
│  ├── .htaccess           (Apache SPA routing)               │
│  └── assets/             (CSS, JS, images)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS Requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                              │
│  • WhatsApp API (AWS EC2/VPS)    - Leads & Notifications    │
│  • Firebase Auth (Optional)       - User Authentication     │
│  • Web3Forms                      - Email Notifications     │
│  • Telegram Bot API               - Telegram Notifications  │
│  • LocalStorage                   - Fallback Data Storage   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### 1. Configure Environment Variables

Before building, create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
# Demo mode (set to 'false' if using Firebase)
VITE_DEMO_MODE=true

# Firebase (optional - leave empty for demo mode)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Admin emails (comma-separated)
VITE_ADMIN_EMAILS=your-admin@email.com

# WhatsApp API URL (your EC2 instance)
VITE_WHATSAPP_API_URL=http://your-ec2-ip:3000

# Gemini AI (optional)
GEMINI_API_KEY=your_gemini_key
```

### 2. Build the Project

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with all static files.

---

## 🔧 Deployment Methods

### Method 1: File Manager Upload (Recommended for Beginners)

1. **Build the project** locally:
   ```bash
   npm run build
   ```

2. **Login to Hostinger** → Go to **File Manager**

3. **Navigate to** `public_html/`

4. **Delete existing files** (backup first if needed)

5. **Upload the contents of `dist/`** folder:
   - Select all files inside `dist/`
   - Upload to `public_html/`

6. **Upload `.htaccess`**:
   - Copy `public/.htaccess` to `public_html/`
   - This enables SPA routing

7. **Test your site** at your domain

---

### Method 2: Git Deployment (Recommended for Updates)

1. **Enable Git on Hostinger**:
   - Go to **Website** → **Advanced** → **Git**
   - Create a repository

2. **Add Hostinger remote**:
   ```bash
   git remote add hostinger ssh://u123456789@your-domain.com:65002/home/u123456789/public_html
   ```

3. **Push the dist folder**:
   
   Since we need to push the built files, we keep `dist/` in git:
   
   ```bash
   # Build first
   npm run build
   
   # Add and commit
   git add dist/
   git commit -m "Build for deployment"
   
   # Push to Hostinger
   git push hostinger main:main
   ```

4. **Configure .htaccess** on the server if not included

---

### Method 3: FTP/SFTP Upload

1. **Get FTP credentials** from Hostinger dashboard

2. **Connect using FileZilla** or similar:
   - Host: ftp.your-domain.com
   - Username: your-ftp-username
   - Password: your-ftp-password
   - Port: 21 (FTP) or 22 (SFTP)

3. **Upload `dist/` contents** to `public_html/`

4. **Upload `.htaccess`** to `public_html/`

---

## ⚙️ Post-Deployment Configuration

### Configure NotificationSettings in Admin Panel

After deployment:

1. Login with demo credentials: `admin` / `admin123`
2. Go to **Admin Dashboard** → **Notifications**
3. Configure:
   - **WhatsApp API URL**: Your EC2 instance URL
   - **API Key**: Your WhatsApp API key
   - **Session ID**: DTHSTORE
   - **Admin Number**: Your WhatsApp number

### Enable SSL/HTTPS

1. Go to Hostinger → **SSL** → **Install Free SSL**
2. Wait for propagation
3. Enable **Force HTTPS**

---

## 🔄 Updating the Website

### Quick Update Process

```bash
# 1. Make your changes

# 2. Test locally
npm run dev

# 3. Build for production
npm run build

# 4. Deploy (choose your method)
# Option A: Upload via File Manager
# Option B: Push via Git
git add dist/
git commit -m "Update: description of changes"
git push hostinger main:main
```

---

## 🐛 Troubleshooting

### Issue: 404 errors on page refresh

**Cause**: Apache doesn't know about SPA routing

**Fix**: Ensure `.htaccess` is in `public_html/` with correct content:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [L,QSA]
</IfModule>
```

### Issue: WhatsApp API not connecting

**Cause**: CORS or mixed content issues

**Fix**: 
1. Ensure your WhatsApp API server allows your domain in CORS
2. Use HTTPS for your API if your site uses HTTPS
3. Check browser console for errors

### Issue: Login not working

**Cause**: Demo mode not enabled or Firebase misconfigured

**Fix**:
1. Ensure `VITE_DEMO_MODE=true` in `.env` before building
2. Or properly configure all Firebase environment variables

### Issue: Blank page after deployment

**Cause**: JavaScript path issues

**Fix**:
1. Check browser console for 404 errors
2. Ensure all files from `dist/` are uploaded
3. Verify file paths are correct

---

## 📊 Performance Optimization

### Already Implemented

- ✅ GZIP compression via `.htaccess`
- ✅ Browser caching headers
- ✅ Code splitting (vendor chunks)
- ✅ Asset hashing for cache busting

### Additional Recommendations

1. **Enable Cloudflare** (free) for CDN and additional caching
2. **Optimize images** before upload (compress to WebP)
3. **Monitor performance** with Google PageSpeed Insights

---

## 🔐 Security Checklist

- [ ] SSL enabled and forced
- [ ] `.env` file not uploaded
- [ ] Demo mode disabled if using Firebase
- [ ] Admin emails properly configured
- [ ] WhatsApp API secured with API key
- [ ] No sensitive data in client-side code

---

## 📞 Support

For issues related to:
- **Hostinger**: Contact Hostinger support
- **WhatsApp API**: Check EC2 instance logs
- **This codebase**: Review console errors and network tab

---

*Last updated: February 2026*
