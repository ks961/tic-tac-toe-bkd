import { otpVerificationController } from "controllers/public/otp";
import { Router } from "express";
import { rateLimit } from "middleware/ratelimit";


const router = Router();

router.post("/verify", rateLimit, otpVerificationController);

export default router;