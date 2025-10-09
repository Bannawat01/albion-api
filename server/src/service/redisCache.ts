import { createClient, type RedisClientType } from 'redis';

export class RedisCache {
    private static instance: RedisCache;
    private client: RedisClientType;
    private isConnected = false;

    private constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379',
            socket: {
                connectTimeout: 60000,
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
            this.isConnected = true;
        });

        this.client.on('disconnect', () => {
            console.log('Disconnected from Redis');
            this.isConnected = false;
        });
    }

    static getInstance(): RedisCache {
        if (!RedisCache.instance) {
            RedisCache.instance = new RedisCache();
        }
        return RedisCache.instance;
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            } catch (error) {
                console.error('Redis connect error:', error);
            }
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.client.disconnect();
            } catch (error) {
                console.error('Redis disconnect error:', error);
            }
        }
    }

    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, value);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            console.error('Redis SET error:', error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('Redis DEL error:', error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        try {
            await this.client.expire(key, ttlSeconds);
        } catch (error) {
            console.error('Redis EXPIRE error:', error);
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.error('Redis TTL error:', error);
            return -1;
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.error('Redis KEYS error:', error);
            return [];
        }
    }

    async flushAll(): Promise<void> {
        try {
            await this.client.flushAll();
        } catch (error) {
            console.error('Redis FLUSHALL error:', error);
        }
    }

    // Cache wrapper with TTL
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        const cached = await this.get(key);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                // If parsing fails, treat as string
                return cached as unknown as T;
            }
        }

        const data = await fetcher();
        await this.set(key, JSON.stringify(data), ttlSeconds);
        return data;
    }

    // Health check
    async ping(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }

    get isReady(): boolean {
        return this.isConnected;
    }
}

export const redisCache = RedisCache.getInstance();