import { Timestamp, GeoPoint } from 'firebase/firestore';

// =================== HOTEL INTERFACES ===================
export interface Hotel {
    id: string;
    name: string;
    description: string;
    location: string;
    address: string;
    city: string;
    country: string;
    coordinates?: GeoPoint;
    rating: number;
    reviewCount: number;
    priceRange: {
        min: number;
        max: number;
    };
    amenities: string[];
    images: string[];
    rooms: HotelRoom[];
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    policies: {
        checkIn: string;
        checkOut: string;
        cancellation: string;
        pets: boolean;
        smoking: boolean;
    };
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface HotelRoom {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    maxGuests: number;
    bedType: string;
    size: number;
    amenities: string[];
    images: string[];
    available: number;
    isActive: boolean;
}

export interface SearchFilters {
    location?: string;
    checkIn?: Date;
    checkOut?: Date;
    guests?: number;
    rooms?: number;
    priceRange?: [number, number];
    rating?: number;
    amenities?: string[];
    sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance';
}

export interface CreateHotelData {
    name: string;
    description: string;
    location: string;
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
    amenities: string[];
    images: string[];
    contact: {
        phone: string;
        email: string;
        website?: string;
    };
    policies: {
        checkIn: string;
        checkOut: string;
        cancellation: string;
        pets: boolean;
        smoking: boolean;
    };
}

export interface UpdateHotelData {
    name?: string;
    description?: string;
    location?: string;
    address?: string;
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    amenities?: string[];
    images?: string[];
    contact?: Partial<Hotel['contact']>;
    policies?: Partial<Hotel['policies']>;
    isActive?: boolean;
    isFeatured?: boolean;
}

// =================== BOOKING INTERFACES ===================
export interface Booking {
    id: string;
    confirmationCode: string;
    userId: string;
    hotelId: string;
    hotelName: string;
    hotelLocation: string;
    hotelImage: string;
    roomId: string;
    roomName: string;
    checkIn: Timestamp;
    checkOut: Timestamp;
    guests: number;
    rooms: number;
    guestInfo: {
        title: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        country: string;
        specialRequests?: string;
    };
    pricing: {
        roomRate: number;
        taxes: number;
        serviceFee: number;
        total: number;
        currency: string;
    };
    paymentInfo: {
        method: 'card' | 'paypal' | 'bank';
        status: 'pending' | 'completed' | 'failed' | 'refunded';
        transactionId?: string;
        paymentDate?: Timestamp;
    };
    status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
    policies: {
        cancellationDeadline: Timestamp;
        canModify: boolean;
        canCancel: boolean;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateBookingData {
    userId: string;
    hotelId: string;
    hotelName: string;
    hotelLocation: string;
    hotelImage: string;
    roomId: string;
    roomName: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    rooms: number;
    guestInfo: {
        title: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        country: string;
        specialRequests?: string;
    };
    pricing: {
        roomRate: number;
        taxes: number;
        serviceFee: number;
        total: number;
        currency: string;
    };
    paymentInfo: {
        method: 'card' | 'paypal' | 'bank';
        cardDetails?: {
            cardNumber: string;
            expiryDate: string;
            cvv: string;
            cardHolderName: string;
        };
    };
}

export interface UpdateBookingData {
    checkIn?: Date;
    checkOut?: Date;
    guests?: number;
    rooms?: number;
    guestInfo?: Partial<Booking['guestInfo']>;
    status?: Booking['status'];
    paymentStatus?: Booking['paymentInfo']['status'];
}

export interface BookingFilters {
    status?: Booking['status'];
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
    limit?: number;
}

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

// =================== STORAGE INTERFACES ===================
export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}

export interface UploadResult {
    url: string;
    fullPath: string;
    name: string;
    size: number;
}

// =================== SEARCH & UI INTERFACES ===================
export interface SearchParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    rooms: number;
    guests?: {
        adults: number;
        children: number;
    };
}

export interface Destination {
    id: string;
    name: string;
    image: string;
    startingPrice: number;
    hotelCount: number;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}
