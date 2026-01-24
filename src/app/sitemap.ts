import { MetadataRoute } from 'next';

const baseUrl = 'https://hariharanhub.com';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/business/hm-snacks`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/business/hm-tech`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/business/haripicks`,
            lastModified: new Date(),
        },
    ];
}
