// Simple Firebase configuration test
import { auth, storage } from '../lib/firebase';

export const testFirebaseConfig = () => {
  console.log('🔧 Testing Firebase Configuration...');
  
  // Check environment variables
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  console.log('📋 Environment Variables:');
  console.log('  Storage Bucket:', storageBucket);
  console.log('  Project ID:', projectId);
  console.log('  Expected Bucket:', 'crows-eye-website.firebasestorage.app');
  console.log('  Bucket Correct:', storageBucket === 'crows-eye-website.firebasestorage.app');
  
  // Check Firebase app configuration
  if (storage?.app) {
    console.log('🗄️ Firebase App Configuration:');
    console.log('  Configured Bucket:', storage.app.options.storageBucket);
    console.log('  Match:', storage.app.options.storageBucket === storageBucket);
  }
  
  // Check authentication
  if (auth?.currentUser) {
    console.log('🔐 Authentication:', {
      isAuthenticated: true,
      userId: auth.currentUser.uid,
      email: auth.currentUser.email
    });
  } else {
    console.log('🔐 Authentication: Not authenticated');
  }
};

export const logDetailedFirebaseInfo = () => {
  console.log('🔍 Detailed Firebase Info:');
  console.log('='.repeat(50));
  
  testFirebaseConfig();
  
  console.log('='.repeat(50));
}; 