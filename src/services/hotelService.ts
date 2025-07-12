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
    GeoPoint,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { firebaseDb } from '@/utils/firebaseInit';
import {
    Hotel,
    HotelRoom,
    SearchFilters,
    CreateHotelData,
    UpdateHotelData
} from '@/types';

export const hotelService = {
    // Create hotel
    async createHotel(data: CreateHotelData): Promise<Hotel> {
        const hotelRef = doc(collection(firebaseDb, 'hotels'));

        const hotel: Hotel = {
            id: hotelRef.id,
            name: data.name,
            description: data.description,
            location: data.location,
            address: data.address,
            city: data.city,
            country: data.country,
            coordinates: data.coordinates ? new GeoPoint(data.coordinates.lat, data.coordinates.lng) : undefined,
            rating: 0,
            reviewCount: 0,
            priceRange: { min: 0, max: 0 },
            amenities: data.amenities,
            images: data.images,
            rooms: [],
            contact: data.contact,
            policies: data.policies,
            isActive: true,
            isFeatured: false,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp
        };

        await setDoc(hotelRef, hotel);
        return hotel;
    },

    // Get hotel by ID
    async getHotel(hotelId: string): Promise<Hotel | null> {
        try {
            const hotelDoc = await getDoc(doc(firebaseDb, 'hotels', hotelId));

            if (hotelDoc.exists()) {
                return hotelDoc.data() as Hotel;
            }

            return null;
        } catch (error) {
            console.error('Error getting hotel:', error);
            throw error;
        }
    },

    // Search hotels
    async searchHotels(filters: SearchFilters): Promise<Hotel[]> {
        try {
            let hotelsQuery = query(collection(firebaseDb, 'hotels'), where('isActive', '==', true));

            // Filter by location/city
            if (filters.location) {
                hotelsQuery = query(
                    hotelsQuery,
                    where('city', '>=', filters.location),
                    where('city', '<=', filters.location + '\uf8ff')
                );
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'rating':
                    hotelsQuery = query(hotelsQuery, orderBy('rating', 'desc'));
                    break;
                case 'price-low':
                    hotelsQuery = query(hotelsQuery, orderBy('priceRange.min', 'asc'));
                    break;
                case 'price-high':
                    hotelsQuery = query(hotelsQuery, orderBy('priceRange.max', 'desc'));
                    break;
                default:
                    hotelsQuery = query(hotelsQuery, orderBy('updatedAt', 'desc'));
            }

            const querySnapshot = await getDocs(hotelsQuery);
            let hotels = querySnapshot.docs.map(doc => doc.data() as Hotel);

            // Client-side filtering for complex filters
            if (filters.priceRange) {
                hotels = hotels.filter(hotel =>
                    hotel.priceRange.min >= filters.priceRange![0] &&
                    hotel.priceRange.max <= filters.priceRange![1]
                );
            }

            if (filters.rating) {
                hotels = hotels.filter(hotel => hotel.rating >= filters.rating!);
            }

            if (filters.amenities && filters.amenities.length > 0) {
                hotels = hotels.filter(hotel =>
                    filters.amenities!.every(amenity => hotel.amenities.includes(amenity))
                );
            }

            return hotels;
        } catch (error) {
            console.error('Error searching hotels:', error);
            throw error;
        }
    },

    // Get featured hotels
    async getFeaturedHotels(limitCount: number = 10): Promise<Hotel[]> {
        try {
            const hotelsQuery = query(
                collection(firebaseDb, 'hotels'),
                where('isActive', '==', true),
                where('isFeatured', '==', true),
                orderBy('rating', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(hotelsQuery);
            return querySnapshot.docs.map(doc => doc.data() as Hotel);
        } catch (error) {
            console.error('Error getting featured hotels:', error);
            throw error;
        }
    },

    // Get popular destinations
    async getPopularDestinations(limitCount: number = 10): Promise<Array<{ id: string, name: string, count: number, image: string }>> {
        try {
            const hotelsQuery = query(
                collection(firebaseDb, 'hotels'),
                where('isActive', '==', true)
            );

            const querySnapshot = await getDocs(hotelsQuery);
            const hotels = querySnapshot.docs.map(doc => doc.data() as Hotel);

            // Group by city and count
            const cityMap = new Map<string, { count: number, image: string }>();

            hotels.forEach(hotel => {
                const existing = cityMap.get(hotel.city);
                if (existing) {
                    existing.count++;
                } else {
                    cityMap.set(hotel.city, {
                        count: 1,
                        image: hotel.images[0] || ''
                    });
                }
            });

            // Convert to array and sort by count
            const destinations = Array.from(cityMap.entries())
                .map(([name, data]) => ({
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    name,
                    count: data.count,
                    image: data.image
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limitCount);

            return destinations;
        } catch (error) {
            console.error('Error getting popular destinations:', error);
            throw error;
        }
    },

    // Update hotel
    async updateHotel(hotelId: string, data: UpdateHotelData): Promise<void> {
        try {
            const updateData: any = {
                ...data,
                updatedAt: serverTimestamp()
            };

            if (data.coordinates) {
                updateData.coordinates = new GeoPoint(data.coordinates.lat, data.coordinates.lng);
            }

            await updateDoc(doc(firebaseDb, 'hotels', hotelId), updateData);
        } catch (error) {
            console.error('Error updating hotel:', error);
            throw error;
        }
    },

    // Delete hotel
    async deleteHotel(hotelId: string): Promise<void> {
        try {
            await deleteDoc(doc(firebaseDb, 'hotels', hotelId));
        } catch (error) {
            console.error('Error deleting hotel:', error);
            throw error;
        }
    },

    // Add room to hotel
    async addRoom(hotelId: string, room: Omit<HotelRoom, 'id'>): Promise<void> {
        try {
            const roomWithId: HotelRoom = {
                ...room,
                id: Date.now().toString() // Simple ID generation
            };

            await updateDoc(doc(firebaseDb, 'hotels', hotelId), {
                rooms: arrayUnion(roomWithId),
                updatedAt: serverTimestamp()
            });

            // Update price range
            await this.updateHotelPriceRange(hotelId);
        } catch (error) {
            console.error('Error adding room:', error);
            throw error;
        }
    },

    // Remove room from hotel
    async removeRoom(hotelId: string, roomId: string): Promise<void> {
        try {
            const hotel = await this.getHotel(hotelId);
            if (!hotel) throw new Error('Hotel not found');

            const updatedRooms = hotel.rooms.filter(room => room.id !== roomId);

            await updateDoc(doc(firebaseDb, 'hotels', hotelId), {
                rooms: updatedRooms,
                updatedAt: serverTimestamp()
            });

            // Update price range
            await this.updateHotelPriceRange(hotelId);
        } catch (error) {
            console.error('Error removing room:', error);
            throw error;
        }
    },

    // Update hotel price range based on rooms
    async updateHotelPriceRange(hotelId: string): Promise<void> {
        try {
            const hotel = await this.getHotel(hotelId);
            if (!hotel || hotel.rooms.length === 0) return;

            const prices = hotel.rooms.map(room => room.price);
            const priceRange = {
                min: Math.min(...prices),
                max: Math.max(...prices)
            };

            await updateDoc(doc(firebaseDb, 'hotels', hotelId), {
                priceRange,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating price range:', error);
            throw error;
        }
    },

    // Update hotel rating
    async updateHotelRating(hotelId: string, newRating: number, reviewCount: number): Promise<void> {
        try {
            await updateDoc(doc(firebaseDb, 'hotels', hotelId), {
                rating: newRating,
                reviewCount: reviewCount,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating hotel rating:', error);
            throw error;
        }
    },

    // Get hotels by city
    async getHotelsByCity(city: string, limitCount: number = 20): Promise<Hotel[]> {
        try {
            const hotelsQuery = query(
                collection(firebaseDb, 'hotels'),
                where('isActive', '==', true),
                where('city', '==', city),
                orderBy('rating', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(hotelsQuery);
            return querySnapshot.docs.map(doc => doc.data() as Hotel);
        } catch (error) {
            console.error('Error getting hotels by city:', error);
            throw error;
        }
    },

    // Get all hotels (admin only)
    async getAllHotels(): Promise<Hotel[]> {
        try {
            const hotelsQuery = query(
                collection(firebaseDb, 'hotels'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(hotelsQuery);
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as Hotel));
        } catch (error) {
            console.error('Error getting all hotels:', error);
            throw error;
        }
    }
};