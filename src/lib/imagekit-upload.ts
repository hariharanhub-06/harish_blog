/**
 * ImageKit Upload Helper
 * Uploads images to ImageKit CDN and returns optimized AVIF URLs
 */

interface UploadResponse {
    url: string;
    fileId: string;
    name: string;
}

/**
 * Upload an image file to ImageKit CDN
 * @param file - File object to upload
 * @param folder - Folder path in ImageKit (e.g., 'profile', 'snacks', 'projects')
 * @returns ImageKit URL with AVIF optimization parameters
 */
export async function uploadToImageKit(
    file: File,
    folder: string = 'uploads'
): Promise<string> {
    try {
        // Get ImageKit authentication signature
        const authResponse = await fetch('/api/imagekit-auth');
        if (!authResponse.ok) {
            throw new Error('Failed to get ImageKit auth');
        }
        const authData = await authResponse.json();

        // Prepare form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', `${Date.now()}_${file.name}`);
        formData.append('folder', folder);
        formData.append('signature', authData.signature);
        formData.append('expire', authData.expire.toString());
        formData.append('token', authData.token);
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');

        // Upload to ImageKit
        const uploadResponse = await fetch(
            `https://upload.imagekit.io/api/v1/files/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`ImageKit upload failed: ${error.message || 'Unknown error'}`);
        }

        const uploadData: UploadResponse = await uploadResponse.json();

        // Return URL with AVIF optimization parameters
        // f-avif: Convert to AVIF format (30% smaller than WebP)
        // q-80: 80% quality (visually identical)
        // Auto adapts size based on use case
        return `${uploadData.url}?tr=f-avif,q-80`;
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw error;
    }
}

/**
 * Get optimized ImageKit URL with specific transformations
 * @param baseUrl - Base ImageKit URL
 * @param width - Max width (optional)
 * @param quality - AVIF quality 1-100 (default: 80)
 * @returns Transformed URL
 */
export function getOptimizedImageUrl(
    baseUrl: string,
    width?: number,
    quality: number = 80
): string {
    // Remove existing query params
    const cleanUrl = baseUrl.split('?')[0];

    // Build transformation string
    const transforms = ['f-avif', `q-${quality}`];
    if (width) {
        transforms.push(`w-${width}`);
    }

    return `${cleanUrl}?tr=${transforms.join(',')}`;
}

/**
 * Upload an image from a URL to ImageKit CDN
 * @param url - Source image URL
 * @param folder - Folder path in ImageKit
 * @returns ImageKit URL
 */
export async function uploadFromUrl(
    url: string,
    folder: string = 'uploads'
): Promise<string> {
    try {
        const authResponse = await fetch('/api/imagekit-auth');
        if (!authResponse.ok) throw new Error('Failed to get ImageKit auth');
        const authData = await authResponse.json();

        const formData = new FormData();
        formData.append('file', url); // ImageKit supports passing a URL as the 'file' parameter
        formData.append('fileName', `${Date.now()}_external_img`);
        formData.append('folder', folder);
        formData.append('signature', authData.signature);
        formData.append('expire', authData.expire.toString());
        formData.append('token', authData.token);
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');

        const uploadResponse = await fetch(
            `https://upload.imagekit.io/api/v1/files/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`ImageKit URL upload failed: ${error.message || 'Unknown error'}`);
        }

        const uploadData: UploadResponse = await uploadResponse.json();
        return `${uploadData.url}?tr=f-avif,q-80`;
    } catch (error) {
        console.error('ImageKit URL upload error:', error);
        throw error;
    }
}

