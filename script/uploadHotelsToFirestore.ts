// Script to upload mock hotel data to Firestore
// Run with: npx ts-node script/uploadHotelsToFirestore.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { hotels } from '../src/data/hotels';
import { firebaseConfig } from '../src/utils/firebaseInit';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadHotels() {
    for (const hotel of hotels) {
        const ref = doc(collection(db, 'hotels'), hotel.id);
        await setDoc(ref, hotel);
        console.log(`Uploaded hotel: ${hotel.name}`);
    }
}

uploadHotels().then(() => {
    console.log('All hotels uploaded!');
    process.exit(0);
}).catch((err) => {
    console.error('Error uploading hotels:', err);
    process.exit(1);
});
