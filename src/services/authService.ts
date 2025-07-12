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
import { SignUpData, SignInData, CreateUserProfileData } from '@/types';


const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Email/Password Sign Up
    async signUp(data: SignUpData): Promise<User> {
        const { user } = await createUserWithEmailAndPassword(
            firebaseAuth,
            data.email,
            data.password
        );

        // Update user profile with name
        await updateProfile(user, {
            displayName: data.name
        });

        // Create user profile in Firestore
        const userProfileData: CreateUserProfileData = {
            uid: user.uid,
            email: data.email,
            firstName: data.name.split(' ')[0] || '',
            lastName: data.name.split(' ').slice(1).join(' ') || '',
            photoURL: user.photoURL || undefined
        };

        await userService.createUserProfile(userProfileData);

        return user;
    },

    // Email/Password Sign In
    async signIn(data: SignInData): Promise<User> {
        const { user } = await signInWithEmailAndPassword(
            firebaseAuth,
            data.email,
            data.password
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