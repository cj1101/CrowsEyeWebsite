# 🐍 Python API Integration Setup Guide

This guide will help you integrate your Python marketing tool with your Next.js website using serverless API routes.

## ✅ What's Already Done

I've created the following integration files for you:

- ✅ **`src/pages/api/auth/login.ts`** - JWT authentication endpoint
- ✅ **`src/pages/api/marketing/generate-content.ts`** - Content generation endpoint
- ✅ **`src/pages/api/marketing/analytics.ts`** - Analytics endpoint  
- ✅ **`src/lib/python-bridge.ts`** - TypeScript bridge to your Python tool
- ✅ **`python-bridge-script.py`** - Python script that interfaces with your marketing tool

## 🔧 Setup Steps

### 1. Create Environment Variables

Create a `.env.local` file in your project root with:

```bash
# JWT Authentication Secret
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Python Tool Path (adjust if different)
PYTHON_TOOL_PATH=C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final

# Optional: Database URL if you add user persistence
DATABASE_URL=your-database-url-here
```

### 2. Update Python Bridge Script

You need to **edit the `python-bridge-script.py`** file to match your actual Python tool structure:

1. **Check the import paths** around line 20-25:
   ```python
   # Current (you may need to adjust these):
   from src.core.content_generator import ContentGenerator
   from src.core.analytics import AnalyticsManager
   from src.core.media_processor import MediaProcessor
   ```

2. **Find your actual class names** by looking in your Python tool's `src/` directory

3. **Update the method calls** to match your actual API (around lines 45-55)

### 3. Copy the Bridge Script

**Copy** the `python-bridge-script.py` to your Python marketing tool directory:

```bash
# Copy from your website directory to your Python tool
copy python-bridge-script.py "C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final\scripts\api_bridge.py"
```

### 4. Install Dependencies

Make sure your Python environment has all required packages:

```bash
# Navigate to your Python tool directory
cd "C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final"

# Install/check dependencies
pip install -r requirements.txt
```

### 5. Test the Integration

1. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints:**
   
   **Authentication Test:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass"}'
   ```
   
   **Content Generation Test:**
   ```bash
   curl -X POST http://localhost:3000/api/marketing/generate-content \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"content_type":"social_post","prompt":"Create a post about coffee"}'
   ```

## 🚀 How It Works

1. **Client** makes request to Next.js API route (e.g., `/api/marketing/generate-content`)
2. **Next.js API** verifies JWT token and user permissions
3. **Python Bridge** executes your Python marketing tool via `python-bridge-script.py`
4. **Python Script** runs your actual marketing tool functions
5. **Results** are returned back through the chain to the client

## 📁 File Structure

```
your-website/
├── src/
│   ├── lib/
│   │   └── python-bridge.ts          # TypeScript bridge
│   └── pages/api/
│       ├── auth/
│       │   └── login.ts              # Authentication
│       └── marketing/
│           ├── generate-content.ts   # Content generation
│           └── analytics.ts          # Analytics
├── python-bridge-script.py          # Python bridge script
└── .env.local                       # Environment variables
```

## 🎯 Next Steps

### For Your Marketing Tool Tab:

1. **Create a frontend component** that calls these API endpoints
2. **Add user management** (registration, user storage)
3. **Implement file upload** for media processing
4. **Add subscription management** integration with Stripe

### Example Frontend Usage:

```typescript
// In your React component
const generateContent = async (prompt: string) => {
  const response = await fetch('/api/marketing/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      content_type: 'social_post',
      prompt: prompt
    })
  });
  
  const result = await response.json();
  return result.content;
};
```

## 🔍 Troubleshooting

**Python Import Errors:**
- Check that your Python path is correct in the bridge script
- Verify your Python tool's actual class/module names
- Make sure all Python dependencies are installed

**JWT Token Issues:**
- Ensure your JWT_SECRET is set in `.env.local`
- Check that the secret is at least 32 characters long

**Process Timeout:**
- Large content generation might need longer timeouts
- Adjust timeout values in `src/lib/python-bridge.ts`

## 💡 Benefits of This Approach

✅ **No additional hosting costs** - runs on your existing Firebase hosting  
✅ **Serverless** - scales automatically with your website traffic  
✅ **Secure** - JWT authentication with tier-based access control  
✅ **Integrated** - seamlessly works with your existing website  
✅ **Maintainable** - keep your Python tool separate but connected  

---

Need help with any of these steps? Let me know! 