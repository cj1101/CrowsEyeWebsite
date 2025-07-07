import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (!auth) {
      console.error('🚫 Firebase auth is not initialized');
      resolve(null);
      return;
    }

    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      unsubscribe();
      resolve(user);
    });

    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);
  });
};
