# 🚀 Vercel Frontend Deployment Guide

## ⚠️ Important: Set Environment Variables

Your frontend needs to know where your backend API is located. You **MUST** set the `VITE_API_URL` environment variable in Vercel.

## 🔧 Step-by-Step Setup

### Step 1: Get Your Backend URL

- **If backend is on Render**: `https://your-backend-name.onrender.com`
- **If backend is on Vercel**: `https://your-backend.vercel.app`
- **If backend is local**: `http://localhost:5000` (only for local dev)

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Click **Add New**
4. Add the following:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://medease-backend.onrender.com`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

Or simply push a new commit to trigger a new deployment.

## ✅ Verify It Works

1. After deployment, open your frontend URL
2. Open browser console (F12)
3. You should see: `🔗 API Base URL: https://your-backend-url.com`
4. Try registering a new account
5. Check that it connects to your backend (not localhost)

## 🐛 Troubleshooting

### Error: "Cannot connect to backend at http://localhost:5000"

**Problem**: `VITE_API_URL` is not set in Vercel

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Add `VITE_API_URL` with your backend URL
3. Redeploy

### Error: "Registration failed" or 401 errors

**Problem**: Backend CORS not configured for your frontend domain

**Solution**:
1. Go to your backend (Render/Vercel)
2. Set `CLIENT_ORIGIN` environment variable
3. Add your Vercel frontend URL: `https://your-frontend.vercel.app`
4. Restart backend

### Error: Network Error / CORS Error

**Problem**: Backend is not running or CORS misconfigured

**Solution**:
1. Check backend is deployed and running
2. Visit backend health check: `https://your-backend.onrender.com/health`
3. Verify `CLIENT_ORIGIN` includes your frontend URL
4. Check backend logs for errors

## 📝 Environment Variables Checklist

### Frontend (Vercel):
- ✅ `VITE_API_URL` - Your backend URL

### Backend (Render):
- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - Secret for JWT tokens
- ✅ `CLIENT_ORIGIN` - Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- ✅ `GEMINI_API_KEY` - At least one AI provider key
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Automatically set by Render

## 🔗 Example Configuration

### Frontend (Vercel):
```
VITE_API_URL=https://medease-backend.onrender.com
```

### Backend (Render):
```
CLIENT_ORIGIN=https://med-ease-ai-frontend.vercel.app
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
NODE_ENV=production
```

## 💡 Pro Tips

1. **Always set environment variables before first deployment**
2. **Use different backend URLs for preview vs production** (optional)
3. **Check browser console for API URL confirmation**
4. **Test registration/login after deployment**
5. **Keep backend and frontend URLs in sync**

---

**Need help?** Check the browser console for detailed error messages!

