/**
 * Neon Database Optimization Configuration
 * 
 * This module provides optimized database connection settings
 * and query helpers to reduce network overhead.
 */

// Connection Optimization Settings
export const NEON_CONFIG = {
    // HTTP fetch optimization
    fetchOptions: {
        // Cache responses when possible
        cache: 'force-cache' as RequestCache,
        // Connection timeout (10 seconds)
        signal: AbortSignal.timeout(10000),
    },

    // Enable connection caching to reuse HTTP connections
    fetchConnectionCache: true,

    // Stream large result sets instead of buffering
    fullResults: true,

    // Use object mode for better Drizzle ORM integration
    arrayMode: false,
};

// Query Optimization Best Practices
export const QUERY_TIPS = {
    // Always use .limit() to prevent fetching entire tables
    useLimit: true,

    // Select only needed columns to reduce payload size
    selectSpecificColumns: true,

    // Use indexes for WHERE clauses (defined in schema)
    useIndexes: true,

    // Batch queries when possible using db.batch()
    useBatchQueries: true,
};

// Recommended cache TTLs (in seconds)
export const CACHE_TTL = {
    products: 300,        // 5 minutes
    orders: 60,           // 1 minute
    affiliates: 600,      // 10 minutes
    config: 3600,         // 1 hour
    static: 86400,        // 24 hours
};
