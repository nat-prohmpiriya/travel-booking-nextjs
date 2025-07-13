import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'partner' | 'user';

// =================== SIMPLIFIED USER INTERFACES ===================
export interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photoURL?: string;
    role: UserRole;
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
    // Optional fields for detailed profile
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    nationality?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
}

export interface CreateUserData {
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface UpdateUserData {
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

