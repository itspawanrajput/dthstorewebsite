# Deploying DTH Store to Hostinger (Git + Automated)

You have set up a **GitHub Action** to automatically deploy your site whenever you push to GitHub!

## 1. Set up GitHub Repository
1.  Create a new repository on GitHub (e.g., `dth-store`).
2.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/dth-store.git
    git branch -M main
    git push -u origin main
    ```

## 2. Configure Hostinger FTP Secrets
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
Add the following "New Repository Secrets":

| Name | Value |
| :--- | :--- |
| `FTP_SERVER` | Your Hostinger FTP Host (e.g., `ftp.yourdomain.com`) |
| `FTP_USERNAME` | Your FTP Username (from Hostinger Dashboard) |
| `FTP_PASSWORD` | Your FTP Password |

## 3. One-Time Server Setup (Hostinger)
Since GitHub Actions copies the files but *cannot* run commands like `npm start` on Shared Hosting easily, you need to do this **once**:

1.  **Database**: Create the MySQL Database and import `server/schema.sql`.
2.  **Node.js**:
    *   Go to Hostinger Dashboard -> **Node.js Selector** (if available).
    *   Create an application pointing to `public_html/api`.
    *   Install dependencies: Enter the `public_html/api` folder via SSH or Terminal and run `npm install`.
3.  **Environment Variables**:
    *   Create a `.env` file manually inside `public_html/api` with your database credentials. (We excluded this from Git for security).

## 4. That's it!
Now, every time you make a change and run `git push`, your site will automatically update within minutes.
