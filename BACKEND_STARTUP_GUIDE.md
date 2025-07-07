# 🚀 Backend Startup & Testing Guide

## ✅ **Import Error Fixed**
I fixed the `ImportError: cannot import name 'UserResponse'` by updating the admin endpoints to use proper imports.

## 🔧 **Manual Startup Instructions**

### 1. Start the Backend Server

Open a new PowerShell terminal and run:

```powershell
cd "C:\Users\charl\CodingProjets\Crow's Eye Website\api_backend"
python -m uvicorn crow_eye_api.main:app --host 0.0.0.0 --port 8001 --reload
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: [...]
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [####] using WatchFiles
INFO:     Started server process [####]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Test the Endpoints

Open a **second** PowerShell terminal and run these tests:

#### Test Health Endpoint:
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/health" -Method GET
```
**Expected:** Status 200, `{"status": "ok"}`

#### Test Media Endpoint (should require auth):
```powershell
try {
    Invoke-WebRequest -Uri "http://localhost:8001/api/v1/media" -Method GET
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)"
}
```
**Expected:** Status 401 (Unauthorized) - this is correct!

#### Test Galleries Endpoint (should require auth):
```powershell
try {
    Invoke-WebRequest -Uri "http://localhost:8001/api/v1/galleries" -Method GET
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.Value__)"
}
```
**Expected:** Status 401 (Unauthorized) - this is correct!

#### Test Login Endpoint:
```powershell
$body = @{
    email = "charlie@suarezhouse.net"
    password = "your_password_here"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Login Success: $($response.StatusCode)"
    $response.Content
} catch {
    Write-Host "Login Status: $($_.Exception.Response.StatusCode.Value__)"
}
```

## 🎯 **What Should Happen**

1. **Health endpoint** returns 200 OK
2. **Media/Galleries endpoints** return 401 (requires authentication) 
3. **Login endpoint** accepts your credentials and returns a token
4. **No more 404 errors** in the frontend media library

## 🌐 **Test in Your Web App**

Once the backend is running:

1. Go to your web app: `http://localhost:3000`
2. Sign in with: `charlie@suarezhouse.net`
3. Navigate to the **Media Library**
4. You should see **no more 404 errors** in the browser console
5. The media library should load (even if empty initially)

## 🔍 **Troubleshooting**

If you see errors:

### Database Warnings (OK to ignore):
```
Warning: Google Cloud Storage not configured: File "..." was not found.
Google Photos OAuth2 credentials not configured
```
These are fine - they just mean cloud features aren't configured.

### Import Errors (Fixed):
The `UserResponse` import error has been resolved.

### Port Issues:
If port 8001 is busy:
```powershell
# Kill any process using port 8001
netstat -ano | findstr :8001
# Note the PID and kill it:
taskkill /PID [PID_NUMBER] /F
```

## ✅ **Success Indicators**

- ✅ Backend starts without import errors
- ✅ Health endpoint returns 200
- ✅ Media endpoints return 401 (not 404!)
- ✅ Frontend media library loads without console errors
- ✅ You can upload and view media files

The key fix was updating all frontend API calls to use `/api/v1/` prefixes instead of root paths! 