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
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { firebaseDb, firebaseStorage } from '@/utils/firebaseInit';
import {
  TravelDiary,
  DiaryEntry,
  CreateTravelDiaryData,
  UpdateTravelDiaryData,
  CreateDiaryEntryData,
  UpdateDiaryEntryData,
  DiaryFilters,
  DiaryEntryFilters,
  DiaryStats
} from '@/types/diary';

export const diaryService = {
  // =================== DIARY OPERATIONS ===================
  
  /**
   * Create a new travel diary
   */
  async createDiary(userId: string, data: CreateTravelDiaryData): Promise<TravelDiary> {
    const diaryRef = doc(collection(firebaseDb, 'diaries'));
    
    const diary: TravelDiary = {
      id: diaryRef.id,
      userId,
      tripName: data.tripName,
      destination: data.destination,
      description: data.description,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: Timestamp.fromDate(data.endDate),
      coverPhoto: data.coverPhoto,
      isPublic: data.isPublic,
      entries: [],
      totalEntries: 0,
      totalPhotos: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    await setDoc(diaryRef, diary);
    return diary;
  },

  /**
   * Get diary by ID
   */
  async getDiary(diaryId: string): Promise<TravelDiary | null> {
    try {
      const diaryDoc = await getDoc(doc(firebaseDb, 'diaries', diaryId));
      
      if (diaryDoc.exists()) {
        return { id: diaryDoc.id, ...diaryDoc.data() } as TravelDiary;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting diary:', error);
      throw error;
    }
  },

  /**
   * Get user's diaries with filters
   */
  async getUserDiaries(userId: string, filters: DiaryFilters = {}): Promise<TravelDiary[]> {
    try {
      let q = query(
        collection(firebaseDb, 'diaries'),
        where('userId', '==', userId)
      );

      // Apply filters
      if (filters.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', filters.isPublic));
      }

      if (filters.destination) {
        q = query(q, where('destination', '>=', filters.destination));
        q = query(q, where('destination', '<=', filters.destination + '\uf8ff'));
      }

      // Order by
      const orderByField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      q = query(q, orderBy(orderByField, orderDirection));

      // Limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const diaries: TravelDiary[] = [];

      querySnapshot.forEach((doc) => {
        diaries.push({ id: doc.id, ...doc.data() } as TravelDiary);
      });

      return diaries;
    } catch (error) {
      console.error('Error getting user diaries:', error);
      throw error;
    }
  },

  /**
   * Get public diaries
   */
  async getPublicDiaries(filters: DiaryFilters = {}): Promise<TravelDiary[]> {
    try {
      let q = query(
        collection(firebaseDb, 'diaries'),
        where('isPublic', '==', true)
      );

      if (filters.destination) {
        q = query(q, where('destination', '>=', filters.destination));
        q = query(q, where('destination', '<=', filters.destination + '\uf8ff'));
      }

      const orderByField = filters.orderBy || 'createdAt';
      const orderDirection = filters.orderDirection || 'desc';
      q = query(q, orderBy(orderByField, orderDirection));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const diaries: TravelDiary[] = [];

      querySnapshot.forEach((doc) => {
        diaries.push({ id: doc.id, ...doc.data() } as TravelDiary);
      });

      return diaries;
    } catch (error) {
      console.error('Error getting public diaries:', error);
      throw error;
    }
  },

  /**
   * Update diary
   */
  async updateDiary(diaryId: string, data: UpdateTravelDiaryData): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }

      await updateDoc(doc(firebaseDb, 'diaries', diaryId), updateData);
    } catch (error) {
      console.error('Error updating diary:', error);
      throw error;
    }
  },

  /**
   * Delete diary and all its entries
   */
  async deleteDiary(diaryId: string): Promise<void> {
    try {
      const batch = writeBatch(firebaseDb);
      
      // Delete all entries
      const entriesRef = collection(firebaseDb, 'diaries', diaryId, 'entries');
      const entriesSnapshot = await getDocs(entriesRef);
      
      entriesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete the diary
      batch.delete(doc(firebaseDb, 'diaries', diaryId));
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting diary:', error);
      throw error;
    }
  },

  // =================== ENTRY OPERATIONS ===================

  /**
   * Create diary entry
   */
  async createEntry(diaryId: string, data: CreateDiaryEntryData): Promise<DiaryEntry> {
    try {
      const entryRef = doc(collection(firebaseDb, 'diaries', diaryId, 'entries'));
      
      const entry: DiaryEntry = {
        id: entryRef.id,
        date: Timestamp.fromDate(data.date),
        title: data.title,
        content: data.content,
        photos: data.photos || [],
        location: data.location,
        weather: data.weather,
        mood: data.mood,
        tags: data.tags || [],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      await setDoc(entryRef, entry);

      // Update diary stats
      await this.updateDiaryStats(diaryId);

      return entry;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  },

  /**
   * Get diary entries
   */
  async getDiaryEntries(diaryId: string, filters: Omit<DiaryEntryFilters, 'diaryId'> = {}): Promise<DiaryEntry[]> {
    try {
      let q = query(collection(firebaseDb, 'diaries', diaryId, 'entries'));

      // Apply filters
      if (filters.mood) {
        q = query(q, where('mood', '==', filters.mood));
      }

      // Order by
      const orderByField = filters.orderBy || 'date';
      const orderDirection = filters.orderDirection || 'asc';
      q = query(q, orderBy(orderByField, orderDirection));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const entries: DiaryEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as DiaryEntry);
      });

      return entries;
    } catch (error) {
      console.error('Error getting diary entries:', error);
      throw error;
    }
  },

  /**
   * Get single entry
   */
  async getEntry(diaryId: string, entryId: string): Promise<DiaryEntry | null> {
    try {
      const entryDoc = await getDoc(doc(firebaseDb, 'diaries', diaryId, 'entries', entryId));
      
      if (entryDoc.exists()) {
        return { id: entryDoc.id, ...entryDoc.data() } as DiaryEntry;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting entry:', error);
      throw error;
    }
  },

  /**
   * Update diary entry
   */
  async updateEntry(diaryId: string, entryId: string, data: UpdateDiaryEntryData): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
      }

      await updateDoc(doc(firebaseDb, 'diaries', diaryId, 'entries', entryId), updateData);
      
      // Update diary stats
      await this.updateDiaryStats(diaryId);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  /**
   * Delete diary entry
   */
  async deleteEntry(diaryId: string, entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(firebaseDb, 'diaries', diaryId, 'entries', entryId));
      
      // Update diary stats
      await this.updateDiaryStats(diaryId);
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },

  // =================== IMAGE OPERATIONS ===================

  /**
   * Upload image to Firebase Storage
   */
  async uploadImage(file: File, diaryId: string, entryId?: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const path = entryId 
        ? `diaries/${diaryId}/entries/${entryId}/${fileName}`
        : `diaries/${diaryId}/cover/${fileName}`;
      
      const storageRef = ref(firebaseStorage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(firebaseStorage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // =================== UTILITY OPERATIONS ===================

  /**
   * Update diary statistics
   */
  async updateDiaryStats(diaryId: string): Promise<void> {
    try {
      const entriesSnapshot = await getDocs(collection(firebaseDb, 'diaries', diaryId, 'entries'));
      
      let totalPhotos = 0;
      entriesSnapshot.forEach((doc) => {
        const entry = doc.data() as DiaryEntry;
        totalPhotos += entry.photos?.length || 0;
      });

      await updateDoc(doc(firebaseDb, 'diaries', diaryId), {
        totalEntries: entriesSnapshot.size,
        totalPhotos,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating diary stats:', error);
      throw error;
    }
  },

  /**
   * Get user's diary statistics
   */
  async getUserStats(userId: string): Promise<DiaryStats> {
    try {
      const diariesSnapshot = await getDocs(
        query(collection(firebaseDb, 'diaries'), where('userId', '==', userId))
      );

      let totalEntries = 0;
      let totalPhotos = 0;
      const destinations: string[] = [];
      let longestTrip: DiaryStats['longestTrip'] = null;
      let maxDays = 0;

      for (const doc of diariesSnapshot.docs) {
        const diary = doc.data() as TravelDiary;
        totalEntries += diary.totalEntries || 0;
        totalPhotos += diary.totalPhotos || 0;
        destinations.push(diary.destination);

        // Calculate trip duration
        const days = Math.ceil(
          (diary.endDate.toDate().getTime() - diary.startDate.toDate().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (days > maxDays) {
          maxDays = days;
          longestTrip = {
            diaryId: diary.id,
            tripName: diary.tripName,
            days
          };
        }
      }

      // Count destination frequencies
      const destinationCounts = destinations.reduce((acc, dest) => {
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteDestinations = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([dest]) => dest);

      // Calculate entries this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      let entriesThisMonth = 0;
      for (const doc of diariesSnapshot.docs) {
        const entriesSnapshot = await getDocs(
          query(
            collection(firebaseDb, 'diaries', doc.id, 'entries'),
            where('createdAt', '>=', Timestamp.fromDate(thisMonth))
          )
        );
        entriesThisMonth += entriesSnapshot.size;
      }

      return {
        totalDiaries: diariesSnapshot.size,
        totalEntries,
        totalPhotos,
        totalDestinations: new Set(destinations).size,
        favoriteDestinations,
        entriesThisMonth,
        longestTrip
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  /**
   * Search diaries and entries
   */
  async searchContent(userId: string, searchTerm: string): Promise<{
    diaries: TravelDiary[];
    entries: Array<DiaryEntry & { diaryId: string; diaryName: string }>;
  }> {
    try {
      // Search diaries
      const diariesSnapshot = await getDocs(
        query(collection(firebaseDb, 'diaries'), where('userId', '==', userId))
      );

      const matchingDiaries: TravelDiary[] = [];
      const matchingEntries: Array<DiaryEntry & { diaryId: string; diaryName: string }> = [];

      for (const diaryDoc of diariesSnapshot.docs) {
        const diary = { id: diaryDoc.id, ...diaryDoc.data() } as TravelDiary;
        
        // Check if diary matches search term
        const diaryMatches = [
          diary.tripName,
          diary.destination,
          diary.description
        ].some(field => 
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (diaryMatches) {
          matchingDiaries.push(diary);
        }

        // Search entries within this diary
        const entriesSnapshot = await getDocs(collection(firebaseDb, 'diaries', diary.id, 'entries'));
        
        entriesSnapshot.forEach((entryDoc) => {
          const entry = { id: entryDoc.id, ...entryDoc.data() } as DiaryEntry;
          
          const entryMatches = [
            entry.title,
            entry.content,
            entry.location,
            ...(entry.tags || [])
          ].some(field => 
            field?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (entryMatches) {
            matchingEntries.push({
              ...entry,
              diaryId: diary.id,
              diaryName: diary.tripName
            });
          }
        });
      }

      return {
        diaries: matchingDiaries,
        entries: matchingEntries
      };
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }
};