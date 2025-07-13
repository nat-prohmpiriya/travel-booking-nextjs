import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User,
    updateProfile
} from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebaseInit';
import { userService } from './userService';
import { CreateUserProfileData } from '@/types';


const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Email/Password Sign Up
    async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
        const { user } = await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password
        );

        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });

        // Create user profile in Firestore
        const userProfileData: CreateUserProfileData = {
            uid: user.uid,
            email: email,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            photoURL: user.photoURL || undefined
        };

        await userService.createUserProfile(userProfileData);

        return user;
    },

    // Email/Password Sign In
    async signInWithEmail(email: string, password: string): Promise<User> {
        const { user } = await signInWithEmailAndPassword(
            firebaseAuth,
            email,
            password
        );
        return user;
    },

    // Google Sign In
    async signInWithGoogle(): Promise<User> {
        const { user } = await signInWithPopup(firebaseAuth, googleProvider);

        // Check if user exists in Firestore, if not create profile
        const existingProfile = await userService.getUserProfile(user.uid);
        if (!existingProfile) {
            const userProfileData: CreateUserProfileData = {
                uid: user.uid,
                email: user.email || '',
                firstName: user.displayName?.split(' ')[0] || 'Google',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || 'User',
                photoURL: user.photoURL || undefined
            };

            await userService.createUserProfile(userProfileData);
        }

        return user;
    },

    // Sign Out
    async signOut(): Promise<void> {
        await signOut(firebaseAuth);
    },

    // Get current user
    getCurrentUser(): User | null {
        return firebaseAuth.currentUser;
    },

    // Get user profile from Firestore
    async getUserProfile(uid: string) {
        return await userService.getUserProfile(uid);
    }
};