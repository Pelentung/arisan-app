
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
    if (!auth || !db) {
        setLoading(false);
        return;
    }
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // This is a more robust way to handle user profiles.
        // It uses `setDoc` with `merge: true` to create or update the user document.
        // This is idempotent and avoids race conditions where a read (`getDoc`) might fail
        // before the document is created.
        const isAdminByEmail = firebaseUser.email === 'adminarisan@gmail.com';
        const userProfileData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAdmin: isAdminByEmail,
        };

        try {
            // This will create the document if it doesn't exist, 
            // or update it if it does. This solves the "chicken-and-egg" problem.
            await setDoc(userRef, userProfileData, { merge: true });
        } catch (error) {
            console.error("Error writing user profile:", error);
        }

        // Now that we've ensured the document exists, we can safely listen for snapshots.
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ ...firebaseUser, ...docSnap.data() });
          } else {
             // Fallback in case snapshot is slow or fails after a write
            setUser({ ...firebaseUser, ...userProfileData });
          }
          setLoading(false);
        }, (error) => {
            console.error("Error in user snapshot listener:", error);
            setUser({ ...firebaseUser, ...userProfileData }); // Fallback on listener error
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

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
