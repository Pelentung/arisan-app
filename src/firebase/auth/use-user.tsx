
'use client';
// This file is being kept for potential future use but is currently inactive.
// The authentication system has been removed, so user management is not needed.

import { createContext, useContext } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';

export interface User extends FirebaseAuthUser {
    isAdmin?: boolean;
}

interface UserContextType {
  user: User | null | undefined;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Since authentication is removed, we provide a mock "public" user state.
  const value: UserContextType = {
    user: undefined, // Or a mock user object if needed for UI consistency
    loading: false,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
