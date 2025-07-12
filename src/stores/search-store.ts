import { create } from 'zustand';
import { SearchParams, Hotel, Destination } from '@/types';
import { hotelService } from '@/services/hotelService';

interface SearchState {
    searchParams: Partial<SearchParams>;
    searchResults: Hotel[];
    popularDestinations: Destination[];
    featuredHotels: Hotel[];
    isLoading: boolean;
    error: string | null;
    setSearchParams: (params: Partial<SearchParams>) => void;
    setSearchResults: (results: Hotel[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    searchHotels: () => Promise<void>;
    loadPopularDestinations: () => Promise<void>;
    loadFeaturedHotels: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
    searchParams: {},
    searchResults: [],
    popularDestinations: [],
    featuredHotels: [],
    isLoading: false,
    error: null,

    setSearchParams: (params: Partial<SearchParams>) => {
        set((state) => ({
            searchParams: { ...state.searchParams, ...params }
        }));
    },

    setSearchResults: (results: Hotel[]) => {
        set({ searchResults: results });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setError: (error: string | null) => {
        set({ error });
    },

    searchHotels: async () => {
        const { searchParams } = get();
        set({ isLoading: true, error: null });

        try {
            const filters = {
                location: searchParams.location,
                checkIn: searchParams.checkIn,
                checkOut: searchParams.checkOut,
                guests:
                    searchParams.guests
                        ? (searchParams.guests.adults ?? 1) + (searchParams.guests.children ?? 0)
                        : 1,
                rooms: searchParams.rooms,
                sortBy: 'relevance' as const
            };

            const hotels = await hotelService.searchHotels(filters);

            // Convert Firebase Hotel to our Hotel type
            const searchResults: Hotel[] = hotels.map(hotel => ({
                id: hotel.id,
                name: hotel.name,
                location: hotel.location,
                address: hotel.address ?? '',
                city: hotel.city ?? '',
                country: hotel.country ?? '',
                rating: hotel.rating,
                pricePerNight: hotel.priceRange?.min ?? 0,
                price: hotel.priceRange?.min ?? 0,
                priceRange: hotel.priceRange ?? { min: 0, max: 0 },
                amenities: hotel.amenities ?? [],
                images: hotel.images ?? [],
                description: hotel.description ?? '',
                imageUrl: hotel.images?.[0] || '',
                reviewCount: hotel.reviewCount ?? 0,
                coordinates: hotel.coordinates,
                tags: hotel.tags ?? [],
                policies: hotel.policies ?? [],
                phone: hotel.phone ?? '',
                email: hotel.email ?? '',
                rooms: hotel.rooms ?? [],
                contact: hotel.contact ?? { phone: hotel.phone ?? '', email: hotel.email ?? '' },
                isActive: hotel.isActive ?? true,
                isFeatured: hotel.isFeatured ?? false,
                createdAt: hotel.createdAt ?? new Date().toISOString(),
                updatedAt: hotel.updatedAt ?? new Date().toISOString(),
                distance: 0 // TODO: Calculate distance if coordinates available
            }));

            set({
                searchResults,
                isLoading: false
            });
        } catch (error) {
            console.error('Search error:', error);
            set({
                error: 'Search failed. Please try again.',
                isLoading: false
            });
        }
    },

    loadPopularDestinations: async () => {
        try {
            const destinations = await hotelService.getPopularDestinations(8);

            // Convert to our Destination type with mock pricing
            const popularDestinations: Destination[] = destinations.map(dest => ({
                id: dest.id,
                name: dest.name,
                image: dest.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                startingPrice: Math.floor(Math.random() * 1000) + 500, // Mock price
                hotelCount: dest.count
            }));

            set({ popularDestinations });
        } catch (error) {
            console.error('Error loading destinations:', error);
            // Fallback to mock data
            const mockDestinations: Destination[] = [
                {
                    id: '1',
                    name: 'Bangkok',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                    startingPrice: 850,
                    hotelCount: 2500
                },
                {
                    id: '2',
                    name: 'Phuket',
                    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop',
                    startingPrice: 1200,
                    hotelCount: 800
                }
            ];
            set({ popularDestinations: mockDestinations });
        }
    },

    loadFeaturedHotels: async () => {
        try {
            const hotels = await hotelService.getFeaturedHotels(6);

            // Convert Firebase Hotel to our Hotel type
            const featuredHotels: Hotel[] = hotels.map(hotel => ({
                id: hotel.id,
                name: hotel.name,
                location: hotel.location,
                address: hotel.address ?? '',
                city: hotel.city ?? '',
                country: hotel.country ?? '',
                rating: hotel.rating,
                pricePerNight: hotel.priceRange?.min ?? 0,
                price: hotel.priceRange?.min ?? 0,
                priceRange: hotel.priceRange ?? { min: 0, max: 0 },
                amenities: hotel.amenities ?? [],
                images: hotel.images ?? [],
                description: hotel.description ?? '',
                imageUrl: hotel.images?.[0] || '',
                reviewCount: hotel.reviewCount ?? 0,
                coordinates: hotel.coordinates,
                tags: hotel.tags ?? [],
                policies: hotel.policies ?? [],
                phone: hotel.phone ?? '',
                email: hotel.email ?? '',
                rooms: hotel.rooms ?? [],
                contact: hotel.contact ?? { phone: hotel.phone ?? '', email: hotel.email ?? '' },
                isActive: hotel.isActive ?? true,
                isFeatured: hotel.isFeatured ?? true,
                createdAt: hotel.createdAt ?? new Date().toISOString(),
                updatedAt: hotel.updatedAt ?? new Date().toISOString()
            }));

            set({ featuredHotels });
        } catch (error) {
            console.error('Error loading featured hotels:', error);
            // Fallback to mock data
            const mockHotels: Hotel[] = [
                {
                    id: '1',
                    name: 'Luxury Resort Bangkok',
                    location: 'Bangkok',
                    address: '123 Sukhumvit Rd',
                    city: 'Bangkok',
                    country: 'Thailand',
                    rating: 4.8,
                    priceRange: { min: 2500, max: 5000 },
                    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant'],
                    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'],
                    description: 'Luxury resort in the heart of Bangkok',
                    reviewCount: 1247,
                    coordinates: undefined,
                    tags: ['Luxury', 'Bangkok'],
                    phone: '+66 2 123 4567',
                    email: 'info@luxuryresort.com',
                    rooms: [],
                    contact: { phone: '+66 2 123 4567', email: 'info@luxuryresort.com' },
                    isActive: true,
                    isFeatured: true,
                    policies: {
                        checkIn: '14:00',
                        checkOut: '12:00',
                        cancellation: 'Free cancellation within 24 hours',
                        pets: false as boolean,
                        smoking: false as boolean
                    },
                    createdAt: (await import('firebase/firestore')).Timestamp.now(),
                    updatedAt: (await import('firebase/firestore')).Timestamp.now()
                }
            ];
            set({ featuredHotels: mockHotels });
        }
    }
}));
