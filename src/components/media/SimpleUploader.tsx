'use client';

import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';

export function SimpleUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setMessage(`Starting upload for ${file.name}...`);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage('Error: You must be logged in to upload a file.');
        setIsLoading(false);
        console.error('Upload failed: User is not authenticated.');
        return;
      }

      console.log(`Authenticated user: ${user.uid}`);
      setMessage(`User ${user.uid} authenticated. Preparing file...`);

      const storage = getStorage();
      const filePath = `media/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      console.log(`Uploading to path: ${filePath}`);
      setMessage(`Uploading to: ${filePath}`);

      // The core upload operation
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('Upload successful!', {
        url: downloadURL,
        path: snapshot.ref.fullPath,
      });

      setMessage(`✅ Success! File uploaded to: ${downloadURL}`);
      setFile(null); // Clear file input after success

    } catch (error: any) {
      console.error('A very direct upload error occurred:', error);
      
      // Log the full error object for detailed inspection
      console.error('Full Firebase Error Object:', error);

      let errorMessage = `Upload failed: ${error.message}`;
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Upload Failed: Unauthorized. Please check Storage security rules and authentication state.';
      }
      
      setMessage(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-dashed border-gray-600 rounded-lg bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-4">Minimal Uploader (for Debugging)</h3>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        <Button onClick={handleUpload} disabled={!file || isLoading}>
          {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
        {message && (
          <p className={`text-sm p-3 rounded-md ${message.startsWith('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
