// src/lib/shipping-utils.ts
// Utility to calculate shipping cost consistently across the app.

export interface ShippingItem {
    price: number;
    quantity: number;
    unit: string; // "Kg" or other (treated as piece)
    originalProduct?: { vendorId?: string | null };
}

export interface ShippingParams {
    items: ShippingItem[];
    state?: string;
    dynamicRate?: number | null; // Shiprocket rate (without packaging)
}

// Shipping rates per kilogram for various Indian states (mirrored from existing code).
const SHIPPING_RATES: Record<string, number> = {
    "Tamil Nadu": 40,
    "Kerala": 80,
    "Andhra Pradesh": 90,
    "Arunachal Pradesh": 90,
    "Assam": 90,
    "Bihar": 90,
    "Karnataka": 90,
    "Manipur": 90,
    "Chhattisgarh": 200,
    "Goa": 200,
    "Gujarat": 200,
    "Haryana": 200,
    "Himachal Pradesh": 200,
    "Jharkhand": 200,
    "Madhya Pradesh": 200,
    "Maharashtra": 200,
    "Meghalaya": 200,
    "Mizoram": 200,
    "Nagaland": 200,
    "Odisha": 200,
    "Punjab": 200,
    "Rajasthan": 200,
    "Sikkim": 200,
    "Telangana": 200,
    "Uttar Pradesh": 200,
    "Uttarakhand": 200,
    "West Bengal": 200,
    // Union Territories
    "Delhi": 200,
    "Chandigarh": 200,
    "Puducherry": 200,
    "Dadra and Nagar Haveli and Daman and Diu": 200,
    "Jammu and Kashmir": 200,
    "Ladakh": 200,
    "Lakshadweep": 200,
    "Andaman and Nicobar Islands": 200
};

/**
 * Calculate total shipping cost.
 * - Groups items by vendor (or "admin" if vendor unknown).
 * - Uses dynamicRate if provided (adds a single packaging charge of ₹40).
 * - Otherwise falls back to static per‑vendor calculation using state rates.
 */
export const calculateShipping = ({ items, state, dynamicRate }: ShippingParams): number => {
    // Group items by vendor and sum their weight.
    const vendorGroups: Record<string, number> = {};
    items.forEach((item) => {
        const vendorId = item.originalProduct?.vendorId ?? "admin";
        // Normalise unit comparison.
        // If Kg, quantity is the weight.
        // Otherwise (pieces/packs), assume each item is 0.1kg (100g)
        const weight = item.unit?.toLowerCase() === "kg"
            ? item.quantity
            : (0.1 * (item.quantity || 1));

        vendorGroups[vendorId] = (vendorGroups[vendorId] ?? 0) + weight;
    });

    const vendorIds = Object.keys(vendorGroups);

    // If we have more than one vendor, we MUST use fallback/static rates
    // because dynamic rate from Shiprocket only applies to a single pickup location.
    if (vendorIds.length > 1) {
        dynamicRate = null;
    }

    // If we have a dynamic Shiprocket rate (single vendor), apply it once + packaging.
    if (dynamicRate !== null && dynamicRate !== undefined) {
        return Math.ceil(dynamicRate + 40);
    }

    // Determine static rate per kg based on state.
    let ratePerKg = 200; // default fallback
    if (state) {
        const key = Object.keys(SHIPPING_RATES).find(
            (k) => k.toLowerCase() === state.toLowerCase()
        );
        if (key) ratePerKg = SHIPPING_RATES[key];
    }

    // Calculate shipping per vendor, adding packaging charge per vendor.
    // Couriers charge per Kg (rounded up).
    let shipping = 0;
    Object.values(vendorGroups).forEach((weight) => {
        const roundedWeight = Math.ceil(weight);
        shipping += (roundedWeight * ratePerKg) + 40;
    });
    return shipping;
};
