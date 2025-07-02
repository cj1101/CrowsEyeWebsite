#!/usr/bin/env node

/**
 * Simple User Flow Testing Script for Offline Firestore Migration
 * This script tests the main user workflows to ensure everything works
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: 'demo-project',
  credential: admin.credential.applicationDefault(),
});

// Connect to emulator
const db = admin.firestore();
db.settings({
  host: 'localhost:8080',
  ssl: false
});

const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function logStep(step, description) {
  console.log(`\n🔍 Step ${step}: ${description}`);
  console.log('─'.repeat(50));
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

async function testFirebaseConnection() {
  logStep(1, "Testing Firebase Emulator Connection");
  
  try {
    // Test Firestore connection
    const testDoc = await db.collection('test').add({
      message: 'Connection test',
      timestamp: admin.firestore.Timestamp.now()
    });
    
    await db.collection('test').doc(testDoc.id).delete();
    logSuccess("Firestore emulator connected successfully");
    
    return true;
  } catch (error) {
    logError(`Firestore connection failed: ${error.message}`);
    return false;
  }
}

async function testUserData() {
  logStep(2, "Testing User Data Migration");
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      logError("No users found in Firestore");
      logInfo("Run: node scripts/migrate-offline.js");
      return false;
    }
    
    logSuccess(`Found ${usersSnapshot.size} user(s) in Firestore`);
    
    // Show user details
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      logInfo(`User: ${userData.email} (${userData.subscriptionTier})`);
    });
    
    return true;
  } catch (error) {
    logError(`User data test failed: ${error.message}`);
    return false;
  }
}

async function testMediaData() {
  logStep(3, "Testing Media Data Migration");
  
  try {
    const mediaSnapshot = await db.collection('media').get();
    
    if (mediaSnapshot.empty) {
      logError("No media found in Firestore");
      logInfo("Run: node scripts/migrate-offline.js");
      return false;
    }
    
    logSuccess(`Found ${mediaSnapshot.size} media item(s) in Firestore`);
    
    // Show media details
    let count = 0;
    mediaSnapshot.forEach(doc => {
      const mediaData = doc.data();
      if (count < 3) { // Show first 3 items
        logInfo(`Media: ${mediaData.filename} (${mediaData.mediaType}) - ${mediaData.status}`);
      }
      count++;
    });
    
    if (count > 3) {
      logInfo(`... and ${count - 3} more items`);
    }
    
    return true;
  } catch (error) {
    logError(`Media data test failed: ${error.message}`);
    return false;
  }
}

async function testUserOperations() {
  logStep(4, "Testing User Operations (CRUD)");
  
  try {
    // Get first user
    const usersSnapshot = await db.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      logError("No users available for testing");
      return false;
    }
    
    const userId = usersSnapshot.docs[0].id;
    const userData = usersSnapshot.docs[0].data();
    
    logInfo(`Testing with user: ${userData.email}`);
    
    // Test: Read user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      logSuccess("✓ User read operation successful");
    }
    
    // Test: Update user data
    await db.collection('users').doc(userId).update({
      updatedAt: admin.firestore.Timestamp.now(),
      testField: 'test-update'
    });
    logSuccess("✓ User update operation successful");
    
    // Test: Read user's media
    const userMediaSnapshot = await db.collection('media')
      .where('userId', '==', userId)
      .get();
    
    logSuccess(`✓ User media query successful (${userMediaSnapshot.size} items)`);
    
    return true;
  } catch (error) {
    logError(`User operations test failed: ${error.message}`);
    return false;
  }
}

async function testMediaOperations() {
  logStep(5, "Testing Media Operations (CRUD)");
  
  try {
    // Get first user for testing
    const usersSnapshot = await db.collection('users').limit(1).get();
    const userId = usersSnapshot.docs[0].id;
    
    // Test: Create new media item
    const newMediaRef = await db.collection('media').add({
      userId: userId,
      filename: `test-upload-${Date.now()}.jpg`,
      originalFilename: 'test-upload.jpg',
      gcsPath: '/test/uploads/test-upload.jpg',
      mediaType: 'image',
      fileSize: 512000,
      caption: 'Test upload caption',
      description: 'Test media item created by automation',
      aiTags: ['test', 'automation'],
      isPostReady: false,
      status: 'uploaded',
      uploadDate: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    
    logSuccess("✓ Media creation successful");
    
    // Test: Read created media
    const createdMedia = await newMediaRef.get();
    if (createdMedia.exists) {
      logSuccess("✓ Media read operation successful");
    }
    
    // Test: Update media
    await newMediaRef.update({
      caption: 'Updated test caption',
      updatedAt: admin.firestore.Timestamp.now()
    });
    logSuccess("✓ Media update operation successful");
    
    // Test: Query media by user
    const userMediaSnapshot = await db.collection('media')
      .where('userId', '==', userId)
      .orderBy('uploadDate', 'desc')
      .limit(5)
      .get();
    
    logSuccess(`✓ Media query successful (${userMediaSnapshot.size} items)`);
    
    // Clean up test media
    await newMediaRef.delete();
    logSuccess("✓ Media deletion successful");
    
    return true;
  } catch (error) {
    logError(`Media operations test failed: ${error.message}`);
    return false;
  }
}

async function testFirestoreRules() {
  logStep(6, "Testing Firestore Security Rules");
  
  logInfo("Security rules testing requires manual verification");
  logInfo("In your browser:");
  logInfo("1. Go to http://localhost:4000");
  logInfo("2. Click on 'Authentication' and verify emulator users");
  logInfo("3. Click on 'Firestore' and verify data structure");
  logInfo("4. Try accessing data without authentication (should fail)");
  
  return true;
}

async function showNextSteps() {
  logStep(7, "Next Steps - Manual Testing");
  
  console.log(`
🌐 FRONTEND TESTING:
1. Open: http://localhost:3000
2. Try to sign in with: demo@example.com
3. Navigate to Dashboard
4. Check Library tab (should show media)
5. Try Create Post tab
6. Upload a test file

🔧 EMULATOR UI:
1. Open: http://localhost:4000
2. View Firestore data
3. Monitor real-time changes
4. Check Authentication users

📊 DATA VERIFICATION:
- Users collection: Should have migrated/demo users
- Media collection: Should have media items
- Real-time updates: Changes should appear immediately

🐛 DEBUGGING:
- Check browser console for errors
- Monitor Network tab for Firebase calls
- Use Emulator UI to inspect data changes
`);

  return true;
}

async function runAllTests() {
  console.log('🧪 Starting Offline Firestore Migration Testing...\n');
  
  try {
    // Test connection
    const connectionOk = await testFirebaseConnection();
    if (!connectionOk) {
      logError("Connection test failed. Make sure emulators are running.");
      logInfo("Run: npm run emulator:start");
      return;
    }
    
    // Test data migration
    const userDataOk = await testUserData();
    const mediaDataOk = await testMediaData();
    
    if (!userDataOk || !mediaDataOk) {
      logError("Data migration incomplete.");
      logInfo("Run: node scripts/migrate-offline.js");
      
      const shouldMigrate = await askQuestion('\nWould you like to run migration now? (y/n): ');
      if (shouldMigrate.toLowerCase() === 'y') {
        console.log('\n🔄 Running migration...');
        const migration = require('./migrate-offline.js');
        await migration.main();
        console.log('\n✅ Migration completed. Continuing tests...\n');
      } else {
        return;
      }
    }
    
    // Test operations
    const userOpsOk = await testUserOperations();
    const mediaOpsOk = await testMediaOperations();
    
    if (userOpsOk && mediaOpsOk) {
      logSuccess("All automated tests passed! 🎉");
    }
    
    // Show security testing
    await testFirestoreRules();
    
    // Show next steps
    await showNextSteps();
    
    const openBrowser = await askQuestion('\nWould you like to open the app in browser? (y/n): ');
    if (openBrowser.toLowerCase() === 'y') {
      const { spawn } = require('child_process');
      
      // Try to open browser (cross-platform)
      const platform = process.platform;
      let command;
      
      if (platform === 'win32') {
        command = 'start';
      } else if (platform === 'darwin') {
        command = 'open';
      } else {
        command = 'xdg-open';
      }
      
      spawn(command, ['http://localhost:3000'], { detached: true });
      spawn(command, ['http://localhost:4000'], { detached: true });
      
      logInfo("Opened app and emulator UI in browser");
    }
    
  } catch (error) {
    logError(`Testing failed: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Only run if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests }; 