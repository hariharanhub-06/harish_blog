import { MetadataRoute } from 'next';

const baseUrl = 'https://hariharanhub.com';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
    ];
}
