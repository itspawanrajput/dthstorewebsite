# Deployment: Static Frontend (Restored)

The deployment configuration has been reverted to **deploy only the `dist/` folder**.

## How it works now
1. GitHub Actions runs `npm run build`
2. The resulting `dist/` folder (containing index.html, css, js) is uploaded to `public_html/` on Hostinger.
3. The server handles it as a standard static site.

## If you need the Backend
The current deployment **DOES NOT** deploy the Node.js backend logic (`server/`).
It relies on the frontend running in the browser and potentially using LocalStorage (as per your original setup).

If you previously had a working backend deployment and want to restore that specific setup, please let me know!
