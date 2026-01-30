# 🚀 Deployment Checklist for Hostinger

Use this checklist to deploy your DTH Store website to Hostinger.

---

## ✅ Pre-Deployment Checklist

### 1. Code Ready
- [x] All features tested locally
- [x] Products page working
- [x] Lead forms functional
- [x] Special offers page tested
- [x] Build completed successfully
- [x] Changes committed to Git

### 2. Hostinger Account Setup
- [ ] Hostinger hosting account active
- [ ] Domain configured (if using custom domain)
- [ ] FTP credentials obtained from Hostinger dashboard

### 3. GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository URL: `https://github.com/itspawanrajput/dthstorewebsite`

---

## 📝 Deployment Steps

### Step 1: Configure GitHub Secrets
Go to: `https://github.com/itspawanrajput/dthstorewebsite/settings/secrets/actions`

Add these 3 secrets:

| Secret Name | Where to get the value |
|------------|------------------------|
| `FTP_SERVER` | Hostinger → File Manager → FTP Accounts |
| `FTP_USERNAME` | Hostinger → File Manager → FTP Accounts |
| `FTP_PASSWORD` | Hostinger → File Manager → FTP Accounts |

**How to get FTP credentials from Hostinger:**
1. Log in to Hostinger control panel (hPanel)
2. Go to **Files** → **FTP Accounts**
3. Copy the FTP server address, username, and password
4. If no FTP account exists, create one for your domain

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Monitor Deployment
1. Go to: `https://github.com/itspawanrajput/dthstorewebsite/actions`
2. Watch the "Deploy to Hostinger" workflow
3. Wait for green checkmark ✅ (usually 2-3 minutes)

### Step 4: Verify Deployment
- [ ] Visit your domain (e.g., `https://yourdomain.com`)
- [ ] Check homepage loads correctly
- [ ] Click "Plans" to test products page
- [ ] Click "Special Offers" page
- [ ] Test lead form submission
- [ ] Check mobile responsiveness

---

## 🔧 Post-Deployment Configuration

### Recommended Settings in Hostinger:

1. **SSL Certificate** (HTTPS)
   - Go to hPanel → Security → SSL
   - Install free SSL certificate
   - Force HTTPS redirect

2. **Performance Optimization**
   - Enable Cloudflare CDN (optional but recommended)
   - Enable browser caching
   - Enable Gzip compression

3. **Email Setup** (for receiving lead notifications)
   - Create email: `support@yourdomain.com`
   - Configure Telegram bot for lead notifications

---

## 🐛 Troubleshooting

### Issue: Deployment failed in GitHub Actions
**Solution:**
- Check FTP credentials are correct
- Verify FTP server allows external connections
- Check GitHub Actions logs for specific error

### Issue: Website shows 404 or blank page
**Solution:**
- Verify files deployed to `public_html/`
- Check if `index.html` exists in root directory
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: Forms not submitting
**Solution:**
- This is normal - data saves to localStorage only
- For production, consider Telegram bot integration

### Issue: Changes not reflecting
**Solution:**
- Clear browser cache
- Check if GitHub Action completed successfully
- Wait a few minutes for CDN cache to clear (if using Cloudflare)

---

## 📱 Environment Variables (Optional)

If you want to use Gemini AI features:

1. Create `.env.local` file locally (already in .gitignore)
2. Add: `VITE_GEMINI_API_KEY=your_api_key_here`
3. For production: Configure in Hostinger's environment variables (if available)

**Note:** Gemini AI features work client-side, so API key will be exposed. Use API key restrictions in Google Cloud Console.

---

## 🎯 Next Deploy (Making Changes)

Whenever you make changes:

```bash
# 1. Test locally
npm run dev

# 2. Build to verify
npm run build

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to deploy
git push origin main

# 5. Check GitHub Actions for deployment status
```

---

## 📊 Current Status

**Last Tested:** 2026-01-30
**Build Status:** ✅ Passing
**Local Dev:** ✅ Working on port 3001
**Production Build:** ✅ Generated in `dist/`

**Working Features:**
- ✅ Homepage with hero slider
- ✅ Products catalog (6 plans)
- ✅ Special offers page
- ✅ Lead capture forms
- ✅ Admin login (username: admin/staff, password: 123)
- ✅ CRM dashboard for lead management
- ✅ Responsive design

**Known Limitations:**
- Data stored in localStorage (browser-specific)
- No cross-device data sync
- Hardcoded credentials for admin (should be env vars for production)

---

## 🔐 Security Reminders

Before going live:
- [ ] Change default admin passwords
- [ ] Review and update phone numbers/emails in footer
- [ ] Set up email forwarding for support@yourdomain.com
- [ ] Test form submissions
- [ ] Enable SSL certificate
- [ ] Set up backup solution

---

## 📞 Support

**GitHub Repository:** `https://github.com/itspawanrajput/dthstorewebsite`
**Hosting:** Hostinger Shared Hosting
**Framework:** React + Vite + TypeScript + Tailwind CSS

For deployment issues, check:
1. GitHub Actions logs
2. Hostinger support docs
3. FTP connection status

---

**Ready to deploy?** Start with Step 1 above! 🚀
