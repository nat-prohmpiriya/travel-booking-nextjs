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
    tags?: string[];
    phone?: string;
    email?: string;
    // Additional properties for display
    price?: number; // Current price for display
    pricePerNight?: number; // Price per night
    imageUrl?: string; // Primary image URL
    distance?: number; // Distance from search location
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
