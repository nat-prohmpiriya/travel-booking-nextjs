"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile as firebaseUpdateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/utils/firebaseInit';
import { UserProfile, CreateUserData, UpdateUserData } from '@/types/user';

const googleProvider = new GoogleAuthProvider();

export interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, userData: CreateUserData) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: UpdateUserData) => Promise<void>;
    updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
}

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
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Create default user profile
    const createDefaultProfile = async (user: User, additionalData: CreateUserData = { firstName: '', lastName: '' }): Promise<UserProfile> => {
        const displayName = user.displayName || `${additionalData.firstName} ${additionalData.lastName}`.trim();
        const names = displayName.split(' ');

        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            firstName: additionalData.firstName || names[0] || 'User',
            lastName: additionalData.lastName || names.slice(1).join(' ') || '',
            displayName: displayName || 'User',
            phone: additionalData.phone,
            photoURL: user.photoURL || undefined,
            role: 'user',
            preferences: {
                currency: 'THB',
                language: 'en',
                timezone: 'Asia/Bangkok',
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    marketing: false,
                },
            },
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            isActive: true,
        };

        await setDoc(doc(firebaseDb, 'users', user.uid), userProfile);
        return userProfile;
    };

    // Get or create user profile
    const getOrCreateUserProfile = async (user: User, additionalData?: CreateUserData): Promise<UserProfile> => {
        const userRef = doc(firebaseDb, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        } else {
            return await createDefaultProfile(user, additionalData);
        }
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
            try {
                setLoading(true);

                if (firebaseUser) {
                    setUser(firebaseUser);
                    const profile = await getOrCreateUserProfile(firebaseUser);
                    setUserProfile(profile);
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                setUser(null);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Sign in with email/password
    const signIn = async (email: string, password: string): Promise<void> => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(firebaseAuth, email, password);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email/password
    const signUp = async (email: string, password: string, userData: CreateUserData): Promise<void> => {
        try {
            setLoading(true);
            const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);

            const displayName = `${userData.firstName} ${userData.lastName}`.trim();
            if (displayName) {
                await firebaseUpdateProfile(user, { displayName });
            }

            await createDefaultProfile(user, userData);
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async (): Promise<void> => {
        try {
            setLoading(true);
            await signInWithPopup(firebaseAuth, googleProvider);
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async (): Promise<void> => {
        try {
            setLoading(true);
            await firebaseSignOut(firebaseAuth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Refresh user profile
    const refreshUser = async (): Promise<void> => {
        if (!user) return;

        try {
            const profile = await getOrCreateUserProfile(user);
            setUserProfile(profile);
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    };

    // Update user profile
    const updateProfile = async (data: UpdateUserData): Promise<void> => {
        if (!userProfile) throw new Error('User not authenticated');

        try {
            // Remove undefined values
            const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            if (Object.keys(cleanData).length === 0) {
                throw new Error('No valid data to update');
            }

            const updateData = {
                ...cleanData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(firebaseDb, 'users', userProfile.uid), updateData);

            // Refresh user profile after update
            await refreshUser();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw new Error('Failed to update user profile');
        }
    };

    // Update user preferences
    const updatePreferences = async (preferences: Partial<UserProfile['preferences']>): Promise<void> => {
        if (!userProfile) throw new Error('User not authenticated');

        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', userProfile.uid));

            if (!userDoc.exists()) {
                throw new Error('User profile not found');
            }

            const currentPreferences = userDoc.data().preferences || {};

            const updatedPreferences = {
                ...currentPreferences,
                ...preferences,
                notifications: {
                    ...currentPreferences.notifications,
                    ...preferences.notifications
                }
            };

            await updateDoc(doc(firebaseDb, 'users', userProfile.uid), {
                preferences: updatedPreferences,
                updatedAt: serverTimestamp()
            });

            // Refresh user profile after update
            await refreshUser();
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw new Error('Failed to update user preferences');
        }
    };

    const contextValue: AuthContextType = {
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshUser,
        updateProfile,
        updatePreferences,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
