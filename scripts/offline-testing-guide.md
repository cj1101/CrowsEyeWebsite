# 🧪 Offline Firestore Migration Testing Guide

## Quick Start (5 minutes)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Set Up Emulator Environment
```bash
# Set up environment for emulators
npm run emulator:setup
```

### Step 3: Start Firebase Emulators
```bash
# Terminal 1: Start emulators
npm run emulator:start
```
**Wait for**: `All emulators ready! It is now safe to connect.`

### Step 4: Migrate Data to Emulators
```bash
# Terminal 2: Migrate data
npm run migrate:offline
```

### Step 5: Start Your App
```bash
# Terminal 3: Start Next.js app
npm run dev
```

### Step 6: Run Tests
```bash
# Terminal 4: Run automated tests
npm run test:offline
```

---

## 🎯 What to Test

### 1. **Emulator UI** (http://localhost:4000)
- ✅ Firestore: Check users and media collections
- ✅ Authentication: Verify demo users
- ✅ Storage: Check file uploads

### 2. **Your App** (http://localhost:3000)
- ✅ Dashboard loads without errors
- ✅ Library tab shows media items
- ✅ Can upload new files
- ✅ Create Post tab works
- ✅ No API errors in console

### 3. **Browser Console Checks**
Look for these success messages:
```
✅ 🔐 Firebase Authentication initialized
✅ 🗄️ Cloud Firestore initialized  
✅ 📦 Cloud Storage initialized
✅ 🧪 Connected to Firebase emulators
```

---

## 🐛 Common Issues & Fixes

### Issue: "Firebase is not initialized"
**Fix:**
```bash
# Make sure environment is set up
npm run emulator:setup
# Check that .env.local contains emulator config
```

### Issue: "Connection refused" errors
**Fix:**
```bash
# Make sure emulators are running
npm run emulator:start
# Wait for "All emulators ready!" message
```

### Issue: "No data found"
**Fix:**
```bash
# Run migration
npm run migrate:offline
# Check emulator UI at http://localhost:4000
```

### Issue: Frontend shows empty data
**Fix:**
1. Check browser console for errors
2. Verify emulator environment: `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`
3. Clear browser cache/storage
4. Restart development server

---

## 📝 Testing Checklist

### ✅ Backend Testing
- [ ] Emulators start successfully
- [ ] Data migration completes
- [ ] Collections appear in Emulator UI
- [ ] CRUD operations work via scripts

### ✅ Frontend Testing  
- [ ] App loads without errors
- [ ] Authentication flows work
- [ ] Media library displays items
- [ ] File upload functionality
- [ ] Post creation workflow
- [ ] Real-time data updates

### ✅ Integration Testing
- [ ] Frontend connects to emulators
- [ ] Data persists between app restarts
- [ ] Security rules enforce properly
- [ ] Performance is acceptable

---

## 🔄 Clean Up

### Restore Original Environment
```bash
npm run emulator:restore
```

### Stop All Services
```bash
# Stop emulators: Ctrl+C in emulator terminal
# Stop dev server: Ctrl+C in dev terminal
```

---

## 🚀 Next Steps

Once offline testing passes:
1. **Set up production Firebase project**
2. **Deploy Firestore rules and indexes**
3. **Run real data migration**
4. **Update environment for production**

---

## 📞 Need Help?

**Quick Debug Command:**
```bash
npm run test:offline
```

This will check everything and guide you through fixes! 