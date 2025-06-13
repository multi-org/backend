import {createClient} from 'redis';

export const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

export const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
        console.log('\nRedis client connected successfully');
    }
};