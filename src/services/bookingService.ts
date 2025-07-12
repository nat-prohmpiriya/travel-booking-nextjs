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
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { firebaseDb } from '@/utils/firebaseInit';
import {
    Booking,
    CreateBookingData,
    UpdateBookingData,
    BookingFilters
} from '@/types';

export const bookingService = {
    // Generate confirmation code
    generateConfirmationCode(): string {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `BK${timestamp.slice(-6)}${random}`;
    },

    // Create booking
    async createBooking(data: CreateBookingData): Promise<Booking> {
        const bookingRef = doc(collection(firebaseDb, 'bookings'));
        const confirmationCode = this.generateConfirmationCode();

        // Calculate cancellation deadline (24 hours before check-in)
        const cancellationDeadline = new Date(data.checkIn);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);

        const booking: Booking = {
            id: bookingRef.id,
            confirmationCode,
            userId: data.userId,
            hotelId: data.hotelId,
            hotelName: data.hotelName,
            hotelLocation: data.hotelLocation,
            hotelImage: data.hotelImage,
            roomId: data.roomId,
            roomName: data.roomName,
            checkIn: Timestamp.fromDate(data.checkIn),
            checkOut: Timestamp.fromDate(data.checkOut),
            guests: data.guests,
            rooms: data.rooms,
            guestInfo: data.guestInfo,
            pricing: data.pricing,
            paymentInfo: {
                method: data.paymentInfo.method,
                status: 'pending',
                paymentDate: serverTimestamp() as Timestamp
            },
            status: 'pending',
            policies: {
                cancellationDeadline: Timestamp.fromDate(cancellationDeadline),
                canModify: true,
                canCancel: true
            },
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp
        };

        await setDoc(bookingRef, booking);

        // Simulate payment processing
        setTimeout(async () => {
            try {
                await this.updateBookingPaymentStatus(booking.id, 'completed');
                await this.updateBookingStatus(booking.id, 'confirmed');
            } catch (error) {
                console.error('Error updating booking status:', error);
            }
        }, 2000);

        return booking;
    },

    // Get booking by ID
    async getBooking(bookingId: string): Promise<Booking | null> {
        try {
            const bookingDoc = await getDoc(doc(firebaseDb, 'bookings', bookingId));

            if (bookingDoc.exists()) {
                return bookingDoc.data() as Booking;
            }

            return null;
        } catch (error) {
            console.error('Error getting booking:', error);
            throw error;
        }
    },

    // Get booking by confirmation code
    async getBookingByConfirmationCode(confirmationCode: string): Promise<Booking | null> {
        try {
            const bookingsRef = collection(firebaseDb, 'bookings');
            const q = query(bookingsRef, where('confirmationCode', '==', confirmationCode));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const bookingDoc = querySnapshot.docs[0];
                return bookingDoc.data() as Booking;
            }

            return null;
        } catch (error) {
            console.error('Error getting booking by confirmation code:', error);
            throw error;
        }
    },

    // Get user bookings
    async getUserBookings(userId: string, filters?: BookingFilters): Promise<Booking[]> {
        try {
            let bookingsQuery = query(
                collection(firebaseDb, 'bookings'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            // Apply status filter
            if (filters?.status) {
                bookingsQuery = query(
                    collection(firebaseDb, 'bookings'),
                    where('userId', '==', userId),
                    where('status', '==', filters.status),
                    orderBy('createdAt', 'desc')
                );
            }

            const querySnapshot = await getDocs(bookingsQuery);
            let bookings = querySnapshot.docs.map(doc => doc.data() as Booking);

            // Client-side filtering for complex filters
            if (filters?.dateRange) {
                const { start, end } = filters.dateRange;
                bookings = bookings.filter(booking => {
                    const bookingDate = booking.createdAt.toDate();
                    return bookingDate >= start && bookingDate <= end;
                });
            }

            if (filters?.search) {
                const searchTerm = filters.search.toLowerCase();
                bookings = bookings.filter(booking =>
                    booking.hotelName.toLowerCase().includes(searchTerm) ||
                    booking.confirmationCode.toLowerCase().includes(searchTerm) ||
                    booking.hotelLocation.toLowerCase().includes(searchTerm)
                );
            }

            return bookings;
        } catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    },

    // Update booking
    async updateBooking(bookingId: string, data: UpdateBookingData): Promise<void> {
        try {
            const updateData: any = {
                ...data,
                updatedAt: serverTimestamp()
            };

            if (data.checkIn) {
                updateData.checkIn = Timestamp.fromDate(data.checkIn);
                // Update cancellation deadline
                const cancellationDeadline = new Date(data.checkIn);
                cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);
                updateData['policies.cancellationDeadline'] = Timestamp.fromDate(cancellationDeadline);
            }

            if (data.checkOut) {
                updateData.checkOut = Timestamp.fromDate(data.checkOut);
            }

            await updateDoc(doc(firebaseDb, 'bookings', bookingId), updateData);
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    // Update booking status
    async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
        try {
            const updateData: any = {
                status,
                updatedAt: serverTimestamp()
            };

            // Update policies based on status
            if (status === 'cancelled' || status === 'checked-out') {
                updateData['policies.canModify'] = false;
                updateData['policies.canCancel'] = false;
            }

            await updateDoc(doc(firebaseDb, 'bookings', bookingId), updateData);
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    },

    // Update payment status
    async updateBookingPaymentStatus(bookingId: string, status: Booking['paymentInfo']['status'], transactionId?: string): Promise<void> {
        try {
            const updateData: any = {
                'paymentInfo.status': status,
                updatedAt: serverTimestamp()
            };

            if (transactionId) {
                updateData['paymentInfo.transactionId'] = transactionId;
            }

            if (status === 'completed') {
                updateData['paymentInfo.paymentDate'] = serverTimestamp();
            }

            await updateDoc(doc(firebaseDb, 'bookings', bookingId), updateData);
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Cancel booking
    async cancelBooking(bookingId: string, reason?: string): Promise<void> {
        try {
            const booking = await this.getBooking(bookingId);
            if (!booking) throw new Error('Booking not found');

            // Check if cancellation is allowed
            const now = new Date();
            const cancellationDeadline = booking.policies.cancellationDeadline.toDate();

            if (now > cancellationDeadline) {
                throw new Error('Cancellation deadline has passed');
            }

            if (!booking.policies.canCancel) {
                throw new Error('This booking cannot be cancelled');
            }

            // Update booking status
            await this.updateBookingStatus(bookingId, 'cancelled');

            // Update payment status if needed
            if (booking.paymentInfo.status === 'completed') {
                await this.updateBookingPaymentStatus(bookingId, 'refunded');
            }

        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    // Delete booking (admin only)
    async deleteBooking(bookingId: string): Promise<void> {
        try {
            await deleteDoc(doc(firebaseDb, 'bookings', bookingId));
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    // Get hotel bookings (for hotel management)
    async getHotelBookings(hotelId: string, filters?: BookingFilters): Promise<Booking[]> {
        try {
            let bookingsQuery = query(
                collection(firebaseDb, 'bookings'),
                where('hotelId', '==', hotelId),
                orderBy('checkIn', 'asc')
            );

            if (filters?.status) {
                bookingsQuery = query(
                    collection(firebaseDb, 'bookings'),
                    where('hotelId', '==', hotelId),
                    where('status', '==', filters.status),
                    orderBy('checkIn', 'asc')
                );
            }

            const querySnapshot = await getDocs(bookingsQuery);
            return querySnapshot.docs.map(doc => doc.data() as Booking);
        } catch (error) {
            console.error('Error getting hotel bookings:', error);
            throw error;
        }
    },

    // Get booking statistics
    async getBookingStats(userId?: string, hotelId?: string): Promise<{
        total: number;
        confirmed: number;
        cancelled: number;
        pending: number;
        revenue: number;
    }> {
        try {
            let bookingsQuery = query(collection(firebaseDb, 'bookings'));

            if (userId) {
                bookingsQuery = query(bookingsQuery, where('userId', '==', userId));
            }

            if (hotelId) {
                bookingsQuery = query(bookingsQuery, where('hotelId', '==', hotelId));
            }

            const querySnapshot = await getDocs(bookingsQuery);
            const bookings = querySnapshot.docs.map(doc => doc.data() as Booking);

            const stats = {
                total: bookings.length,
                confirmed: bookings.filter(b => b.status === 'confirmed').length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length,
                pending: bookings.filter(b => b.status === 'pending').length,
                revenue: bookings
                    .filter(b => b.paymentInfo.status === 'completed')
                    .reduce((sum, b) => sum + b.pricing.total, 0)
            };

            return stats;
        } catch (error) {
            console.error('Error getting booking stats:', error);
            throw error;
        }
    },

    // Get all bookings (admin only)
    async getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
        try {
            let bookingsQuery = query(
                collection(firebaseDb, 'bookings'),
                orderBy('createdAt', 'desc'),
                limit(filters?.limit || 1000)
            );

            // Apply status filter
            if (filters?.status) {
                bookingsQuery = query(
                    collection(firebaseDb, 'bookings'),
                    where('status', '==', filters.status),
                    orderBy('createdAt', 'desc'),
                    limit(filters?.limit || 1000)
                );
            }

            const querySnapshot = await getDocs(bookingsQuery);
            let bookings = querySnapshot.docs.map(doc => doc.data() as Booking);

            // Client-side filtering for complex filters
            if (filters?.dateRange) {
                const { start, end } = filters.dateRange;
                bookings = bookings.filter(booking => {
                    const bookingDate = booking.createdAt.toDate();
                    return bookingDate >= start && bookingDate <= end;
                });
            }

            if (filters?.search) {
                const searchTerm = filters.search.toLowerCase();
                bookings = bookings.filter(booking =>
                    booking.hotelName.toLowerCase().includes(searchTerm) ||
                    booking.confirmationCode.toLowerCase().includes(searchTerm) ||
                    booking.hotelLocation.toLowerCase().includes(searchTerm) ||
                    booking.guestInfo.firstName.toLowerCase().includes(searchTerm) ||
                    booking.guestInfo.lastName.toLowerCase().includes(searchTerm) ||
                    booking.guestInfo.email.toLowerCase().includes(searchTerm)
                );
            }

            return bookings;
        } catch (error) {
            console.error('Error getting all bookings:', error);
            throw error;
        }
    }
};