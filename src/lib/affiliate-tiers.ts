export const AFFILIATE_TIERS = [
    { name: "Newbie", minOrders: 0, maxOrders: 20, rate: 30, color: "from-gray-400 to-gray-500" },
    { name: "Starter", minOrders: 21, maxOrders: 50, rate: 35, color: "from-blue-400 to-blue-500" },
    { name: "Silver", minOrders: 51, maxOrders: 100, rate: 40, color: "from-gray-300 to-gray-400" },
    { name: "Golden", minOrders: 101, maxOrders: 150, rate: 45, color: "from-yellow-400 to-yellow-500" },
    { name: "Platinum", minOrders: 151, maxOrders: 180, rate: 50, color: "from-purple-400 to-purple-500" },
    { name: "Pro", minOrders: 181, maxOrders: 200, rate: 55, color: "from-pink-400 to-pink-500" },
    { name: "Elite", minOrders: 201, maxOrders: Infinity, rate: 60, color: "from-orange-500 to-red-500" },
];

export function getAffiliateTier(orderCount: number, isPaid: boolean = false) {
    if (!isPaid) return AFFILIATE_TIERS[0]; // Always Newbie if not paid
    return AFFILIATE_TIERS.find(t => orderCount >= t.minOrders && orderCount <= t.maxOrders) || AFFILIATE_TIERS[0];
}
