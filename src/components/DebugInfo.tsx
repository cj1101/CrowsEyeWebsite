'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';

interface DebugInfoProps {
  show?: boolean;
}

export default function DebugInfo({ show = process.env.NODE_ENV === 'development' }: DebugInfoProps) {
  const [debugData, setDebugData] = useState<any>({});

  useEffect(() => {
    const data = {
      environment: process.env.NODE_ENV,
      hasAuth: !!auth,
      hasDb: !!db,
      firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      },
      timestamp: new Date().toISOString(),
    };
    
    setDebugData(data);
    console.log('🔧 Debug Info:', data);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 Debug Info</h3>
      <div className="space-y-1">
        <div>Environment: {debugData.environment}</div>
        <div>Firebase Auth: {debugData.hasAuth ? '✅' : '❌'}</div>
        <div>Firebase DB: {debugData.hasDb ? '✅' : '❌'}</div>
        <div>Project ID: {debugData.firebaseConfig?.projectId}</div>
        <div>Auth Domain: {debugData.firebaseConfig?.authDomain}</div>
        <div className="text-xs text-gray-400 mt-2">
          {debugData.timestamp}
        </div>
      </div>
    </div>
  );
} 