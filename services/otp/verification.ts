import { redisClient } from "models/redis";
import { RuntimeError } from "typing/typing";

export async function validateOtp(sessionId: string, otp: (number | string)): Promise<void> {

    if(typeof otp === "string")
        otp = parseInt(otp);

    const storedOtp = await redisClient.get(sessionId);

    if(!storedOtp) 
        throw new RuntimeError("Invalid session Id", 400);

    const iStoredOtp = parseInt(storedOtp);

    if(iStoredOtp !== otp)
        throw new RuntimeError("Invalid otp", 400);

    redisClient.del(sessionId);
}