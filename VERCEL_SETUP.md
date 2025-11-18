# Connect Vercel Frontend to Render Backend

## After Render Backend is Deployed:

### 1. Get Your Backend URL
After Render deployment succeeds, copy your backend URL. It will look like:
```
https://jett3airlines-backend.onrender.com
```

### 2. Configure Vercel Environment Variable

Go to your Vercel project dashboard:

1. Click **Settings** → **Environment Variables**
2. Add new variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com/api/v1`
   - **Environments**: Check ✅ Production (and Preview if needed)
3. Click **Save**

### 3. Redeploy Vercel

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (**...**)
4. Click **Redeploy**
5. Wait for deployment to complete

### 4. Test Your App

Visit your Vercel URL and try:
- Sign up
- Login
- Search flights

**Note**: First request to Render backend might be slow (30-60 seconds) if it's been idle, as free tier spins down after 15 minutes of inactivity.

## Alternative: Update .env.production

If you prefer to commit the URL:

1. Edit `frontend/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-actual-backend-url.onrender.com/api/v1
   ```

2. Commit and push:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push
   ```

3. Vercel will auto-deploy

## Troubleshooting

**Frontend shows "Unable to connect to server":**
- Check if backend URL is correct
- Verify backend is running on Render
- Check browser console for CORS errors
- Verify environment variable is set in Vercel

**CORS errors:**
- Make sure backend allows your Vercel domain
- Check `backend/src/index.ts` CORS configuration

**Backend is slow:**
- Free tier spins down after 15 minutes
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast
