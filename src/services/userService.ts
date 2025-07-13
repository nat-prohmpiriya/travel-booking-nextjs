import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit as firestoreLimit,
    startAfter,
    where,
    writeBatch,
    Timestamp,
    setDoc
} from 'firebase/firestore';
import { deleteUser, updatePassword } from 'firebase/auth';
import { firebaseDb as db } from '@/utils/firebaseInit';
import { UserProfile } from '@/types/user';

// Types for admin user management
export interface AdminUserProfile extends UserProfile {
    status?: 'active' | 'disabled' | 'suspended' | 'deleted';
    statusReason?: string;
    statusUpdatedAt?: Timestamp;
    roleUpdatedAt?: Timestamp;
    deletedAt?: Timestamp;
    deleteReason?: string;
    lastLoginAt?: Timestamp;
}

export interface AdminUserQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'disabled' | 'suspended';
    role?: 'user' | 'admin' | 'partner';
    sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName';
    sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
    users: AdminUserProfile[];
    total: number;
    hasMore: boolean;
    page: number;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    topCountries: { country: string; count: number; }[];
}

export interface UserActivity {
    uid: string;
    action: string;
    details?: any;
    timestamp: Timestamp;
    ip?: string;
    userAgent?: string;
}

class AdminUserService {
    private readonly COLLECTION_NAME = 'users';
    private readonly ACTIVITY_COLLECTION = 'userActivities';

    /**
     * Get paginated list of users with filters and search
     */
    async getUsers(queryParams: AdminUserQuery = {}): Promise<UserListResponse> {
        try {
            const {
                page = 1,
                limit: pageLimit = 20,
                search = '',
                status,
                role,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            let userQuery = query(
                collection(db, this.COLLECTION_NAME),
                orderBy(sortBy, sortOrder),
                firestoreLimit(pageLimit + 1) // Get one extra to check if there are more
            );

            // Add filters
            if (status) {
                userQuery = query(userQuery, where('status', '==', status));
            }
            if (role) {
                userQuery = query(userQuery, where('role', '==', role));
            }

            // Handle pagination
            if (page > 1) {
                // For pagination, we need to get the last document from previous page
                // This is a simplified approach - in production, you'd store cursor tokens
                const skipCount = (page - 1) * pageLimit;
                const tempQuery = query(
                    collection(db, this.COLLECTION_NAME),
                    orderBy(sortBy, sortOrder),
                    firestoreLimit(skipCount)
                );
                const tempSnapshot = await getDocs(tempQuery);
                if (tempSnapshot.docs.length > 0) {
                    const lastDoc = tempSnapshot.docs[tempSnapshot.docs.length - 1];
                    userQuery = query(userQuery, startAfter(lastDoc));
                }
            }

            const snapshot = await getDocs(userQuery);
            let users = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as AdminUserProfile[];

            // Client-side search filtering (for simplicity)
            if (search) {
                const searchLower = search.toLowerCase();
                users = users.filter(user =>
                    user.email?.toLowerCase().includes(searchLower) ||
                    user.firstName?.toLowerCase().includes(searchLower) ||
                    user.lastName?.toLowerCase().includes(searchLower) ||
                    user.displayName?.toLowerCase().includes(searchLower)
                );
            }

            // Check if there are more results
            const hasMore = users.length > pageLimit;
            if (hasMore) {
                users = users.slice(0, pageLimit);
            }

            return {
                users,
                total: users.length, // This would need a separate count query in production
                hasMore,
                page
            };
        } catch (error) {
            console.error('Error getting users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(uid: string): Promise<AdminUserProfile | null> {
        try {
            const userDoc = await getDoc(doc(db, this.COLLECTION_NAME, uid));
            if (userDoc.exists()) {
                return {
                    uid: userDoc.id,
                    ...userDoc.data()
                } as AdminUserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            throw new Error('Failed to fetch user');
        }
    }

    /**
     * Update user profile (admin)
     */
    async updateUser(uid: string, updates: Partial<AdminUserProfile>): Promise<void> {
        try {
            const userRef = doc(db, this.COLLECTION_NAME, uid);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity(uid, 'profile_updated_by_admin', updates);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    /**
     * Update user status (active, disabled, suspended)
     */
    async updateUserStatus(uid: string, status: 'active' | 'disabled' | 'suspended', reason?: string): Promise<void> {
        try {
            const userRef = doc(db, this.COLLECTION_NAME, uid);
            await updateDoc(userRef, {
                status,
                statusReason: reason,
                statusUpdatedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity(uid, 'status_changed', { status, reason });
        } catch (error) {
            console.error('Error updating user status:', error);
            throw new Error('Failed to update user status');
        }
    }

    /**
     * Update user role
     */
    async updateUserRole(uid: string, role: 'user' | 'admin' | 'partner'): Promise<void> {
        try {
            const userRef = doc(db, this.COLLECTION_NAME, uid);
            await updateDoc(userRef, {
                role,
                roleUpdatedAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity(uid, 'role_changed', { role });
        } catch (error) {
            console.error('Error updating user role:', error);
            throw new Error('Failed to update user role');
        }
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(uid: string, reason?: string): Promise<void> {
        try {
            const userRef = doc(db, this.COLLECTION_NAME, uid);
            await updateDoc(userRef, {
                status: 'deleted',
                deletedAt: Timestamp.now(),
                deleteReason: reason,
                updatedAt: Timestamp.now()
            });

            // Log activity
            await this.logActivity(uid, 'user_deleted', { reason });
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    /**
     * Permanently delete user (hard delete)
     */
    async permanentlyDeleteUser(uid: string): Promise<void> {
        try {
            // Delete from Firestore
            await deleteDoc(doc(db, this.COLLECTION_NAME, uid));

            // Note: To delete from Firebase Auth, you need the user object
            // This would typically be done server-side with admin SDK
            console.warn('Firebase Auth deletion requires server-side implementation');
        } catch (error) {
            console.error('Error permanently deleting user:', error);
            throw new Error('Failed to permanently delete user');
        }
    }

    /**
     * Bulk update users
     */
    async bulkUpdateUsers(updates: { uid: string; data: Partial<AdminUserProfile> }[]): Promise<void> {
        try {
            const batch = writeBatch(db);

            updates.forEach(({ uid, data }) => {
                const userRef = doc(db, this.COLLECTION_NAME, uid);
                batch.update(userRef, {
                    ...data,
                    updatedAt: Timestamp.now()
                });
            });

            await batch.commit();

            // Log activities
            for (const update of updates) {
                await this.logActivity(update.uid, 'bulk_updated', update.data);
            }
        } catch (error) {
            console.error('Error bulk updating users:', error);
            throw new Error('Failed to bulk update users');
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<UserStats> {
        try {
            // Get all users
            const usersSnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
            const users = usersSnapshot.docs.map(doc => doc.data()) as AdminUserProfile[];

            // Calculate stats
            const totalUsers = users.length;
            const activeUsers = users.filter(user => user.status === 'active').length;

            // New users this month
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const newUsersThisMonth = users.filter(user => {
                if (!user.createdAt) return false;
                const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt as any);
                return createdDate >= thisMonth;
            }).length;

            // Top countries
            const countryCount: { [key: string]: number } = {};
            users.forEach(user => {
                if (user.address?.country) {
                    countryCount[user.address.country] = (countryCount[user.address.country] || 0) + 1;
                }
            });

            const topCountries = Object.entries(countryCount)
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return {
                totalUsers,
                activeUsers,
                newUsersThisMonth,
                topCountries
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw new Error('Failed to fetch user statistics');
        }
    }

    /**
     * Search users
     */
    async searchUsers(searchTerm: string, limitCount = 10): Promise<AdminUserProfile[]> {
        try {
            // For better search, you might want to use Algolia or similar
            // This is a basic implementation
            const usersSnapshot = await getDocs(
                query(collection(db, this.COLLECTION_NAME), firestoreLimit(100))
            );

            const users = usersSnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as AdminUserProfile[];

            const searchLower = searchTerm.toLowerCase();
            return users
                .filter(user =>
                    user.email?.toLowerCase().includes(searchLower) ||
                    user.firstName?.toLowerCase().includes(searchLower) ||
                    user.lastName?.toLowerCase().includes(searchLower) ||
                    user.displayName?.toLowerCase().includes(searchLower) ||
                    user.phone?.includes(searchTerm)
                )
                .slice(0, limitCount);
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error('Failed to search users');
        }
    }

    /**
     * Get user activity logs
     */
    async getUserActivity(uid: string, limitCount = 50): Promise<UserActivity[]> {
        try {
            const activityQuery = query(
                collection(db, this.ACTIVITY_COLLECTION),
                where('uid', '==', uid),
                orderBy('timestamp', 'desc'),
                firestoreLimit(limitCount)
            );

            const snapshot = await getDocs(activityQuery);
            return snapshot.docs.map(doc => doc.data()) as UserActivity[];
        } catch (error) {
            console.error('Error getting user activity:', error);
            throw new Error('Failed to fetch user activity');
        }
    }

    /**
     * Log user activity
     */
    private async logActivity(uid: string, action: string, details?: any): Promise<void> {
        try {
            const activityRef = doc(collection(db, this.ACTIVITY_COLLECTION));
            await setDoc(activityRef, {
                uid,
                action,
                details,
                timestamp: Timestamp.now()
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw error for logging failures
        }
    }

    /**
     * Export users to CSV format
     */
    async exportUsers(filters?: AdminUserQuery): Promise<string> {
        try {
            const { users } = await this.getUsers({ ...filters, limit: 10000 });

            const headers = [
                'UID', 'Email', 'First Name', 'Last Name', 'Display Name',
                'Phone', 'Status', 'Role', 'Created At', 'Last Login'
            ];

            const csvRows = [
                headers.join(','),
                ...users.map(user => [
                    user.uid,
                    user.email || '',
                    user.firstName || '',
                    user.lastName || '',
                    user.displayName || '',
                    user.phone || '',
                    user.status || 'active',
                    user.role || 'user',
                    user.createdAt ? new Date(user.createdAt.toDate()).toISOString() : '',
                    user.lastLoginAt ? new Date(user.lastLoginAt.toDate()).toISOString() : ''
                ].map(field => `"${field}"`).join(','))
            ];

            return csvRows.join('\n');
        } catch (error) {
            console.error('Error exporting users:', error);
            throw new Error('Failed to export users');
        }
    }
}

// Export singleton instance
export const adminUserService = new AdminUserService();
export const userService = adminUserService;
