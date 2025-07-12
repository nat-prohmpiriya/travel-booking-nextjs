// =================== COMMON/SHARED INTERFACES ===================

// =================== STORAGE INTERFACES ===================
export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}

export interface UploadResult {
    url: string;
    fullPath: string;
    name: string;
    size: number;
}

// =================== SEARCH & UI INTERFACES ===================
export interface SearchParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    adults: number;
    children: number;
    rooms: number;
    guests?: {
        adults: number;
        children: number;
    };
}

export interface Destination {
    id: string;
    name: string;
    image: string;
    startingPrice: number;
    hotelCount: number;
}


