import { Timestamp } from 'firebase/firestore';

// =================== REVIEW INTERFACES ===================
export interface Review {
    id: string;
    hotelId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    roomType?: string;
    stayDate: Date;
    isVerified: boolean;
    helpfulCount: number;
    reportCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive: boolean;
    tags?: string[];
    images?: string[];
    responses?: ReviewResponse[];
}

export interface ReviewResponse {
    id: string;
    userId: string;
    userName: string;
    userRole: 'hotel' | 'admin' | 'user';
    content: string;
    createdAt: Timestamp;
    isActive: boolean;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    categories: {
        cleanliness: number;
        service: number;
        location: number;
        facilities: number;
        value: number;
    };
}

export interface CreateReviewData {
    hotelId: string;
    rating: number;
    title: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    roomType?: string;
    stayDate: Date;
    tags?: string[];
    images?: string[];
    categories?: {
        cleanliness: number;
        service: number;
        location: number;
        facilities: number;
        value: number;
    };
}

export interface UpdateReviewData {
    rating?: number;
    title?: string;
    comment?: string;
    pros?: string[];
    cons?: string[];
    tags?: string[];
    images?: string[];
    categories?: Partial<CreateReviewData['categories']>;
}

export interface ReviewFilters {
    rating?: number[];
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    tags?: string[];
    verified?: boolean;
    hasImages?: boolean;
    roomType?: string;
    limit?: number;
    lastDoc?: any;
}

export interface ReviewAction {
    userId: string;
    type: 'helpful' | 'report';
    timestamp: Timestamp;
}