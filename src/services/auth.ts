import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    User,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/utils/firebaseInit';

export interface SignUpData {
    name: string;
    email: string;
    password: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    createdAt: Date;
}

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

        // Save user profile to Firestore
        await setDoc(doc(firebaseDb, 'users', user.uid), {
            uid: user.uid,
            email: data.email,
            name: data.name,
            createdAt: new Date()
        });

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
        const userDoc = await getDoc(doc(firebaseDb, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(firebaseDb, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Google User',
                createdAt: new Date()
            });
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
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userDoc = await getDoc(doc(firebaseDb, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    }
};