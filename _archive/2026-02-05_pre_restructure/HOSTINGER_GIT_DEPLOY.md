# Hostinger Git Deployment Configuration

## Current Setup
- **Deployment Method**: Hostinger Git Auto-Deploy
- **Repository**: git@github.com:itspawanrajput/dthstorewebsite.git
- **Branch**: main
- **Deploy Directory**: Leave blank (deploys to public_html root)

## How It Works
1. You push code to GitHub (main branch)
2. Hostinger automatically pulls the latest changes
3. Built files from `dist/` folder are served
4. Website updates within 1-2 minutes

## Important Notes
- ✅ Built files (`dist/`) are committed to Git
- ✅ Hostinger can't run `npm build`, so we pre-build locally
- ✅ Every push to `main` triggers auto-deployment

## Deployment Workflow

### Making Changes
```bash
# 1. Make your code changes
# Edit files as needed

# 2. Build the production version
npm run build

# 3. Commit everything (including dist/)
git add .
git commit -m "Your change description"

# 4. Push to trigger deployment
git push origin main

# 5. Wait 1-2 minutes - Hostinger will auto-deploy!
```

## Directory Structure in Hostinger
After deployment, Hostinger should point to the `dist/` folder:

**Option A**: Configure in Hostinger
- Go to Hostinger hPanel
- Advanced → Git → Select your repository
- Set **Installation Path**: `dist`
- OR set document root to `public_html/dist`

**Option B**: Move files after deployment
If Hostinger deploys to root, you may need to configure the document root in Hostinger settings to point to the `dist` subdirectory.

## SSH Key Setup (Already Done ✓)
You've already added the SSH key to GitHub, which allows Hostinger to pull from your private repository.

## Testing the Deployment
1. Make a small change (e.g., update homepage title)
2. Run: `npm run build`
3. Commit and push
4. Visit your domain after 1-2 minutes
5. Verify the change appears

## Troubleshooting

### Website shows source code instead of built app
**Solution**: Update document root in Hostinger to point to `dist/` folder

### Changes not appearing
**Solution**: 
- Check Hostinger Git deployment logs
- Verify the branch is set to `main` (not `master`)
- Clear browser cache

### 404 errors
**Solution**: 
- Ensure `dist/index.html` exists in the repository
- Check Hostinger document root points to the correct folder
