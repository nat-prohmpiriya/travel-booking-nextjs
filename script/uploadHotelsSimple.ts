// Script to upload mock hotel data to Firestore (simplified version)
// Run with: npx tsx script/uploadHotelsSimple.ts
// Use firebase-admin for server-side upload
import admin from 'firebase-admin';
import serviceAccount from '../firebaseAdminKey.json';
import { hotels } from '../src/data/hotels';
import { Hotel } from '@/types';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://travel-booking-867f5-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();

async function uploadHotels() {
    console.log('Starting hotel upload...');
    console.log(`Total hotels to upload: ${hotels.length}`);
    function validateHotel(hotel: Hotel) {
        for (const [key, value] of Object.entries(hotel)) {
            if (value === undefined || value === null || Number.isNaN(value) || value === Infinity || value === -Infinity) {
                console.error(`❌ Field ${key} in hotel ${hotel.id} is invalid:`, value);
            }
            if (Array.isArray(value)) {
                value.forEach((item, idx) => {
                    if (item === undefined || item === null || Number.isNaN(item) || item === Infinity || item === -Infinity) {
                        console.error(`❌ Array field ${key}[${idx}] in hotel ${hotel.id} is invalid:`, item);
                    }
                    if (typeof item === 'object' && item !== null) {
                        Object.entries(item).forEach(([k, v]) => {
                            if (v === undefined || v === null || Number.isNaN(v) || v === Infinity || v === -Infinity) {
                                console.error(`❌ Object field ${key}[${idx}].${k} in hotel ${hotel.id} is invalid:`, v);
                            }
                        });
                    }
                });
            }
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.entries(value).forEach(([k, v]) => {
                    if (v === undefined || v === null || Number.isNaN(v) || v === Infinity || v === -Infinity) {
                        console.error(`❌ Object field ${key}.${k} in hotel ${hotel.id} is invalid:`, v);
                    }
                });
            }
        }
    }

    for (let i = 0; i < hotels.length; i++) {
        const hotel = hotels[i];
        validateHotel(hotel);
        try {
            await db.collection('hotels').add(hotel);
            console.log(`✅ [${i + 1}/${hotels.length}] Uploaded hotel: ${hotel.name}`);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`❌ [${i + 1}/${hotels.length}] Failed to upload hotel: ${hotel.name}`, errorMsg);
            console.dir(hotel, { depth: null });
        }
    }
}

uploadHotels().then(() => {
    console.log('🎉 All hotels uploaded successfully!');
    process.exit(0);
}).catch((err) => {
    console.error('💥 Error uploading hotels:', err);
    process.exit(1);
});
