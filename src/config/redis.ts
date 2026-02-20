import Redis from 'ioredis';

export const client = new Redis(process.env.REDIS_URL || '', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.on('connect', () => {
    console.log('\nRedis client connected successfully');
});

export const connectRedis = async () => {
    // ioredis connects automatically, but we can check the connection
    if (client.status !== 'ready' && client.status !== 'connecting') {
        await client.connect();
    }
};