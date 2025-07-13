import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'partner' | 'user';

// =================== USER INTERFACES ===================
export interface UserProfile {
    uid: string;
    email: string;
    emailVerified?: boolean;
    firstName: string;
    lastName: string;
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    nationality?: string;
    photoURL?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    preferences: {
        currency: string;
        language: string;
        timezone: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
            marketing: boolean;
        };
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive?: boolean;
    role: UserRole; // required
    permissions?: string[];
    lastLoginAt?: Timestamp;
}

export interface CreateUserProfileData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photoURL?: string;
    preferences?: Partial<UserProfile['preferences']>;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    role?: UserProfile['role']; // default to 'user' if not provided
}

export interface UpdateUserProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: UserProfile['gender'];
    nationality?: string;
    photoURL?: string;
    address?: Partial<UserProfile['address']>;
    preferences?: Partial<UserProfile['preferences']>;
}

