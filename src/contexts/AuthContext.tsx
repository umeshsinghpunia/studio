
"use client";
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState, useContext } from 'react';
import { auth } from '@/lib/firebase/config';
import type { AppUser } from '@/types'; // We'll define AppUser later to include profile data

interface AuthContextType {
  user: FirebaseUser | null; // FirebaseUser for now, can be extended to AppUser
  loading: boolean;
  // Add profile data later if needed directly in context
  // appUser: AppUser | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // if (firebaseUser) {
      //   // Fetch AppUser profile data from Firestore here if needed globally
      // } else {
      //   // setAppUser(null);
      // }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
