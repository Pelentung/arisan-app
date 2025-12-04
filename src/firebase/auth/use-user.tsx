
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { unsubscribeAll } from '@/app/data';

export interface User extends FirebaseAuthUser {
  isAdmin?: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase services are not ready, don't do anything.
    if (!auth || !db) {
        setLoading(false);
        return;
    }
    
    // This is the single, authoritative listener for authentication state.
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      let userDocSnapshotUnsubscribe: () => void = () => {};

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        userDocSnapshotUnsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            // User document exists, merge auth data with Firestore data.
            setUser({ ...firebaseUser, ...docSnap.data() });
          } else {
            // New user, create their document.
            // Note: Custom claim `isAdmin` is set on the backend, not here.
            // This client-side check is a fallback for initial display.
            const isAdminByEmail = firebaseUser.email === 'adminarisan@gmail.com';
            const userProfileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                isAdmin: isAdminByEmail,
            };
            // Use setDoc with merge to safely create the document.
            setDoc(userRef, userProfileData, { merge: true }).catch(error => {
                console.error("Error creating user document:", error);
            });
            setUser({ ...firebaseUser, ...userProfileData });
          }
          setLoading(false);
        }, (error) => {
            console.error("Error in user snapshot listener:", error);
            setUser(firebaseUser); // Fallback to auth user data on error
            setLoading(false);
        });

      } else {
        // User is signed out. Clean up everything.
        unsubscribeAll(); // Unsubscribe from all data listeners.
        setUser(null);
        setLoading(false);
      }
      
      // Cleanup the user document listener when auth state changes.
      return () => {
        userDocSnapshotUnsubscribe();
      };
    });

    // This is the key: The main auth listener itself is cleaned up
    // when the UserProvider component unmounts.
    return () => unsubscribeAuth();
  }, [auth, db]); // This effect should only re-run if auth or db instances change.

  const value: UserContextType = {
    user,
    loading,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
