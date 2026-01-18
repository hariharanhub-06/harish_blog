import { db } from './index';

/**
 * Query Cache Helper - DEPRECATED
 * We are moving to Client-Side Fetching to avoid Vercel ISR Writes.
 * These helpers are kept as reference but should be replaced by client-side fetch calls.
 */

// Simple raw queries instead of unstable_cache to avoid ISR Writes
export async function getProductsRaw() {
    return await db.query.snackProducts.findMany({
        where: (products, { eq }) => eq(products.isActive, true),
    });
}

export async function getAffiliateConfigRaw() {
    return await db.query.affiliateConfig.findFirst();
}

export async function getVendorsRaw() {
    return await db.query.vendors.findMany();
}

/**
 * Utility to invalidate specific cache tags
 * Note: Since we are moving away from unstable_cache, this may become obsolete.
 */
export async function invalidateCache(tags: string[]) {
    try {
        const { revalidateTag } = await import('next/cache');
        tags.forEach((tag) => revalidateTag(tag));
    } catch (e) {
        console.warn("revalidateTag not available in this environment");
    }
}
