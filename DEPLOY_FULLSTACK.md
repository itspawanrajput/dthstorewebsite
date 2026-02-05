# Deploying Full-Stack DTH Store to Hostinger

Your application has been upgraded to a **Full-Stack Node.js Application**.
It now serves both the **React Frontend** and the **Express Backend** (API) from a single server.

## 🚀 Deployment Options

### Option 1: Hostinger VPS (Recommended)
This gives you full control and is the easiest way to run Node.js apps.
1. SSH into your VPS.
2. Clone your repo: `git clone https://github.com/itspawanrajput/dthstorewebsite.git`
3. Install dependencies: `npm install`
4. Build the app: `npm run build`
5. Start the server: `npm run server`
6. (Optional) Use PM2 to keep it running: `pm2 start npm --name "dthstore" -- run server`

### Option 2: Hostinger Shared Hosting (with Node.js Support)
If you have a customized plan with Node.js access in hPanel:
1. **Upload Files**: Upload the entire project (excluding `node_modules`) to a folder (e.g., `public_html` or `dthstore`).
2. **Setup Node.js App**:
   - Go to **hPanel > Website > Node.js**
   - Create a new application.
   - **Application Root**: The folder where you uploaded files.
   - **Application Startup File**: `server/index.js`
   - **Install Dependencies**: Click the "NPM Install" button in hPanel.
3. **Build Frontend**:
   - Since Hostinger Shared Hosting often can't run `vite build` due to memory limits, **Build Locally** first:
     ```bash
     npm run build
     ```
   - Then upload the `dist` folder along with your project files.
4. **Environment Variables**:
   - Create a `.env` file in the server root with your database credentials and API keys.

## ⚠️ Important Changes
- The app now runs on a single port. The `server/index.js` handles API requests AND serves the frontend.
- API requests are now relative (`/api/...`), so no CORS issues!
- **Do not** just deploy the `dist/` folder anymore. You need the `server/` folder and `package.json` too.

## Automated Deployment (GitHub Actions)
To deploy the full app automatically, you must update `.github/workflows/deploy.yml` to copy **ALL** files, not just `dist/`.

```yaml
- name: Deploy Full Stack
  uses: SamKirkland/FTP-Deploy-Action@v4.3.4
  with:
    local-dir: ./
    server-dir: ./public_html/
    exclude: |
      **/.git*
      **/node_modules/**
```
