import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    uploadBytesResumable,
    getMetadata
} from 'firebase/storage';
import { firebaseStorage } from '@/utils/firebaseInit';
import { UploadProgress, UploadResult } from '@/types';

export const storageService = {
    // Upload profile picture
    async uploadProfilePicture(
        userId: string,
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('File size must be less than 5MB');
            }

            // Create unique filename
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `profile_${timestamp}.${fileExtension}`;
            const filePath = `users/${userId}/profile/${fileName}`;

            // Create storage reference
            const storageRef = ref(firebaseStorage, filePath);

            // Upload with progress tracking
            if (onProgress) {
                const uploadTask = uploadBytesResumable(storageRef, file);

                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress: UploadProgress = {
                                bytesTransferred: snapshot.bytesTransferred,
                                totalBytes: snapshot.totalBytes,
                                percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            };
                            onProgress(progress);
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            reject(error);
                        },
                        async () => {
                            try {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                const metadata = await getMetadata(uploadTask.snapshot.ref);

                                resolve({
                                    url: downloadURL,
                                    fullPath: filePath,
                                    name: fileName,
                                    size: metadata.size
                                });
                            } catch (error) {
                                reject(error);
                            }
                        }
                    );
                });
            } else {
                // Simple upload without progress
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                const metadata = await getMetadata(snapshot.ref);

                return {
                    url: downloadURL,
                    fullPath: filePath,
                    name: fileName,
                    size: metadata.size
                };
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    },

    // Upload multiple images (for hotels, etc.)
    async uploadMultipleImages(
        folder: string,
        files: File[],
        onProgress?: (fileIndex: number, progress: UploadProgress) => void
    ): Promise<UploadResult[]> {
        try {
            const uploadPromises = files.map(async (file, index) => {
                const timestamp = Date.now();
                const fileExtension = file.name.split('.').pop();
                const fileName = `${timestamp}_${index}.${fileExtension}`;
                const filePath = `${folder}/${fileName}`;

                const storageRef = ref(firebaseStorage, filePath);

                if (onProgress) {
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    return new Promise<UploadResult>((resolve, reject) => {
                        uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                const progress: UploadProgress = {
                                    bytesTransferred: snapshot.bytesTransferred,
                                    totalBytes: snapshot.totalBytes,
                                    percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                                };
                                onProgress(index, progress);
                            },
                            (error) => reject(error),
                            async () => {
                                try {
                                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                    const metadata = await getMetadata(uploadTask.snapshot.ref);

                                    resolve({
                                        url: downloadURL,
                                        fullPath: filePath,
                                        name: fileName,
                                        size: metadata.size
                                    });
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        );
                    });
                } else {
                    const snapshot = await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(snapshot.ref);
                    const metadata = await getMetadata(snapshot.ref);

                    return {
                        url: downloadURL,
                        fullPath: filePath,
                        name: fileName,
                        size: metadata.size
                    };
                }
            });

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            throw error;
        }
    },

    // Delete file from storage
    async deleteFile(filePath: string): Promise<void> {
        try {
            const storageRef = ref(firebaseStorage, filePath);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    // Delete old profile picture and upload new one
    async replaceProfilePicture(
        userId: string,
        newFile: File,
        oldFilePath?: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        try {
            // Delete old profile picture if exists
            if (oldFilePath) {
                try {
                    await this.deleteFile(oldFilePath);
                } catch (error) {
                    console.warn('Could not delete old profile picture:', error);
                }
            }

            // Upload new profile picture
            return await this.uploadProfilePicture(userId, newFile, onProgress);
        } catch (error) {
            console.error('Error replacing profile picture:', error);
            throw error;
        }
    },

    // Get file metadata
    async getFileMetadata(filePath: string) {
        try {
            const storageRef = ref(firebaseStorage, filePath);
            return await getMetadata(storageRef);
        } catch (error) {
            console.error('Error getting file metadata:', error);
            throw error;
        }
    },

    // Validate image file
    validateImageFile(file: File): { isValid: boolean; error?: string } {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return { isValid: false, error: 'Only image files are allowed' };
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { isValid: false, error: 'File size must be less than 5MB' };
        }

        // Check image dimensions (optional, requires creating image element)
        return { isValid: true };
    },

    // Generate optimized file name
    generateFileName(originalName: string, prefix: string = ''): string {
        const timestamp = Date.now();
        const fileExtension = originalName.split('.').pop();
        return prefix ? `${prefix}_${timestamp}.${fileExtension}` : `${timestamp}.${fileExtension}`;
    }
};