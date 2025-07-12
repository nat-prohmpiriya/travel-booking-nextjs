"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/utils/firebaseInit';
import { UserRole, AuthContextType } from '@/types/auth';
import { UserProfile } from '@/types/user';
import { getUserRole, getUserPermissions, setAuthCookies, clearAuthCookies } from '@/utils/auth';
import { Timestamp } from 'firebase/firestore';

// Use AuthContextType from types/auth.ts

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Convert Firebase User to UserProfile
    const convertToUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
        const role = await getUserRole(firebaseUser.uid);
        const permissions = await getUserPermissions(firebaseUser.uid);
        const validRoles = ['admin', 'user', 'partner'] as const;
        type ValidRole = typeof validRoles[number];
        const safeRole: ValidRole = validRoles.includes(role as ValidRole) ? (role as ValidRole) : 'user';
        const createdAt = firebaseUser.metadata.creationTime
            ? Timestamp.fromDate(new Date(firebaseUser.metadata.creationTime))
            : Timestamp.fromDate(new Date());
        const lastLoginAt = firebaseUser.metadata.lastSignInTime
            ? Timestamp.fromDate(new Date(firebaseUser.metadata.lastSignInTime))
            : Timestamp.fromDate(new Date());
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: firebaseUser.displayName || '',
            lastName: '',
            name: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || undefined,
            role: safeRole,
            emailVerified: firebaseUser.emailVerified,
            permissions,
            createdAt,
            lastLoginAt,
            updatedAt: Timestamp.fromDate(new Date()),
            preferences: {
                currency: 'THB',
                language: 'th',
                timezone: 'Asia/Bangkok',
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    marketing: false,
                },
            },
            isActive: true,
        };
    };

    // Initialize auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
            try {
                setLoading(true);
                setError(null);

                if (firebaseUser) {
                    const profile = await convertToUserProfile(firebaseUser);
                    setUserProfile(profile);
                    const token = await firebaseUser.getIdToken();
                    setAuthCookies(profile, token);
                } else {
                    setUserProfile(null);
                    clearAuthCookies();
                }
            } catch (err: any) {
                console.error('Auth state change error:', err);
                setError(err.message || 'Authentication error occurred');
                setUserProfile(null);
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
        const userRef = doc(firebaseDb, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            const userData = {
                email,
                role: 'user' as UserRole,
                permissions: [],
                createdAt: Timestamp.fromDate(new Date()),
                lastLoginAt: Timestamp.fromDate(new Date()),
                ...additionalData,
            };
            await setDoc(userRef, userData);
        } else {
            await updateDoc(userRef, {
                lastLoginAt: Timestamp.fromDate(new Date()),
            });
        }
    };

    // Sign in
    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
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
            const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
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
            await firebaseSignOut(firebaseAuth);
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
        if (!firebaseAuth.currentUser) return;
        try {
            const profile = await convertToUserProfile(firebaseAuth.currentUser);
            setUserProfile(profile);
            const token = await firebaseAuth.currentUser.getIdToken(true);
            setAuthCookies(profile, token);
        } catch (err: any) {
            console.error('Refresh user error:', err);
            setError(err.message || 'Failed to refresh user data');
        }
    };

    // Check if user has role(s)
    const hasRole = (role: UserRole | UserRole[]): boolean => {
        if (!userProfile) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(userProfile.role);
    };

    // Check if user has permission
    const hasPermission = (permission: string): boolean => {
        if (!userProfile || !userProfile.permissions) return false;
        if (userProfile.role === 'admin') return true;
        return userProfile.permissions.includes(permission);
    };

    const contextValue: AuthContextType = {
        userProfile,
        loading,
        error,
        isAuthenticated: !!userProfile,
        hasRole,
        hasPermission,
        signIn,
        signUp,
        signOut,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
