'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function AuthTest() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const testFirebaseAuth = async () => {
    try {
      setStatus('Testing Firebase authentication...');
      
      const firebaseUser = auth.currentUser;
      
      setStatus(`Firebase Auth: ${firebaseUser ? '✅ Authenticated' : '❌ Not Authenticated'}
Firebase User: ${firebaseUser ? firebaseUser.email : 'None'}
App User: ${user ? user.email : 'None'}`);
      
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        setStatus('✅ Login successful!');
        setTimeout(testFirebaseAuth, 1000);
      } else {
        setStatus(`❌ Login failed: ${result.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Login error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    setStatus('Logging out...');
    try {
      await logout();
      setStatus('✅ Logout successful!');
    } catch (error: any) {
      setStatus(`❌ Logout error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Firebase Auth Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          App Auth: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </p>
        {user && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            User: {user.email}
          </p>
        )}
      </div>

      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={testFirebaseAuth}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Test Firebase Auth
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}

      {status && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
          <pre className="text-sm whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  );
} 