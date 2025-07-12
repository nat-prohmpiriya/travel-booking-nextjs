import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { firebaseDb } from '@/utils/firebaseInit';
import { orderBy as firestoreOrderBy } from 'firebase/firestore';
import {
    UserProfile,
    CreateUserProfileData,
    UpdateUserProfileData
} from '@/types';

export const userService = {
    // Create user profile
    async createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
        const userProfile: UserProfile = {
            uid: data.uid,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            photoURL: data.photoURL,
            role: data.role ?? 'user', // default to 'user' if not provided
            preferences: {
                currency: 'THB',
                language: 'en',
                timezone: 'Asia/Bangkok',
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    marketing: false
                },
                ...data.preferences
            },
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp
        };

        await setDoc(doc(firebaseDb, 'users', data.uid), userProfile);
        return userProfile;
    },

    // Get user profile by UID
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', uid));

            if (userDoc.exists()) {
                return userDoc.data() as UserProfile;
            }

            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    // Update user profile
    async updateUserProfile(uid: string, data: UpdateUserProfileData): Promise<void> {
        try {
            // Deep clean function to remove undefined values recursively
            const deepClean = (obj: any): any => {
                if (obj === null || obj === undefined) {
                    return undefined;
                }

                if (Array.isArray(obj)) {
                    return obj.map(deepClean).filter(item => item !== undefined);
                }

                if (typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        const cleanedValue = deepClean(value);
                        if (cleanedValue !== undefined) {
                            cleaned[key] = cleanedValue;
                        }
                    }
                    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
                }

                return obj;
            };

            const cleanData = deepClean(data);

            if (!cleanData || Object.keys(cleanData).length === 0) {
                console.warn('No valid data to update');
                return;
            }

            const updateData = {
                ...cleanData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(firebaseDb, 'users', uid), updateData);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    // Delete user profile
    async deleteUserProfile(uid: string): Promise<void> {
        try {
            await deleteDoc(doc(firebaseDb, 'users', uid));
        } catch (error) {
            console.error('Error deleting user profile:', error);
            throw error;
        }
    },

    // Check if user profile exists
    async userProfileExists(uid: string): Promise<boolean> {
        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', uid));
            return userDoc.exists();
        } catch (error) {
            console.error('Error checking user profile existence:', error);
            throw error;
        }
    },

    // Update user preferences
    async updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', uid));

            if (userDoc.exists()) {
                const currentPreferences = userDoc.data().preferences || {};
                const updatedPreferences = {
                    ...currentPreferences,
                    ...preferences,
                    notifications: {
                        ...currentPreferences.notifications,
                        ...preferences.notifications
                    }
                };

                await updateDoc(doc(firebaseDb, 'users', uid), {
                    preferences: updatedPreferences,
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    },

    // Update user address
    async updateUserAddress(uid: string, address: Partial<UserProfile['address']>): Promise<void> {
        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', uid));

            if (userDoc.exists()) {
                const currentAddress = userDoc.data().address || {};

                // Clean undefined values from address object
                const cleanAddress = Object.entries(address ?? {}).reduce((acc, [key, value]) => {
                    if (value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as any);

                const updatedAddress = {
                    ...currentAddress,
                    ...cleanAddress
                };

                await updateDoc(doc(firebaseDb, 'users', uid), {
                    address: updatedAddress,
                    updatedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error updating user address:', error);
            throw error;
        }
    },

    // Get users by email (for admin purposes)
    async getUserByEmail(email: string): Promise<UserProfile | null> {
        try {
            const usersRef = collection(firebaseDb, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                return userDoc.data() as UserProfile;
            }

            return null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    },

    // Get all users (admin only)
    async getAllUsers(): Promise<UserProfile[]> {
        try {
            const usersRef = collection(firebaseDb, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { ...data, uid: doc.id } as UserProfile;
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    // Update user status (admin only)
    async updateUserStatus(uid: string, isActive: boolean): Promise<void> {
        try {
            await updateDoc(doc(firebaseDb, 'users', uid), {
                isActive,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    // Get user statistics
    async getUserStats(): Promise<{
        total: number;
        active: number;
        newThisMonth: number;
        totalBookings: number;
    }> {
        try {
            const usersRef = collection(firebaseDb, 'users');
            const querySnapshot = await getDocs(usersRef);
            const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const stats = {
                total: users.length,
                active: users.filter(u => u.isActive !== false).length, // Default to active if not set
                newThisMonth: users.filter(u => {
                    const createdAt = u.createdAt.toDate();
                    return createdAt >= startOfMonth;
                }).length,
                totalBookings: 0 // This would need to be calculated from bookings collection
            };

            return stats;
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
};
/**
 * Wrapper for Firestore's orderBy function.
 * @param field - The field to order by.
 * @param direction - 'asc' or 'desc'.
 * @returns Firestore QueryOrderByConstraint
 */
function orderBy(field: string, direction: 'asc' | 'desc') {
    return firestoreOrderBy(field, direction);
}
