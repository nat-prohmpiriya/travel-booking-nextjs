'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '@/utils/firebaseInit';
import { AuthUser, UserRole, AuthContextType } from '@/types/auth';
import { getUserRole, getUserPermissions, setAuthCookies, clearAuthCookies } from '@/utils/auth';

interface EnhancedAuthContextProviderProps {
  children: React.ReactNode;
}

const EnhancedAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthContextProvider');
  }
  return context;
};

export const EnhancedAuthContextProvider: React.FC<EnhancedAuthContextProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firebase User to AuthUser
  const convertToAuthUser = async (firebaseUser: User): Promise<AuthUser> => {
    const role = await getUserRole(firebaseUser.uid);
    const permissions = await getUserPermissions(firebaseUser.uid);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role,
      emailVerified: firebaseUser.emailVerified,
      permissions,
      createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
      lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined,
    };
  };

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          const authUser = await convertToAuthUser(firebaseUser);
          setUser(authUser);
          
          // Set auth cookies for middleware
          const token = await firebaseUser.getIdToken();
          setAuthCookies(authUser, token);
        } else {
          setUser(null);
          clearAuthCookies();
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setError(err.message || 'Authentication error occurred');
        setUser(null);
        clearAuthCookies();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Create user document in Firestore
  const createUserDocument = async (
    uid: string, 
    email: string, 
    additionalData: any = {}
  ): Promise<void> => {
    const userRef = doc(firestore, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        email,
        role: 'user' as UserRole,
        permissions: [],
        createdAt: new Date(),
        lastLoginAt: new Date(),
        ...additionalData,
      };

      await setDoc(userRef, userData);
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: new Date(),
      });
    }
  };

  // Sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user.uid, email);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const signUp = async (
    email: string, 
    password: string, 
    userData: any = {}
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (userData.displayName) {
        await updateProfile(result.user, {
          displayName: userData.displayName,
        });
      }

      await createUserDocument(result.user.uid, email, userData);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await firebaseSignOut(auth);
      clearAuthCookies();
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!auth.currentUser) return;

    try {
      const authUser = await convertToAuthUser(auth.currentUser);
      setUser(authUser);
      
      // Update auth cookies
      const token = await auth.currentUser.getIdToken(true);
      setAuthCookies(authUser, token);
    } catch (err: any) {
      console.error('Refresh user error:', err);
      setError(err.message || 'Failed to refresh user data');
    }
  };

  // Check if user has role(s)
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.permissions.includes(permission);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};