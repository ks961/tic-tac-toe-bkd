import type { NextFunction, Request, Response } from "express";
import { redisClient } from "models/redis";

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
    // await redisClient.
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    next();
}