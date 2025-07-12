import { Timestamp } from 'firebase/firestore';

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
    paymentInfo?: {
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
