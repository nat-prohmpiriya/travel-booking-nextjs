import { Timestamp } from 'firebase/firestore';

// =================== USER INTERFACES ===================
export interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
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
    name?: string;
    isActive?: boolean;
    role?: 'admin' | 'partner' | 'user';
}

export interface CreateUserProfileData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photoURL?: string;
    preferences?: Partial<UserProfile['preferences']>;
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

// =================== AUTH INTERFACES ===================
export interface SignUpData {
    name: string;
    email: string;
    password: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}