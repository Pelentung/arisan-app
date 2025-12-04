'use client';

import React from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This provider ensures that Firebase is initialized only on the client side.
// It wraps the main FirebaseProvider and passes the initialized services (app, auth, db) down the component tree.
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { firebaseApp, auth, db } = initializeFirebase();

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      db={db}
    >
      {children}
    </FirebaseProvider>
  );
};
