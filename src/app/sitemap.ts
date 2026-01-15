import { Metadata, Viewport } from 'next';

const baseUrl = 'https://hariharanhub.com';

export default function sitemap() {
    const routes = [
        '',
        '/business/hm-snacks',
        '/business/hm-tech',
        '/business/haripicks',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }));

    return [...routes];
}
