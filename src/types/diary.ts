import { Timestamp } from 'firebase/firestore';

export interface DiaryEntry {
  id: string;
  date: Timestamp;
  title: string;
  content: string;
  photos: string[];
  location?: string;
  weather?: string;
  mood?: 'happy' | 'excited' | 'peaceful' | 'adventurous' | 'tired' | 'amazed';
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TravelDiary {
  id: string;
  userId: string;
  tripName: string;
  destination: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  coverPhoto?: string;
  isPublic: boolean;
  entries: DiaryEntry[];
  totalEntries: number;
  totalPhotos: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateTravelDiaryData {
  tripName: string;
  destination: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  coverPhoto?: string;
  isPublic: boolean;
}

export interface UpdateTravelDiaryData {
  tripName?: string;
  destination?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  coverPhoto?: string;
  isPublic?: boolean;
}

export interface CreateDiaryEntryData {
  date: Date;
  title: string;
  content: string;
  photos?: string[];
  location?: string;
  weather?: string;
  mood?: DiaryEntry['mood'];
  tags?: string[];
}

export interface UpdateDiaryEntryData {
  date?: Date;
  title?: string;
  content?: string;
  photos?: string[];
  location?: string;
  weather?: string;
  mood?: DiaryEntry['mood'];
  tags?: string[];
}

export interface DiaryFilters {
  search?: string;
  destination?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  isPublic?: boolean;
  userId?: string;
  limit?: number;
  orderBy?: 'createdAt' | 'startDate' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

export interface DiaryEntryFilters {
  diaryId: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  mood?: DiaryEntry['mood'];
  tags?: string[];
  limit?: number;
  orderBy?: 'date' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

export interface DiaryStats {
  totalDiaries: number;
  totalEntries: number;
  totalPhotos: number;
  totalDestinations: number;
  favoriteDestinations: string[];
  entriesThisMonth: number;
  longestTrip: {
    diaryId: string;
    tripName: string;
    days: number;
  } | null;
}

export interface DiaryShareSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  shareCode?: string;
}

export const MOOD_COLORS: Record<DiaryEntry['mood'], string> = {
  happy: '#ffd700',      // Gold
  excited: '#ff6b6b',    // Red
  peaceful: '#51cf66',   // Green
  adventurous: '#ff8c42', // Orange
  tired: '#868e96',      // Gray
  amazed: '#7c4dff',     // Purple
};

export const MOOD_ICONS: Record<DiaryEntry['mood'], string> = {
  happy: '😊',
  excited: '🤩',
  peaceful: '😌',
  adventurous: '🗺️',
  tired: '😴',
  amazed: '🤩',
};

export const WEATHER_OPTIONS = [
  'sunny',
  'cloudy',
  'rainy',
  'snowy',
  'windy',
  'foggy',
  'stormy',
  'clear'
] as const;

export type WeatherType = typeof WEATHER_OPTIONS[number];

export const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  windy: '💨',
  foggy: '🌫️',
  stormy: '⛈️',
  clear: '🌤️',
};