# Deployment Guide for KIRAN Project

## Overview
This guide explains how to deploy both the frontend (Netlify) and backend (Cloud Platform) so they can communicate properly.

## Backend Deployment (Required for API to work)

### Option 1: Render (Recommended - Free Tier)
1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `kiran-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
5. **Add Environment Variables:**
   - Go to Environment → Environment Variables
   - Add all variables from your `.env` file
6. **Deploy**

### Option 2: Railway
1. **Sign up** at [railway.app](https://railway.app)
2. **Create new project** → Deploy from GitHub repo
3. **Set root directory** to `backend`
4. **Add environment variables**
5. **Deploy**

### Option 3: Heroku
1. **Sign up** at [heroku.com](https://heroku.com)
2. **Create new app**
3. **Connect GitHub repository**
4. **Set buildpacks** to Node.js
5. **Add environment variables**
6. **Deploy**

## Frontend Deployment (Netlify)

### Current Setup
Your frontend is already deployed on Netlify, but it's trying to connect to `localhost:5000` which won't work.

### Steps to Fix:
1. **Deploy your backend first** (using one of the options above).
2. **Get your backend URL** (e.g., `https://kiran-backend.onrender.com`).
3. **Set Environment Variable in Netlify:**
   - Go to your Netlify site dashboard.
   - Go to **Site settings** > **Build & deploy** > **Environment**.
   - Click **Edit variables**.
   - Add a new variable:
     - **Key**: `VITE_API_URL`
     - **Value**: Your actual deployed backend URL (e.g., `https://kiran-backend.onrender.com`).
4. **Trigger a new deploy** in Netlify from the "Deploys" tab to use the new variable.

## Environment Variables Needed

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Frontend (Set this in Netlify Site Settings)
- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-domain.com`

## CORS Configuration

Make sure your backend allows requests from your Netlify domain. In your backend `server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-domain.netlify.app'
  ],
  credentials: true
}));
```

## Testing the Deployment

1. **Test backend API directly:**
   ```
   https://your-backend-domain.com/api/users
   ```

2. **Test frontend:**
   - Visit your Netlify URL
   - Try to login/register
   - Check browser console for API errors

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update backend CORS configuration
2. **API not found**: Check backend deployment URL
3. **Environment variables**: Ensure all required variables are set
4. **Database connection**: Verify MongoDB connection string

### Debug Steps:
1. Check browser console for errors
2. Check backend logs in your cloud platform
3. Test API endpoints directly
4. Verify environment variables are set correctly

## Security Notes

- Never commit `.env` files to Git
- Use environment variables for all sensitive data
- Enable HTTPS for production
- Set up proper CORS policies
- Use strong JWT secrets

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check CORS configuration 