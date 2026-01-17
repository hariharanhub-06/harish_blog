// YouTube URL Parser Service (No API Required)
// Extracts video IDs and generates thumbnail URLs from YouTube's pattern

/**
 * Extract video ID from YouTube URL
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
 */
export function extractVideoId(url: string): string | null {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?]+)/,
        /youtube\.com\/shorts\/([^?]+)/,
        /youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extract playlist ID from YouTube URL
 * Supports: youtube.com/playlist?list=ID
 */
export function extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 * YouTube has predictable thumbnail URLs - no API needed!
 * Quality options: maxresdefault (1920x1080), sddefault (640x480), hqdefault (480x360)
 */
export function generateThumbnailUrl(videoId: string, quality: 'max' | 'sd' | 'hq' = 'max'): string {
    const qualityMap = {
        max: 'maxresdefault',
        sd: 'sddefault',
        hq: 'hqdefault',
    };

    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get video data from URL (no API required)
 * Returns video ID and auto-generated thumbnail
 * Title and description must be entered manually by admin
 */
export function getVideoDataFromUrl(url: string): { videoId: string; thumbnailUrl: string } | null {
    const videoId = extractVideoId(url);

    if (!videoId) {
        return null;
    }

    return {
        videoId,
        thumbnailUrl: generateThumbnailUrl(videoId),
    };
}
