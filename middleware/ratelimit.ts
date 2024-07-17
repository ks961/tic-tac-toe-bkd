import type { NextFunction, Request, Response } from "express";

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(ip);
    
    next();
}