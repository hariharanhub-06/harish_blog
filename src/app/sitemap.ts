import { MetadataRoute } from 'next';
import { db } from '@/db';

const baseUrl = 'https://hariharanhub.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${baseUrl}/forms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/live`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/smile`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    let dynamicRoutes: MetadataRoute.Sitemap = [];

    try {
        const [liveSessions, forms] = await Promise.allSettled([
            db.query.liveSessions.findMany({
                where: (s, { eq }) => eq(s.isPublished, true),
                columns: { id: true, updatedAt: true },
            }),
            db.query.forms.findMany({
                where: (f, { eq }) => eq(f.isPublished, true),
                columns: { id: true, updatedAt: true },
            }),
        ]);

        if (liveSessions.status === 'fulfilled') {
            dynamicRoutes.push(
                ...liveSessions.value.map((s) => ({
                    url: `${baseUrl}/live/${s.id}`,
                    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                }))
            );
        }

        if (forms.status === 'fulfilled') {
            dynamicRoutes.push(
                ...forms.value.map((f) => ({
                    url: `${baseUrl}/forms/${f.id}`,
                    lastModified: f.updatedAt ? new Date(f.updatedAt) : new Date(),
                    changeFrequency: 'monthly' as const,
                    priority: 0.5,
                }))
            );
        }
    } catch (err) {
        console.error('[sitemap] Failed to fetch dynamic routes:', err);
    }

    return [...staticRoutes, ...dynamicRoutes];
}
