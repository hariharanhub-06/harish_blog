import { unstable_cache } from 'next/cache';
import { db } from './index';

/**
 * Query Cache Helper
 * Wraps database queries with Next.js caching to reduce network requests to Neon
 */

// Cache product listings (revalidate every 5 minutes)
export const getCachedProducts = unstable_cache(
    async () => {
        const products = await db.query.snackProducts.findMany({
            where: (products, { eq }) => eq(products.isActive, true),
        });
        return products;
    },
    ['products-cache'],
    {
        revalidate: 300, // 5 minutes
        tags: ['products'],
    }
);

// Cache affiliate config (rarely changes, revalidate every hour)
export const getCachedAffiliateConfig = unstable_cache(
    async () => {
        const config = await db.query.affiliateConfig.findFirst();
        return config;
    },
    ['affiliate-config-cache'],
    {
        revalidate: 3600, // 1 hour
        tags: ['affiliate-config'],
    }
);

// Cache vendor list (revalidate every 10 minutes)
export const getCachedVendors = unstable_cache(
    async () => {
        const vendors = await db.query.vendors.findMany();
        return vendors;
    },
    ['vendors-cache'],
    {
        revalidate: 600, // 10 minutes
        tags: ['vendors'],
    }
);

/**
 * Utility to invalidate specific cache tags
 * Call this when data changes to force fresh queries
 */
export async function invalidateCache(tags: string[]) {
    const { revalidateTag } = await import('next/cache');
    // In this project version, revalidateTag only accepts the tag string
    tags.forEach((tag) => revalidateTag(tag));
}
