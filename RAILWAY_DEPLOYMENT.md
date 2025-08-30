# Railway Deployment Guide

This app requires deploying two separate Railway services:

## 1. Backend Service (Python API)

### Deploy from `espn-service/` folder:
1. Create new Railway project
2. Connect to GitHub repository  
3. Set root directory to: `espn-service`
4. Railway will auto-detect Python and use `requirements.txt`

### Environment Variables to Set:
```
PORT=8000 (Railway sets this automatically)
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

## 2. Frontend Service (React/Vite)

### Deploy from `prototype/` folder:
1. Create new Railway project
2. Connect to GitHub repository
3. Set root directory to: `prototype`
4. Railway will auto-detect Node.js and build React app

### Environment Variables to Set:
```
VITE_API_BASE_URL=https://your-backend-service.railway.app
```

## Deployment Steps:

1. **Deploy Backend First**
   - Get the Railway URL for backend service
   
2. **Update Frontend Environment**
   - Set `VITE_API_BASE_URL` to your backend URL
   
3. **Update Backend CORS**
   - Set `ALLOWED_ORIGINS` to your frontend URL
   
4. **Deploy Frontend**
   - Should now connect to backend successfully

## Testing Deployment:
- Backend health check: `https://your-backend.railway.app/`
- Frontend should load and connect to backend automatically