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
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp,
    arrayUnion,
    arrayRemove,
    increment,
    writeBatch
} from 'firebase/firestore';
import { firebaseDb } from '@/utils/firebaseInit';
import {
    Review,
    ReviewResponse,
    ReviewStats,
    CreateReviewData,
    UpdateReviewData,
    ReviewFilters,
    ReviewAction
} from '@/types/review';
import { hotelService } from './hotelService';

export const reviewService = {
    // Create review
    async createReview(data: CreateReviewData, userProfile: { uid: string; firstName: string; lastName: string; photoURL?: string }): Promise<Review> {
        try {
            const reviewRef = doc(collection(firebaseDb, 'reviews'));
            const batch = writeBatch(firebaseDb);

            const review: Review = {
                id: reviewRef.id,
                hotelId: data.hotelId,
                userId: userProfile.uid,
                userName: `${userProfile.firstName} ${userProfile.lastName}`,
                userAvatar: userProfile.photoURL,
                rating: data.rating,
                title: data.title,
                comment: data.comment,
                pros: data.pros || [],
                cons: data.cons || [],
                roomType: data.roomType,
                stayDate: data.stayDate,
                isVerified: false, // Will be verified after checking booking
                helpfulCount: 0,
                reportCount: 0,
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp,
                isActive: true,
                tags: data.tags || [],
                images: data.images || [],
                responses: []
            };

            // Add review
            batch.set(reviewRef, review);

            // Update hotel stats
            const hotelRef = doc(firebaseDb, 'hotels', data.hotelId);
            batch.update(hotelRef, {
                reviewCount: increment(1),
                updatedAt: serverTimestamp()
            });

            await batch.commit();

            // Recalculate hotel rating
            await this.updateHotelRating(data.hotelId);

            return review;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    // Get reviews for hotel
    async getHotelReviews(hotelId: string, filters: ReviewFilters = {}): Promise<Review[]> {
        try {
            let reviewsQuery = query(
                collection(firebaseDb, 'reviews'),
                where('hotelId', '==', hotelId),
                where('isActive', '==', true)
            );

            // Apply filters
            if (filters.verified !== undefined) {
                reviewsQuery = query(reviewsQuery, where('isVerified', '==', filters.verified));
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'newest':
                    reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));
                    break;
                case 'oldest':
                    reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'asc'));
                    break;
                case 'highest':
                    reviewsQuery = query(reviewsQuery, orderBy('rating', 'desc'));
                    break;
                case 'lowest':
                    reviewsQuery = query(reviewsQuery, orderBy('rating', 'asc'));
                    break;
                case 'helpful':
                    reviewsQuery = query(reviewsQuery, orderBy('helpfulCount', 'desc'));
                    break;
                default:
                    reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));
            }

            if (filters.limit) {
                reviewsQuery = query(reviewsQuery, limit(filters.limit));
            }

            if (filters.lastDoc) {
                reviewsQuery = query(reviewsQuery, startAfter(filters.lastDoc));
            }

            const querySnapshot = await getDocs(reviewsQuery);
            let reviews = querySnapshot.docs.map(doc => doc.data() as Review);

            // Client-side filtering
            if (filters.rating && filters.rating.length > 0) {
                reviews = reviews.filter(review => filters.rating!.includes(review.rating));
            }

            if (filters.tags && filters.tags.length > 0) {
                reviews = reviews.filter(review =>
                    filters.tags!.some(tag => review.tags?.includes(tag))
                );
            }

            if (filters.hasImages) {
                reviews = reviews.filter(review => review.images && review.images.length > 0);
            }

            if (filters.roomType) {
                reviews = reviews.filter(review => review.roomType === filters.roomType);
            }

            return reviews;
        } catch (error) {
            console.error('Error getting hotel reviews:', error);
            throw error;
        }
    },

    // Get review by ID
    async getReview(reviewId: string): Promise<Review | null> {
        try {
            const reviewDoc = await getDoc(doc(firebaseDb, 'reviews', reviewId));

            if (reviewDoc.exists()) {
                return reviewDoc.data() as Review;
            }

            return null;
        } catch (error) {
            console.error('Error getting review:', error);
            throw error;
        }
    },

    // Update review
    async updateReview(reviewId: string, data: UpdateReviewData): Promise<void> {
        try {
            const updateData: any = {
                ...data,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(firebaseDb, 'reviews', reviewId), updateData);

            // If rating changed, recalculate hotel rating
            if (data.rating !== undefined) {
                const review = await this.getReview(reviewId);
                if (review) {
                    await this.updateHotelRating(review.hotelId);
                }
            }
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    },

    // Delete review
    async deleteReview(reviewId: string): Promise<void> {
        try {
            const review = await this.getReview(reviewId);
            if (!review) throw new Error('Review not found');

            const batch = writeBatch(firebaseDb);

            // Delete review
            batch.update(doc(firebaseDb, 'reviews', reviewId), {
                isActive: false,
                updatedAt: serverTimestamp()
            });

            // Update hotel stats
            const hotelRef = doc(firebaseDb, 'hotels', review.hotelId);
            batch.update(hotelRef, {
                reviewCount: increment(-1),
                updatedAt: serverTimestamp()
            });

            await batch.commit();

            // Recalculate hotel rating
            await this.updateHotelRating(review.hotelId);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    },

    // Mark review as helpful
    async markHelpful(reviewId: string, userId: string): Promise<void> {
        try {
            const actionRef = doc(collection(firebaseDb, 'reviewActions'));
            const action: ReviewAction = {
                userId,
                type: 'helpful',
                timestamp: serverTimestamp() as Timestamp
            };

            const batch = writeBatch(firebaseDb);

            // Add action
            batch.set(actionRef, {
                reviewId,
                ...action
            });

            // Increment helpful count
            batch.update(doc(firebaseDb, 'reviews', reviewId), {
                helpfulCount: increment(1),
                updatedAt: serverTimestamp()
            });

            await batch.commit();
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            throw error;
        }
    },

    // Report review
    async reportReview(reviewId: string, userId: string, reason: string): Promise<void> {
        try {
            const actionRef = doc(collection(firebaseDb, 'reviewActions'));
            const action: ReviewAction = {
                userId,
                type: 'report',
                timestamp: serverTimestamp() as Timestamp
            };

            const batch = writeBatch(firebaseDb);

            // Add action
            batch.set(actionRef, {
                reviewId,
                reason,
                ...action
            });

            // Increment report count
            batch.update(doc(firebaseDb, 'reviews', reviewId), {
                reportCount: increment(1),
                updatedAt: serverTimestamp()
            });

            await batch.commit();
        } catch (error) {
            console.error('Error reporting review:', error);
            throw error;
        }
    },

    // Add response to review
    async addResponse(reviewId: string, userId: string, userName: string, userRole: 'hotel' | 'admin' | 'user', content: string): Promise<void> {
        try {
            const response: ReviewResponse = {
                id: Date.now().toString(),
                userId,
                userName,
                userRole,
                content,
                createdAt: serverTimestamp() as Timestamp,
                isActive: true
            };

            await updateDoc(doc(firebaseDb, 'reviews', reviewId), {
                responses: arrayUnion(response),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding response:', error);
            throw error;
        }
    },

    // Get review stats for hotel
    async getReviewStats(hotelId: string): Promise<ReviewStats> {
        try {
            const reviewsQuery = query(
                collection(firebaseDb, 'reviews'),
                where('hotelId', '==', hotelId),
                where('isActive', '==', true)
            );

            const querySnapshot = await getDocs(reviewsQuery);
            const reviews = querySnapshot.docs.map(doc => doc.data() as Review);

            if (reviews.length === 0) {
                return {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    categories: {
                        cleanliness: 0,
                        service: 0,
                        location: 0,
                        facilities: 0,
                        value: 0
                    }
                };
            }

            const totalReviews: number = reviews.length;
            const averageRating: number = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.forEach(review => {
                ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
            });

            // Mock category ratings - in real app, you'd collect these during review creation
            const categories = {
                cleanliness: Math.round((averageRating + Math.random() * 0.5 - 0.25) * 10) / 10,
                service: Math.round((averageRating + Math.random() * 0.5 - 0.25) * 10) / 10,
                location: Math.round((averageRating + Math.random() * 0.5 - 0.25) * 10) / 10,
                facilities: Math.round((averageRating + Math.random() * 0.5 - 0.25) * 10) / 10,
                value: Math.round((averageRating + Math.random() * 0.5 - 0.25) * 10) / 10
            };

            return {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution,
                categories
            };
        } catch (error) {
            console.error('Error getting review stats:', error);
            throw error;
        }
    },

    // Update hotel rating and review stats
    async updateHotelRating(hotelId: string): Promise<void> {
        try {
            const stats = await this.getReviewStats(hotelId);

            await updateDoc(doc(firebaseDb, 'hotels', hotelId), {
                rating: stats.averageRating,
                reviewCount: stats.totalReviews,
                reviewStats: stats,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating hotel rating:', error);
            throw error;
        }
    },

    // Get user reviews
    async getUserReviews(userId: string): Promise<Review[]> {
        try {
            const reviewsQuery = query(
                collection(firebaseDb, 'reviews'),
                where('userId', '==', userId),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(reviewsQuery);
            return querySnapshot.docs.map(doc => doc.data() as Review);
        } catch (error) {
            console.error('Error getting user reviews:', error);
            throw error;
        }
    },

    // Verify review (admin function)
    async verifyReview(reviewId: string, isVerified: boolean): Promise<void> {
        try {
            await updateDoc(doc(firebaseDb, 'reviews', reviewId), {
                isVerified,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error verifying review:', error);
            throw error;
        }
    },

    // Get all reviews (admin function)
    async getAllReviews(): Promise<Review[]> {
        try {
            const reviewsQuery = query(
                collection(firebaseDb, 'reviews'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(reviewsQuery);
            return querySnapshot.docs.map(doc => doc.data() as Review);
        } catch (error) {
            console.error('Error getting all reviews:', error);
            throw error;
        }
    }
};