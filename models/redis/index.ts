import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});


redisClient.on('error', err => {throw new Error(`Redis Client Error: ${err}`)});

async function connectRedis() {
    if(!redisClient.isOpen) {
        await redisClient.connect();
    }
}

export { redisClient, connectRedis };