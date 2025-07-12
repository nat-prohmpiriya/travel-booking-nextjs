import { create } from 'zustand';
import { SearchParams, Hotel, Destination } from '@/types';

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
    loadPopularDestinations: () => void;
    loadFeaturedHotels: () => void;
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
            // TODO: Implement Firebase search
            // For now, return mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({
                searchResults: [],
                isLoading: false
            });
        } catch (error) {
            set({
                error: 'Search failed. Please try again.',
                isLoading: false
            });
        }
    },

    loadPopularDestinations: () => {
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
            },
            {
                id: '3',
                name: 'Chiang Mai',
                image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
                startingPrice: 650,
                hotelCount: 650
            },
            {
                id: '4',
                name: 'Pattaya',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                startingPrice: 950,
                hotelCount: 450
            }
        ];

        set({ popularDestinations: mockDestinations });
    },

    loadFeaturedHotels: () => {
        const mockHotels: Hotel[] = [
            {
                id: '1',
                name: 'Luxury Resort Bangkok',
                location: 'Bangkok',
                rating: 4.8,
                pricePerNight: 2500,
                amenities: ['Pool', 'Spa', 'Gym', 'Restaurant'],
                images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'],
                description: 'Luxury resort in the heart of Bangkok'
            },
            {
                id: '2',
                name: 'Beachfront Villa Phuket',
                location: 'Phuket',
                rating: 4.9,
                pricePerNight: 3200,
                amenities: ['Beach Access', 'Pool', 'Restaurant', 'Bar'],
                images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'],
                description: 'Beautiful beachfront villa with ocean view'
            },
            {
                id: '3',
                name: 'Mountain View Hotel',
                location: 'Chiang Mai',
                rating: 4.7,
                pricePerNight: 1800,
                amenities: ['Mountain View', 'Restaurant', 'Spa'],
                images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop'],
                description: 'Peaceful mountain retreat in Chiang Mai'
            }
        ];

        set({ featuredHotels: mockHotels });
    }
}));
