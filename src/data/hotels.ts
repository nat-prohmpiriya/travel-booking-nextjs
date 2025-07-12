// Mock hotel data for initial Firestore upload and local development
// TypeScript interface from copilot-instructions.md
import { Timestamp, GeoPoint } from 'firebase/firestore';
import { Hotel, HotelRoom } from '../services/hotelService';

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
            id: `room${Date.now()}${i}`,
            name: names[Math.floor(Math.random() * names.length)] + ' Room',
            description: 'Comfortable room with all amenities.',
            price: Math.floor(Math.random() * 3000) + 1000,
            originalPrice: undefined,
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
    return {
        id: `hotel${i + 1}`,
        name,
        description: `${name} is a top-rated hotel in ${city}, Thailand. Enjoy luxury and comfort with our premium amenities and services.`,
        location: `${city}, Thailand`,
        address: `${Math.floor(Math.random() * 200) + 1} Main Road, ${city}`,
        city,
        country: 'Thailand',
        coordinates: new GeoPoint(13.7 + Math.random(), 100.5 + Math.random()),
        rating: +(4 + Math.random()).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500) + 10,
        priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
        },
        amenities: randomAmenities(),
        images: [
            `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80&sig=${i}`,
            `https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80&sig=${i}`
        ],
        rooms,
        contact: {
            phone: `+66-2-000${1000 + i}`,
            email: `info${i + 1}@${city.toLowerCase()}grandhotel.com`,
            website: `https://www.${city.toLowerCase()}grandhotel.com`
        },
        policies: {
            checkIn: '14:00',
            checkOut: '12:00',
            cancellation: 'Free cancellation up to 24 hours before check-in.',
            pets: Math.random() > 0.7,
            smoking: Math.random() > 0.8
        },
        isActive: true,
        isFeatured: Math.random() > 0.8,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
    };
});
