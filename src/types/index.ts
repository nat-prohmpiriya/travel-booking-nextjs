export interface Hotel {
    id: string;
    name: string;
    location: string;
    rating: number;
    pricePerNight: number;
    amenities: string[];
    images: string[];
    description?: string;
}

export interface Booking {
    id: string;
    userId: string;
    hotelId: string;
    checkIn: Date;
    checkOut: Date;
    guests: { adults: number; children: number };
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export interface SearchParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
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
