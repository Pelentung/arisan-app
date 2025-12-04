'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseContextType } from '@/firebase/provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseContext, setFirebaseContext] =
    useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const { firebaseApp, auth, db } = initializeFirebase();
    setFirebaseContext({ firebaseApp, auth, db });
  }, []);

  if (!firebaseContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading Firebase...</p>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseContext.firebaseApp}
      auth={firebaseContext.auth}
      db={firebaseContext.db}
    >
      {children}
    </FirebaseProvider>
  );
}
