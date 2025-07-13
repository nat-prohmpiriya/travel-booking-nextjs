// // Script to upload mock hotel data to Firestore (Node.js/Server-side)
// import admin from 'firebase-admin';
// import serviceAccount from '../firebaseAdminKey.json';

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//     databaseURL: "https://travel-booking-867f5-default-rtdb.asia-southeast1.firebasedatabase.app"
// });

// const db = admin.firestore();

// async function uploadHotels() {
//     const hotel = {
//         id: 'hotel_test_1',
//         name: 'Test Hotel',
//         description: 'This is a test hotel for Firestore upload.',
//         location: 'Bangkok, Thailand',
//         address: '123 Main Road, Bangkok',
//         city: 'Bangkok',
//         country: 'Thailand',
//         coordinates: new admin.firestore.GeoPoint(13.7563, 100.5018),
//         rating: 4.5,
//         reviewCount: 100,
//         priceRange: { min: 1000, max: 3000 },
//         amenities: ['Free WiFi', 'Pool', 'Gym'],
//         images: [
//             'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//             'https://images.unsplash.com/photo-1465101046530-73398c7f28ca'
//         ],
//         rooms: [
//             {
//                 id: 'room1',
//                 name: 'Deluxe Room',
//                 description: 'Spacious room with king bed.',
//                 price: 2000,
//                 originalPrice: 2500,
//                 maxGuests: 2,
//                 bedType: 'King',
//                 size: 35,
//                 amenities: ['Free WiFi', 'Air Conditioning'],
//                 images: [
//                     'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
//                 ],
//                 available: 5,
//                 isActive: true
//             }
//         ],
//         contact: {
//             phone: '+66-2-000-0000',
//             email: 'test@hotel.com',
//             website: 'https://www.testhotel.com'
//         },
//         policies: {
//             checkIn: '14:00',
//             checkOut: '12:00',
//             cancellation: 'Free cancellation within 24 hours',
//             pets: false,
//             smoking: false
//         },
//         isActive: true,
//         isFeatured: false,
//         createdAt: admin.firestore.Timestamp.now(),
//         updatedAt: admin.firestore.Timestamp.now(),
//         tags: ['test', 'demo'],
//         phone: '+66-2-000-0000',
//         email: 'test@hotel.com'
//     };

//     try {
//         await db.collection('hotels').doc(hotel.id).set(hotel);
//         console.log('Uploaded hotel:', hotel);
//     } catch (err) {
//         console.error('Error uploading hotel:', err);
//     }
// }

// uploadHotels().then(() => {
//     console.log('All hotels uploaded!');
//     process.exit(0);
// }).catch((err) => {
//     console.error('Error uploading hotels:', err);
//     process.exit(1);
// });