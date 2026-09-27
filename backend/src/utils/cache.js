let redis = null;
let redisAvailable = false;

if (process.env.REDIS_URL) {
    const Redis = require("ioredis");
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        },
    });

    redis.on("error", (err) => {
        if (err.message.includes("ECONNREFUSED")) {
            console.warn("Redis not available. Caching disabled.");
        }
        redisAvailable = false;
    });

    redis.on("connect", () => {
        redisAvailable = true;
    });
}

const CACHE_TTL = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 1800,
};

async function cacheGet(key) {
    if (!redis || !redisAvailable) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (_) {
        return null;
    }
}

async function cacheSet(key, value, ttl = CACHE_TTL.MEDIUM) {
    if (!redis || !redisAvailable) return;
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (_) {}
}

async function cacheDel(key) {
    if (!redis || !redisAvailable) return;
    try {
        await redis.del(key);
    } catch (_) {}
}

async function cacheDelPattern(pattern) {
    if (!redis || !redisAvailable) return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length) await redis.del(...keys);
    } catch (_) {}
}

module.exports = { redis, cacheGet, cacheSet, cacheDel, cacheDelPattern, CACHE_TTL, redisAvailable };