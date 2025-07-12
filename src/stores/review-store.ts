import { create } from 'zustand';
import {
    Review,
    ReviewStats,
    CreateReviewData,
    UpdateReviewData,
    ReviewFilters
} from '@/types/review';
import { reviewService } from '@/services/reviewService';

interface ReviewState {
    reviews: Review[];
    reviewStats: ReviewStats | null;
    userReviews: Review[];
    currentFilters: ReviewFilters;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    lastDoc: any;
    hasMore: boolean;
    
    // Actions
    setReviews: (reviews: Review[]) => void;
    setReviewStats: (stats: ReviewStats | null) => void;
    setUserReviews: (reviews: Review[]) => void;
    setFilters: (filters: Partial<ReviewFilters>) => void;
    setLoading: (loading: boolean) => void;
    setSubmitting: (submitting: boolean) => void;
    setError: (error: string | null) => void;
    
    // Service methods
    loadHotelReviews: (hotelId: string, reset?: boolean) => Promise<void>;
    loadReviewStats: (hotelId: string) => Promise<void>;
    loadUserReviews: (userId: string) => Promise<void>;
    createReview: (data: CreateReviewData, userProfile: { uid: string; firstName: string; lastName: string; photoURL?: string }) => Promise<Review>;
    updateReview: (reviewId: string, data: UpdateReviewData) => Promise<void>;
    deleteReview: (reviewId: string) => Promise<void>;
    markHelpful: (reviewId: string, userId: string) => Promise<void>;
    reportReview: (reviewId: string, userId: string, reason: string) => Promise<void>;
    addResponse: (reviewId: string, userId: string, userName: string, userRole: 'hotel' | 'admin' | 'user', content: string) => Promise<void>;
    verifyReview: (reviewId: string, isVerified: boolean) => Promise<void>;
    clearReviews: () => void;
    clearError: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    reviews: [],
    reviewStats: null,
    userReviews: [],
    currentFilters: {},
    isLoading: false,
    isSubmitting: false,
    error: null,
    lastDoc: null,
    hasMore: true,

    setReviews: (reviews: Review[]) => {
        set({ reviews });
    },

    setReviewStats: (stats: ReviewStats | null) => {
        set({ reviewStats: stats });
    },

    setUserReviews: (reviews: Review[]) => {
        set({ userReviews: reviews });
    },

    setFilters: (filters: Partial<ReviewFilters>) => {
        set((state) => ({
            currentFilters: { ...state.currentFilters, ...filters }
        }));
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setSubmitting: (submitting: boolean) => {
        set({ isSubmitting: submitting });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    loadHotelReviews: async (hotelId: string, reset: boolean = false) => {
        const { currentFilters, lastDoc } = get();
        
        if (reset) {
            set({ isLoading: true, error: null, reviews: [], lastDoc: null, hasMore: true });
        } else {
            set({ isLoading: true, error: null });
        }

        try {
            const filters: ReviewFilters = {
                ...currentFilters,
                limit: 10,
                lastDoc: reset ? null : lastDoc
            };

            const newReviews = await reviewService.getHotelReviews(hotelId, filters);
            
            set((state) => ({
                reviews: reset ? newReviews : [...state.reviews, ...newReviews],
                lastDoc: newReviews.length > 0 ? newReviews[newReviews.length - 1] : state.lastDoc,
                hasMore: newReviews.length === (filters.limit || 10),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error loading hotel reviews:', error);
            set({
                error: 'ไม่สามารถโหลดรีวิวได้ กรุณาลองใหม่อีกครั้ง',
                isLoading: false
            });
        }
    },

    loadReviewStats: async (hotelId: string) => {
        try {
            const stats = await reviewService.getReviewStats(hotelId);
            set({ reviewStats: stats });
        } catch (error) {
            console.error('Error loading review stats:', error);
            set({ error: 'ไม่สามารถโหลดสถิติรีวิวได้' });
        }
    },

    loadUserReviews: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
            const reviews = await reviewService.getUserReviews(userId);
            set({ userReviews: reviews, isLoading: false });
        } catch (error) {
            console.error('Error loading user reviews:', error);
            set({
                error: 'ไม่สามารถโหลดรีวิวของคุณได้ กรุณาลองใหม่อีกครั้ง',
                isLoading: false
            });
        }
    },

    createReview: async (data: CreateReviewData, userProfile: { uid: string; firstName: string; lastName: string; photoURL?: string }) => {
        set({ isSubmitting: true, error: null });

        try {
            const review = await reviewService.createReview(data, userProfile);
            
            // Add to reviews list
            set((state) => ({
                reviews: [review, ...state.reviews],
                isSubmitting: false
            }));

            // Reload stats
            get().loadReviewStats(data.hotelId);

            return review;
        } catch (error: any) {
            console.error('Error creating review:', error);
            
            let errorMessage = 'ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง';
            
            if (error.code === 'permission-denied') {
                errorMessage = 'คุณไม่มีสิทธิ์ในการเขียนรีวิว';
            } else if (error.code === 'unauthenticated') {
                errorMessage = 'กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว';
            } else if (error.code === 'network-request-failed') {
                errorMessage = 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
            }
            
            set({
                error: errorMessage,
                isSubmitting: false
            });
            throw error;
        }
    },

    updateReview: async (reviewId: string, data: UpdateReviewData) => {
        set({ isSubmitting: true, error: null });

        try {
            await reviewService.updateReview(reviewId, data);

            // Update in reviews list
            set((state) => ({
                reviews: state.reviews.map(review =>
                    review.id === reviewId
                        ? { ...review, ...data }
                        : review
                ),
                isSubmitting: false
            }));

            // Reload stats if rating changed
            if (data.rating !== undefined) {
                const review = get().reviews.find(r => r.id === reviewId);
                if (review) {
                    get().loadReviewStats(review.hotelId);
                }
            }
        } catch (error) {
            console.error('Error updating review:', error);
            set({
                error: 'ไม่สามารถอัปเดตรีวิวได้ กรุณาลองใหม่อีกครั้ง',
                isSubmitting: false
            });
            throw error;
        }
    },

    deleteReview: async (reviewId: string) => {
        set({ isSubmitting: true, error: null });

        try {
            const review = get().reviews.find(r => r.id === reviewId);
            
            await reviewService.deleteReview(reviewId);

            // Remove from reviews list
            set((state) => ({
                reviews: state.reviews.filter(r => r.id !== reviewId),
                isSubmitting: false
            }));

            // Reload stats
            if (review) {
                get().loadReviewStats(review.hotelId);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            set({
                error: 'ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง',
                isSubmitting: false
            });
            throw error;
        }
    },

    markHelpful: async (reviewId: string, userId: string) => {
        try {
            await reviewService.markHelpful(reviewId, userId);

            // Update helpful count in reviews list
            set((state) => ({
                reviews: state.reviews.map(review =>
                    review.id === reviewId
                        ? { ...review, helpfulCount: review.helpfulCount + 1 }
                        : review
                )
            }));
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            set({ error: 'ไม่สามารถให้คะแนนความเป็นประโยชน์ได้' });
        }
    },

    reportReview: async (reviewId: string, userId: string, reason: string) => {
        try {
            await reviewService.reportReview(reviewId, userId, reason);

            // Update report count in reviews list
            set((state) => ({
                reviews: state.reviews.map(review =>
                    review.id === reviewId
                        ? { ...review, reportCount: review.reportCount + 1 }
                        : review
                )
            }));
        } catch (error) {
            console.error('Error reporting review:', error);
            set({ error: 'ไม่สามารถรายงานรีวิวได้' });
        }
    },

    addResponse: async (reviewId: string, userId: string, userName: string, userRole: 'hotel' | 'admin' | 'user', content: string) => {
        try {
            await reviewService.addResponse(reviewId, userId, userName, userRole, content);

            // Update responses in reviews list
            set((state) => ({
                reviews: state.reviews.map(review => {
                    if (review.id === reviewId) {
                        const newResponse = {
                            id: Date.now().toString(),
                            userId,
                            userName,
                            userRole,
                            content,
                            createdAt: new Date() as any,
                            isActive: true
                        };
                        return {
                            ...review,
                            responses: [...(review.responses || []), newResponse]
                        };
                    }
                    return review;
                })
            }));
        } catch (error) {
            console.error('Error adding response:', error);
            set({ error: 'ไม่สามารถตอบกลับรีวิวได้' });
        }
    },

    verifyReview: async (reviewId: string, isVerified: boolean) => {
        try {
            await reviewService.verifyReview(reviewId, isVerified);

            // Update verification status in reviews list
            set((state) => ({
                reviews: state.reviews.map(review =>
                    review.id === reviewId
                        ? { ...review, isVerified }
                        : review
                )
            }));
        } catch (error) {
            console.error('Error verifying review:', error);
            set({ error: 'ไม่สามารถยืนยันรีวิวได้' });
        }
    },

    clearReviews: () => {
        set({
            reviews: [],
            reviewStats: null,
            userReviews: [],
            lastDoc: null,
            hasMore: true,
            error: null
        });
    },

    clearError: () => {
        set({ error: null });
    }
}));