# 🔥 Firebase Setup Guide for DTH Store

This guide will walk you through setting up Firebase Authentication for your DTH Store website.

---

## 📋 What You'll Get

After setup, you'll have:
- ✅ **Email/Password Login** - Users can create accounts
- ✅ **Google Sign-In** - One-click login with Google
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Role-Based Access** - Admin vs Staff roles based on email

---

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Open [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Create a project"** (or "Add project")
   - Enter project name: `dth-store` (or your preferred name)
   - Click **Continue**

3. **Google Analytics** (Optional)
   - You can disable this for simplicity
   - Click **Create project**
   - Wait for project creation (~30 seconds)

4. **Click "Continue"** when ready

---

## Step 2: Register Your Web App

1. **In Project Overview**, click the **Web icon** `</>`
   
   ![Web App Icon](https://firebase.google.com/static/images/auth/web-icon.png)

2. **Register App**
   - App nickname: `DTH Store Web`
   - ❌ DON'T check "Firebase Hosting" (we're using Hostinger)
   - Click **"Register app"**

3. **Copy Firebase Config**
   
   You'll see code like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB1234567890abcdefghijk",
     authDomain: "dth-store-12345.firebaseapp.com",
     projectId: "dth-store-12345",
     storageBucket: "dth-store-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```

4. **Save these values** - You'll need them for Step 4

5. Click **"Continue to console"**

---

## Step 3: Enable Authentication Methods

### Enable Email/Password Login

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### Enable Google Sign-In

1. Still in Authentication → Sign-in method
2. Click **"Add new provider"**
3. Select **"Google"**
4. Toggle **"Enable"** to ON
5. **Project public-facing name**: `DTH Store`
6. **Support email**: Select your email
7. Click **"Save"**

---

## Step 4: Configure Your Project

### Update Your `.env` File

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Firebase credentials:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyB1234567890abcdefghijk
   VITE_FIREBASE_AUTH_DOMAIN=dth-store-12345.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dth-store-12345
   VITE_FIREBASE_STORAGE_BUCKET=dth-store-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

   # Disable demo mode since Firebase is now configured
   VITE_DEMO_MODE=false

   # Your admin email(s) - these get ADMIN role
   VITE_ADMIN_EMAILS=your-email@gmail.com,another-admin@gmail.com
   ```

3. **Important**: Replace the placeholder values with YOUR actual Firebase config!

---

## Step 5: Add Authorized Domains

If deploying to Hostinger (or any domain):

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Add your domain: `dthstore.shop` (your actual domain)
4. Also add: `www.dthstore.shop` if using www

This allows Firebase Auth to work on your production domain.

---

## Step 6: Test Your Setup

### Restart Dev Server

```bash
# Stop the current server (Ctrl+C if running)
# Then restart:
npm run dev
```

### Test Login Flow

1. Open http://localhost:3000
2. Click **"Staff"** in navigation
3. You should now see:
   - **Google Sign-In button** (visible when Firebase configured)
   - **No "Demo Mode Active" warning**
   - **"Forgot password?"** link
   - **"Create account"** option

### Create Test Accounts

**Option 1: Google Sign-In**
- Click "Continue with Google"
- Sign in with your Google account
- You'll be assigned ADMIN role if your email is in `VITE_ADMIN_EMAILS`

**Option 2: Email/Password**
- Click "Create one" at the bottom
- Enter your email, password (min 6 chars), and name
- Click "Create Account"

---

## Step 7: Build for Production

After testing:

```bash
# Rebuild with Firebase config baked in
npm run build
```

Upload the new `dist/` folder to Hostinger.

---

## 🔐 Security Best Practices

### DO ✅
- Keep `.env` file out of version control (it's in `.gitignore`)
- Use authorized domains list in Firebase
- Set up strong passwords for admin accounts
- Regularly review authenticated users in Firebase Console

### DON'T ❌
- Commit `.env` file to GitHub
- Share your Firebase API keys publicly
- Use simple passwords for admin accounts

---

## 🔧 Troubleshooting

### "Google Sign-In popup blocked"
- **Cause**: Browser blocking popups
- **Fix**: Allow popups for localhost/your domain

### "auth/operation-not-allowed"
- **Cause**: Sign-in method not enabled
- **Fix**: Enable Email/Password and Google in Firebase Console

### "auth/unauthorized-domain"
- **Cause**: Domain not in authorized list
- **Fix**: Add your domain in Firebase Console → Authentication → Settings

### Firebase config not working
- **Cause**: Wrong values in `.env`
- **Fix**: Double-check all values match Firebase Console exactly
- **Note**: Restart dev server after changing `.env`

### Still seeing "Demo Mode Active"
- **Cause**: `VITE_DEMO_MODE=true` or Firebase not configured
- **Fix**: 
  1. Set `VITE_DEMO_MODE=false`
  2. Ensure all `VITE_FIREBASE_*` values are set
  3. Restart dev server: `npm run dev`

---

## 📊 Firebase Console Quick Links

Once set up, you can manage users at:
- **Users**: [Firebase Console → Authentication → Users](https://console.firebase.google.com/)
- **Sign-in Methods**: Authentication → Sign-in method
- **Settings**: Authentication → Settings

---

## 💰 Firebase Pricing

Firebase Authentication is **FREE** for:
- ✅ 50,000 monthly active users (Email/Password)
- ✅ Unlimited Google Sign-In
- ✅ Password reset emails

This is more than enough for most small-medium businesses!

---

## Need Help?

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/start)
- [Firebase Console](https://console.firebase.google.com/)

---

*Last updated: February 2026*
