// Mock hotel data for initial Firestore upload and local development
// TypeScript interface from copilot-instructions.md
import admin from 'firebase-admin';
import { Hotel, HotelRoom } from '../types';
import { randomUUID } from 'crypto';

function randomAmenities() {
    const all = [
        'Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar', 'Parking', 'Breakfast', 'Beach Access', 'Kids Club', 'Mountain View', 'Pet Friendly', 'Laundry', 'Room Service', 'Air Conditioning'
    ];
    return all.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
}

function randomRooms(): HotelRoom[] {
    const beds = ['King', 'Queen', 'Twin', 'Single'];
    const names = ['Deluxe', 'Suite', 'Standard', 'Family', 'Superior'];
    const rooms: HotelRoom[] = [];
    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
        rooms.push({
            id: `room-${randomUUID()}`,
            name: names[Math.floor(Math.random() * names.length)] + ' Room',
            description: 'Comfortable room with all amenities.',
            price: Math.floor(Math.random() * 3000) + 1000,
            originalPrice: Math.floor(Math.random() * 4000) + 1200,
            maxGuests: Math.floor(Math.random() * 3) + 2,
            bedType: beds[Math.floor(Math.random() * beds.length)],
            size: Math.floor(Math.random() * 40) + 20,
            amenities: randomAmenities(),
            images: [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                'https://images.unsplash.com/photo-1465101046530-73398c7f28ca'
            ],
            available: Math.floor(Math.random() * 10) + 1,
            isActive: true
        });
    }
    return rooms;
}

export const hotels: Hotel[] = Array.from({ length: 50 }, (_, i) => {
    const cityList = ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Koh Samui', 'Hua Hin', 'Krabi', 'Rayong', 'Ayutthaya', 'Sukhothai'];
    const city = cityList[i % cityList.length];
    const name = `${city} Grand Hotel ${i + 1}`;
    const rooms = randomRooms();
    const prices = rooms.map(r => r.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    return {
        id: `hotel-${randomUUID()}`,
        name,
        description: `${name} is a top-rated hotel in ${city}, Thailand. Enjoy luxury and comfort with our premium amenities and services.`,
        location: `${city}, Thailand`,
        address: `${Math.floor(Math.random() * 200) + 1} Main Road, ${city}`,
        city,
        country: 'Thailand',
        coordinates: new admin.firestore.GeoPoint(13.75 + Math.random(), 100.5 + Math.random()),
        rating: Math.round((4 + Math.random()) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 500) + 10,
        priceRange: {
            min: minPrice,
            max: maxPrice
        },
        amenities: randomAmenities(),
        images: [
            `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80&sig=${i}`,
            `https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80&sig=${i}`
        ],
        rooms,
        contact: {
            phone: `+66-2-000-000${i % 10}`,
            email: `info${i}@${city.toLowerCase().replace(/\s/g, '')}-grand.com`,
            website: `https://www.${city.toLowerCase().replace(/\s/g, '')}-grand.com`
        },
        policies: {
            checkIn: '14:00',
            checkOut: '12:00',
            cancellation: 'Free cancellation within 24 hours',
            pets: Boolean(Math.random() > 0.7),
            smoking: Boolean(Math.random() > 0.5)
        },
        isActive: true,
        isFeatured: Boolean(Math.random() > 0.8),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        tags: ['luxury', 'family', 'business'].filter(() => Math.random() > 0.5),
        phone: `+66-2-000-000${i % 10}`,
        email: `info${i}@${city.toLowerCase().replace(/\s/g, '')}-grand.com`
    };
});
