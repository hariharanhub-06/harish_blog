import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

/**
 * Helper function to generate unique coupon code
 */
export function generateCouponCode(name?: string): string {
    if (name) {
        const prefix = name.split(" ")[0].toUpperCase().slice(0, 5);
        const suffix = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${suffix}`;
    }
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `HMS${randomNum}`;
}

/**
 * Helper to generate a random password
 */
export function generatePassword(): string {
    return Math.random().toString(36).slice(-8); // 8 characters
}

/**
 * Binary placement logic: Find the first available position in the tree under a specific affiliate.
 * BFS to find the first available slot.
 */
export async function findBinaryPlacement(referrerId: string | null): Promise<{ parentId: string | null, position: 'left' | 'right' | null }> {
    if (!referrerId) {
        // If no referrer, check if there's any affiliate in the system
        const countRes = await db.select({ count: count() }).from(affiliates);
        if (Number(countRes[0].count) === 0) return { parentId: null, position: null }; // First affiliate is root

        // If not first, find the very first root (one with no parent)
        const roots = await db.select({ id: affiliates.id }).from(affiliates).where(sql`parent_id IS NULL`);
        if (roots.length > 0) referrerId = roots[0].id;
        else return { parentId: null, position: null };
    }

    // BFS to find the first available slot
    let queue = [referrerId];
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = await db
            .select({ id: affiliates.id, position: affiliates.position })
            .from(affiliates)
            .where(eq(affiliates.parentId, currentId));

        const hasLeft = children.find(c => c.position === 'left');
        const hasRight = children.find(c => c.position === 'right');

        if (!hasLeft) return { parentId: currentId, position: 'left' };
        if (!hasRight) return { parentId: currentId, position: 'right' };

        // Both children exist, add them to queue to check their children
        queue.push(hasLeft.id, hasRight.id);
    }

    return { parentId: null, position: null };
}

