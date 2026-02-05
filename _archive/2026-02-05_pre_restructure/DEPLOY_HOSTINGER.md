# Deploying DTH Store to Hostinger via Git

This guide shows you how to set up **automated deployment** using GitHub Actions. Every time you push to GitHub, your site will automatically update on Hostinger! 🚀

## Prerequisites
- A Hostinger shared hosting account
- A GitHub account
- Access to your Hostinger FTP credentials

---

## Step 1: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `dthstorewebsite`)
2. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/dthstorewebsite.git
git branch -M main
git push -u origin main
```

---

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following THREE secrets:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `FTP_SERVER` | Your Hostinger FTP Host | Hostinger Dashboard → File Manager → FTP Accounts |
| `FTP_USERNAME` | Your FTP Username | Same location as above |
| `FTP_PASSWORD` | Your FTP Password | Same location as above |

**Example values:**
- FTP_SERVER: `ftp.yourdomain.com` or `156.67.218.321`
- FTP_USERNAME: `u123456789` or `youruser@yourdomain.com`
- FTP_PASSWORD: Your secure FTP password

---

## Step 3: Configure Hostinger (One-Time Setup)

### Option A: If you want the site at root domain (recommended)
Your site will be accessible at `https://yourdomain.com`

✅ No additional configuration needed! The GitHub Action deploys to `public_html/`

### Option B: If you want the site in a subfolder
Your site will be accessible at `https://yourdomain.com/dthstore`

Edit `.github/workflows/deploy.yml` line 30:
```yaml
server-dir: ./public_html/dthstore/  # Change this line
```

---

## Step 4: Deploy!

That's it! Now every time you make changes:

```bash
git add .
git commit -m "Updated products"
git push
```

Your website will **automatically**:
1. ✅ Build the React app
2. ✅ Upload files to Hostinger via FTP
3. ✅ Be live within 2-3 minutes

---

## Monitoring Deployments

- Go to your GitHub repository → **Actions** tab
- You'll see the deployment status for each push
- Green checkmark ✅ = Successfully deployed
- Red X ❌ = Deployment failed (check logs)

---

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# Upload the 'dist' folder to Hostinger
# Use FileZilla or your FTP client to upload dist/* to public_html/
```

---

## Technical Notes

### Frontend-Only Application
This is a **100% frontend application** using:
- **React** for UI
- **LocalStorage** for data persistence
- **No backend server** required
- **No database** needed

### Data Storage
- All leads, products, and site configuration are stored in the browser's localStorage
- Data persists across page refreshes
- Data is user-specific (not shared across devices)

### For Production at Scale
If you need:
- Shared data across multiple devices
- Real database
- Backend API

Consider upgrading to a backend solution or using a service like Firebase, Supabase, or a custom Node.js server.

---

## Troubleshooting

### Deployment Failed?
1. Check GitHub Actions logs for specific errors
2. Verify FTP credentials are correct
3. Make sure FTP server allows connections from GitHub's IPs
4. Check Hostinger file permissions

### Website not updating?
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if files were uploaded to the correct directory
3. Verify the build completed successfully

### 404 Error?
1. Ensure files are in `public_html/` (or your configured directory)
2. Check that `index.html` exists in the root of your deploy directory
3. Verify your domain is pointing to the correct directory in Hostinger

---

## Next Steps

✅ Test the deployment by visiting your domain
✅ Configure your custom domain in Hostinger
✅ Set up SSL certificate (free with Hostinger)
✅ Test lead forms and admin panel

## Support

For questions or issues:
- Check GitHub Actions logs
- Contact Hostinger support for hosting issues
- Review Vite documentation for build issues
