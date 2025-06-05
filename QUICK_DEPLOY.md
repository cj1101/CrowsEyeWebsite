# 🚀 Quick Deployment Guide

## Your Crow's Eye marketing tool is ready to deploy!

### ✅ Web App - Already Deployed!
**Live URL**: https://crows-eye-website.web.app

The web application is already live and accessible. However, the API is currently running on localhost, so you'll need to deploy it for full functionality.

### 📡 API Deployment - Choose Your Method

#### Option 1: Railway (Easiest - Recommended)

1. **Visit**: https://railway.app
2. **Sign up** with GitHub
3. **Click "Deploy from GitHub repo"**
4. **Select**: `breadsmith_marketing/social_media_tool_v5_noMeta_final` folder
5. **Click Deploy** - Railway will auto-detect the Dockerfile
6. **Copy the URL** Railway gives you (e.g., `https://crow-eye-api-production.up.railway.app`)

#### Option 2: Render (Free Alternative)

1. **Visit**: https://render.com
2. **Sign up** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository**
5. **Settings**:
   - **Root Directory**: `breadsmith_marketing/social_media_tool_v5_noMeta_final`
   - **Runtime**: Docker
   - **Build Command**: `docker build -t app .`
   - **Start Command**: `uvicorn crow_eye_api.main:app --host 0.0.0.0 --port $PORT`
6. **Deploy** and copy the URL

#### Option 3: Fly.io (Good Performance)

1. **Install flyctl**: https://fly.io/docs/flyctl/install/
2. **Navigate to API folder**:
   ```bash
   cd "../breadsmith_marketing/social_media_tool_v5_noMeta_final"
   ```
3. **Deploy**:
   ```bash
   flyctl auth login
   flyctl launch
   flyctl deploy
   ```

### 🔧 Update Web App with API URL

Once your API is deployed:

1. **Note the API URL** (e.g., `https://your-api-name.railway.app`)
2. **Update the web app**:
   - Set environment variable: `NEXT_PUBLIC_API_URL=your-api-url`
   - Rebuild and redeploy: `npm run build && firebase deploy`

### 🎯 Current Status

- ✅ **Web App**: Live at https://crows-eye-website.web.app  
- ⏳ **API**: Needs deployment (choose method above)
- 📚 **Full Documentation**: See `DEPLOYMENT_GUIDE.md`

### 🆘 Need Help?

1. **Railway Issues**: Check logs in Railway dashboard
2. **Web App Issues**: Check Firebase console
3. **Connection Issues**: Verify API URL is correctly set

**You're almost there!** 🎉

Just deploy the API using one of the methods above, update the API URL, and your complete Crow's Eye marketing tool will be live and fully functional!

---

### 💡 Pro Tips

- **Railway**: Offers 500 hours/month free (enough for most usage)
- **Render**: Offers 750 hours/month free 
- **Fly.io**: Great performance, 160GB-hours/month free
- All services scale to zero when not in use (cost-effective)

### 🔄 Continuous Deployment

For automatic deployments when you push to Git, check the GitHub Actions workflows in `DEPLOYMENT_GUIDE.md`. 